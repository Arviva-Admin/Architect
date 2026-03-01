from __future__ import annotations

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from .models import CreateProjectRequest, CreateTaskRequest, RollbackRequest, SnapshotRequest
from .runtime import ACCFRuntime
from .ws import ACCFEventBus

router = APIRouter(prefix="/api/accf", tags=["accf"])
ws_router = APIRouter(tags=["accf-ws"])
runtime = ACCFRuntime()
event_bus = ACCFEventBus()


@router.get("/health")
async def accf_health() -> dict:
    return {"ok": True, "module": "accf", "metrics": runtime.metrics()}


@router.post("/projects")
async def create_project(payload: CreateProjectRequest):
    return runtime.create_project(payload)


@router.get("/projects")
async def list_projects():
    return runtime.list_projects()


@router.post("/tasks")
async def create_task(payload: CreateTaskRequest):
    try:
        task = runtime.create_task(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    await event_bus.publish({"event": "task.completed", "task": task.model_dump(mode="json"), "simulated": payload.simulated})
    return {"task": task, "simulated": payload.simulated, "metrics": runtime.metrics()}


@router.post("/snapshots")
async def create_snapshot(payload: SnapshotRequest):
    return runtime.create_snapshot(payload.reason)


@router.post("/rollback")
async def rollback(payload: RollbackRequest):
    try:
        snapshot = runtime.rollback(payload.snapshot_id, actor=payload.actor)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"rolled_back_to": snapshot.id}


@ws_router.websocket("/ws/accf")
async def ws_accf(websocket: WebSocket) -> None:
    await event_bus.connect(websocket)
    try:
        await websocket.send_json({"event": "connected", "scope": "accf"})
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        await event_bus.disconnect(websocket)
