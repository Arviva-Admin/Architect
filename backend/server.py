"""Autonomous Cognitive Control Fabric - Main FastAPI Server"""
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone

# Import core modules
from core.control_kernel import control_kernel, AutonomyLevel, ExecutionStatus
from core.cognitive_engine import cognitive_engine
from core.state_graph import state_graph
from core.shadow_world import shadow_world
from core.rollback_manager import rollback_manager
from core.project_indexer import project_indexer

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="Autonomous Cognitive Control Fabric",
    description="Meta-layer control system for autonomous AI-driven development",
    version="1.0.0"
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= Pydantic Models =============

class AutonomyLevelUpdate(BaseModel):
    level: str

class OperationValidation(BaseModel):
    type: str
    scope: str = "local"
    description: str = ""

class CognitiveQuery(BaseModel):
    id: Optional[str] = None
    type: str
    data: Dict[str, Any] = {}

class GraphQuery(BaseModel):
    type: str
    node_id: Optional[str] = None
    source: Optional[str] = None
    target: Optional[str] = None

class SimulationCreate(BaseModel):
    operation: Dict[str, Any]

class SnapshotCreate(BaseModel):
    description: str = ""
    tags: List[str] = []

class ProjectCreate(BaseModel):
    name: str
    type: str
    language: str
    status: str = "active"
    complexity: str = "medium"
    metadata: Dict[str, Any] = {}

# ============= API Routes =============

@api_router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Autonomous Cognitive Control Fabric API",
        "version": "1.0.0",
        "status": "operational"
    }

@api_router.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "components": {
            "control_kernel": control_kernel.status,
            "cognitive_engine": cognitive_engine.status,
            "state_graph": "active",
            "shadow_world": shadow_world.status,
            "rollback_manager": rollback_manager.status
        }
    }

# ============= Control Kernel Endpoints =============

@api_router.get("/control-kernel/status")
async def get_control_kernel_status():
    """Get Control Kernel status"""
    return control_kernel.get_status()

@api_router.post("/control-kernel/autonomy-level")
async def set_autonomy_level(data: AutonomyLevelUpdate):
    """Set autonomy level (A0-A4)"""
    try:
        level = AutonomyLevel(data.level)
        result = control_kernel.set_autonomy_level(level)
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid autonomy level: {data.level}")

@api_router.post("/control-kernel/validate")
async def validate_operation(operation: OperationValidation):
    """Validate operation against safety policies"""
    result = control_kernel.validate_operation(operation.model_dump())
    return result

@api_router.get("/control-kernel/execution-log")
async def get_execution_log(limit: int = 50):
    """Get execution log"""
    log = control_kernel.execution_log[-limit:]
    return {"log": log, "total": len(control_kernel.execution_log)}

# ============= Cognitive Engine Endpoints =============

@api_router.get("/cognitive-engine/status")
async def get_cognitive_engine_status():
    """Get Cognitive Engine status"""
    return cognitive_engine.get_status()

@api_router.post("/cognitive-engine/reason")
async def perform_reasoning(query: CognitiveQuery):
    """Perform fast reasoning on query"""
    query_dict = query.model_dump()
    if not query_dict.get("id"):
        query_dict["id"] = str(uuid.uuid4())
    
    result = await cognitive_engine.reason(query_dict)
    return result

@api_router.post("/cognitive-engine/self-improve")
async def trigger_self_improvement(feedback: Dict[str, Any]):
    """Trigger self-improvement"""
    result = cognitive_engine.self_improve(feedback)
    return result

@api_router.get("/cognitive-engine/metrics")
async def get_cognitive_metrics():
    """Get cognitive engine performance metrics"""
    return cognitive_engine.performance_metrics

# ============= State Graph Endpoints =============

@api_router.post("/state-graph/query")
async def query_state_graph(query: GraphQuery):
    """Query state graph"""
    result = state_graph.query_graph(query.model_dump())
    return result

@api_router.get("/state-graph/full")
async def get_full_graph():
    """Get full state graph for visualization"""
    return state_graph.get_full_graph()

@api_router.get("/state-graph/stats")
async def get_graph_stats():
    """Get graph statistics"""
    return state_graph.get_stats()

@api_router.get("/state-graph/node/{node_id}")
async def get_graph_node(node_id: str):
    """Get specific node data"""
    node = state_graph.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

# ============= Shadow World Endpoints =============

@api_router.get("/shadow-world/status")
async def get_shadow_world_status():
    """Get Shadow World status"""
    return shadow_world.get_status()

