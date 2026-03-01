from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field
from typing import Any


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskStatus(str, Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"
    blocked = "blocked"


class Project(BaseModel):
    id: str
    name: str
    tags: list[str] = Field(default_factory=list)
    memory_budget_gb: float


class ExecutionStep(BaseModel):
    id: str
    command: str
    requires_proxy: bool = True


class ExecutionGraph(BaseModel):
    task_id: str
    steps: list[ExecutionStep]


class Task(BaseModel):
    id: str
    project_id: str
    description: str
    risk: RiskLevel
    graph: ExecutionGraph
    estimated_memory_gb: float
    status: TaskStatus
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Snapshot(BaseModel):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reason: str
    state: dict[str, Any]


class CreateTaskRequest(BaseModel):
    project_id: str
    description: str
    risk: RiskLevel
    graph: ExecutionGraph
    estimated_memory_gb: float = 1.0
    actor: str = "system"
    simulated: bool = False


class CreateProjectRequest(BaseModel):
    name: str
    tags: list[str] = Field(default_factory=list)
    memory_budget_gb: float


class SnapshotRequest(BaseModel):
    reason: str = "manual"


class RollbackRequest(BaseModel):
    snapshot_id: str
    actor: str = "system"
