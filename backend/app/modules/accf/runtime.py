from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from uuid import uuid4

from .models import (
    CreateProjectRequest,
    CreateTaskRequest,
    Project,
    RiskLevel,
    Snapshot,
    Task,
    TaskStatus,
)

# Architecture section: RAM hard guard
MAX_RAM_GB = 35.0


@dataclass(frozen=True)
class PolicyDecision:
    allowed: bool
    reason: str


class ProxyPolicy:
    """Architecture section: Proxy policy allowlist/denylist."""

    allow_prefixes = ("sandbox://", "fs://workspace/", "db://mongo/")
    deny_tokens = ("rm -rf /", "shutdown", "mkfs", "reboot")

    def evaluate(self, command: str) -> PolicyDecision:
        normalized = command.strip().lower()
        if any(token in normalized for token in self.deny_tokens):
            return PolicyDecision(False, "denylist token detected")
        if not any(normalized.startswith(prefix) for prefix in self.allow_prefixes):
            return PolicyDecision(False, "command target outside allowlist")
        return PolicyDecision(True, "allowed")


class ShadowExecutor:
    """Architecture section: shadow run before apply."""

    def simulate(self, task: Task) -> PolicyDecision:
        if not task.graph.steps:
            return PolicyDecision(False, "execution graph has no steps")
        for step in task.graph.steps:
            if "danger" in step.command.lower():
                return PolicyDecision(False, f"unsafe command marker in step {step.id}")
        return PolicyDecision(True, "shadow simulation passed")


class AuditLogger:
    """Architecture section: JSONL audit trail."""

    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def write(self, event: dict) -> None:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **event,
        }
        with self._lock:
            with self.file_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(payload, ensure_ascii=False) + "\n")


class ACCFRuntime:
    def __init__(self, audit_log_path: Path | None = None) -> None:
        self.projects: dict[str, Project] = {}
        self.tasks: dict[str, Task] = {}
        self.snapshots: dict[str, Snapshot] = {}
        self.current_ram_gb: float = 0.0
        self.autonomy_level: str = "A1"
        self.proxy_policy = ProxyPolicy()
        self.shadow_executor = ShadowExecutor()
        self.audit = AuditLogger(audit_log_path or Path("backend/data/accf_audit.jsonl"))
        self._lock = Lock()

    def create_project(self, req: CreateProjectRequest) -> Project:
        project = Project(id=str(uuid4()), name=req.name, tags=req.tags, memory_budget_gb=req.memory_budget_gb)
        with self._lock:
            self.projects[project.id] = project
        self.audit.write({"event": "project.create", "project_id": project.id, "decision": "accepted", "diff": project.model_dump()})
        return project

    def list_projects(self) -> list[Project]:
        return list(self.projects.values())

    def set_ram(self, value: float) -> None:
        if value > MAX_RAM_GB:
            raise ValueError(f"RAM hard guard triggered: {value}GB exceeds {MAX_RAM_GB}GB")
        self.current_ram_gb = value

    def create_snapshot(self, reason: str) -> Snapshot:
        state = {
            "projects": [p.model_dump() for p in self.projects.values()],
            "tasks": [t.model_dump(mode='json') for t in self.tasks.values()],
            "current_ram_gb": self.current_ram_gb,
            "autonomy_level": self.autonomy_level,
        }
        snapshot = Snapshot(id=str(uuid4()), reason=reason, state=state)
        with self._lock:
            self.snapshots[snapshot.id] = snapshot
        self.audit.write({"event": "snapshot.create", "snapshot_id": snapshot.id, "decision": "accepted", "diff": {"reason": reason}})
        return snapshot

    def rollback(self, snapshot_id: str, actor: str) -> Snapshot:
        snapshot = self.snapshots.get(snapshot_id)
        if not snapshot:
            raise ValueError(f"snapshot {snapshot_id} not found")
        with self._lock:
            self.projects = {p["id"]: Project(**p) for p in snapshot.state["projects"]}
            self.tasks = {t["id"]: Task(**t) for t in snapshot.state["tasks"]}
            self.current_ram_gb = float(snapshot.state["current_ram_gb"])
            self.autonomy_level = str(snapshot.state.get("autonomy_level", "A1"))
        self.audit.write({"event": "snapshot.rollback", "snapshot_id": snapshot.id, "actor": actor, "decision": "accepted", "diff": {"restored": True}})
        return snapshot

    def create_task(self, req: CreateTaskRequest) -> Task:
        if req.project_id not in self.projects:
            raise ValueError("project not found")
        if req.estimated_memory_gb > MAX_RAM_GB:
            raise ValueError(f"RAM hard guard triggered: estimated={req.estimated_memory_gb}GB exceeds {MAX_RAM_GB}GB")

        if req.risk == RiskLevel.high and self.autonomy_level not in {"A4"}:
            raise ValueError("autonomy gate blocked high-risk task for current level")

        task = Task(
            id=str(uuid4()),
            project_id=req.project_id,
            description=req.description,
            risk=req.risk,
            graph=req.graph,
            estimated_memory_gb=req.estimated_memory_gb,
            status=TaskStatus.queued,
        )

        shadow_result = self.shadow_executor.simulate(task)
        if not shadow_result.allowed:
            self.audit.write({"event": "task.shadow", "task_id": task.id, "actor": req.actor, "decision": "rejected", "diff": {"reason": shadow_result.reason}})
            raise ValueError(f"shadow mode rejected task: {shadow_result.reason}")

        for step in task.graph.steps:
            decision = self.proxy_policy.evaluate(step.command)
            if not decision.allowed:
                self.audit.write({"event": "task.policy", "task_id": task.id, "actor": req.actor, "decision": "rejected", "diff": {"step": step.id, "reason": decision.reason}})
                raise ValueError(f"proxy policy rejected step {step.id}: {decision.reason}")

        if req.simulated:
            task.status = TaskStatus.completed
            self.audit.write({"event": "task.simulated", "task_id": task.id, "actor": req.actor, "decision": "accepted", "diff": {"simulated": True}})
            return task

        self.tasks[task.id] = task
        task.status = TaskStatus.running
        task.status = TaskStatus.completed
        self.audit.write({"event": "task.apply", "task_id": task.id, "actor": req.actor, "decision": "accepted", "diff": {"status": task.status.value}})
        return task

    def metrics(self) -> dict:
        return {
            "ram_budget_gb": MAX_RAM_GB,
            "current_ram_gb": self.current_ram_gb,
            "active_tasks": len([t for t in self.tasks.values() if t.status == TaskStatus.running]),
            "total_tasks": len(self.tasks),
            "autonomy_level": self.autonomy_level,
        }