@api_router.post("/shadow-world/simulation")
async def create_simulation(data: SimulationCreate):
    """Create new simulation"""
    result = shadow_world.create_simulation(data.operation)
    return result

@api_router.post("/shadow-world/simulation/{simulation_id}/run")
async def run_simulation(simulation_id: str):
    """Run simulation"""
    result = shadow_world.run_simulation(simulation_id)
    return result

@api_router.get("/shadow-world/simulation/{simulation_id}")
async def get_simulation(simulation_id: str):
    """Get simulation details"""
    simulation = shadow_world.get_simulation(simulation_id)
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return simulation

@api_router.get("/shadow-world/simulations")
async def list_simulations():
    """List all simulations"""
    return {"simulations": shadow_world.list_simulations()}

# ============= Rollback Manager Endpoints =============

@api_router.get("/rollback/status")
async def get_rollback_status():
    """Get Rollback Manager status"""
    return rollback_manager.get_status()

@api_router.post("/rollback/snapshot")
async def create_snapshot(data: SnapshotCreate):
    """Create new snapshot"""
    result = rollback_manager.create_snapshot(data.description, data.tags)
    return result

@api_router.get("/rollback/snapshots")
async def list_snapshots():
    """List all snapshots"""
    return {"snapshots": rollback_manager.list_snapshots()}

@api_router.get("/rollback/snapshot/{snapshot_id}")
async def get_snapshot(snapshot_id: str):
    """Get snapshot details"""
    snapshot = rollback_manager.get_snapshot(snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return snapshot

@api_router.post("/rollback/snapshot/{snapshot_id}/restore")
async def restore_snapshot(snapshot_id: str):
    """Rollback to snapshot"""
    result = rollback_manager.rollback_to_snapshot(snapshot_id)
    return result

@api_router.delete("/rollback/snapshot/{snapshot_id}")
async def delete_snapshot(snapshot_id: str):
    """Delete snapshot"""
    result = rollback_manager.delete_snapshot(snapshot_id)
    return result

# ============= Project Indexer Endpoints =============

@api_router.get("/projects")
async def list_projects(status: Optional[str] = None):
    """List all projects"""
    projects = project_indexer.list_projects(filter_status=status)
    return {"projects": projects}

@api_router.post("/projects")
async def register_project(project: ProjectCreate):
    """Register new project"""
    result = project_indexer.register_project(project.model_dump())
    return result

@api_router.get("/projects/stats")
async def get_project_stats():
    """Get project statistics"""
    return project_indexer.get_stats()

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Get project details"""
    project = project_indexer.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, updates: Dict[str, Any]):
    """Update project"""
    result = project_indexer.update_project(project_id, updates)
    return result

# ============= Documentation Endpoints =============

@api_router.get("/documentation/architecture")
async def get_architecture_documentation():
    """Get architecture documentation"""
    from generators.architecture_generator import generate_architecture_documentation
    docs = generate_architecture_documentation()
    return docs

@api_router.get("/documentation/download")
async def download_documentation():
    """Download complete architecture documentation as JSON"""
    from generators.architecture_generator import generate_complete_documentation
    docs = generate_complete_documentation()
    
    # Save to file
    docs_path = Path("/tmp/accf_architecture.json")
    with open(docs_path, "w") as f:
        json.dump(docs, f, indent=2)
    
    return FileResponse(
        docs_path,
        media_type="application/json",
        filename="accf_architecture.json"
    )

# ============= WebSocket for Real-Time Updates =============

class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")

manager = ConnectionManager()

@app.websocket("/ws/system-state")
async def websocket_system_state(websocket: WebSocket):
    """WebSocket endpoint for real-time system state updates"""
    await manager.connect(websocket)
    
    try:
        # Send initial state
        await websocket.send_json({
            "type": "initial_state",
            "data": {
                "control_kernel": control_kernel.get_status(),
                "cognitive_engine": cognitive_engine.get_status(),
                "graph": state_graph.get_stats()
            }
        })
        
        # Keep connection alive and send periodic updates
        while True:
            try:
                # Wait for client messages or send updates every 5 seconds
                await asyncio.sleep(5)
                
                # Send status update
                await websocket.send_json({
                    "type": "status_update",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "data": {
                        "control_kernel": control_kernel.get_status(),
                        "cognitive_engine": cognitive_engine.get_status(),
                        "shadow_world": shadow_world.get_status(),
                        "rollback": rollback_manager.get_status()
                    }
                })
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
    
    finally:
        manager.disconnect(websocket)

# Include router
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
