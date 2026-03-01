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

# Import voice integrations
from integrations.voice_stt import whisper_stt
from integrations.voice_tts import piper_tts

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

@api_router.post("/projects/{project_id}/toggle")
async def toggle_project_status(project_id: str):
    """Enable/disable project module"""
    project = project_indexer.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_status = "inactive" if project["status"] == "active" else "active"
    result = project_indexer.update_project(project_id, {"status": new_status})
    
    return {
        "success": True,
        "project_id": project_id,
        "old_status": project["status"],
        "new_status": new_status,
        "message": f"Project {'deactivated' if new_status == 'inactive' else 'activated'}"
    }

@api_router.get("/projects/{project_id}/dependencies")
async def get_project_dependencies(project_id: str):
    """Get project dependencies"""
    project = project_indexer.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Simulated dependency info - in production, analyze actual dependencies
    return {
        "project_id": project_id,
        "dependencies": [
            {"id": "dep1", "name": "Shared Library", "type": "library", "critical": True},
            {"id": "dep2", "name": "API Gateway", "type": "service", "critical": False}
        ],
        "dependent_projects": []
    }

# ============= Voice Integration Endpoints =============

class VoiceTranscribeRequest(BaseModel):
    audio_base64: str
    language: Optional[str] = None

class VoiceSynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = None

@api_router.post("/voice/transcribe")
async def transcribe_voice(request: VoiceTranscribeRequest):
    """Transcribe audio to text using Whisper STT"""
    import base64
    try:
        audio_data = base64.b64decode(request.audio_base64)
        result = whisper_stt.transcribe_audio(audio_data, request.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/voice/synthesize")
async def synthesize_voice(request: VoiceSynthesizeRequest):
    """Synthesize text to speech using Piper TTS"""
    try:
        result = piper_tts.synthesize_speech(request.text, request.voice)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/voice/status")
async def get_voice_status():
    """Get voice integration status"""
    return {
        "stt": whisper_stt.get_status(),
        "tts": piper_tts.get_status()
    }

@api_router.get("/voice/voices")
async def list_available_voices():
    """List available TTS voices"""
    return {
        "voices": piper_tts.get_available_voices()
    }

@api_router.post("/voice/command")
async def process_voice_command(request: VoiceTranscribeRequest):
    """Process voice command - transcribe and execute"""
    import base64
    try:
        # Transcribe
        audio_data = base64.b64decode(request.audio_base64)
        transcription = whisper_stt.transcribe_audio(audio_data, request.language)
        
        if not transcription.get("success"):
            return transcription
        
        command_text = transcription.get("text", "").lower()
        
        # Parse command and execute
        response_text = "Command received but not implemented in reference version"
        
        # Synthesize response
        synthesis = piper_tts.synthesize_speech(response_text)
        
        return {
            "success": True,
            "transcription": transcription,
            "command": command_text,
            "response": response_text,
            "audio": synthesis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= Safety & Metrics Endpoints =============

@api_router.get("/safety/metrics")
async def get_safety_metrics():
    """Get current system safety metrics"""
    cognitive_status = cognitive_engine.get_status()
    
    # Simulated metrics - in production, read from actual system
    return {
        "cpu_usage_percent": 45,
        "memory_usage_gb": 12.5,
        "memory_limit_gb": 35,
        "response_time_ms": cognitive_status.get("avg_response_time_ms", 0),
        "response_time_sla": 2000,
        "task_failure_rate": 0.02,
        "meets_sla": cognitive_status.get("meets_sla", True),
        "safety_status": "nominal"
    }

@api_router.post("/safety/check-thresholds")
async def check_safety_thresholds():
    """Check if safety thresholds are breached"""
    metrics = await get_safety_metrics()
    
    breaches = []
    
    if metrics["memory_usage_gb"] > 30:  # 85% of limit
        breaches.append({
            "type": "memory",
            "severity": "warning",
            "message": f"Memory usage high: {metrics['memory_usage_gb']}GB / {metrics['memory_limit_gb']}GB"
        })
    
    if metrics["response_time_ms"] > 2000:
        breaches.append({
            "type": "performance",
            "severity": "critical",
            "message": f"Response time exceeds SLA: {metrics['response_time_ms']}ms > 2000ms"
        })
    
    if metrics["task_failure_rate"] > 0.05:
        breaches.append({
            "type": "reliability",
            "severity": "warning",
            "message": f"Task failure rate high: {metrics['task_failure_rate']*100:.1f}%"
        })
    
    should_rollback = any(b["severity"] == "critical" for b in breaches)
    
    return {
        "safe": len(breaches) == 0,
        "breaches": breaches,
        "recommend_rollback": should_rollback,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.post("/safety/auto-rollback")
async def trigger_auto_rollback():
    """Trigger automatic rollback due to safety breach"""
    # Check thresholds
    safety_check = await check_safety_thresholds()
    
    if not safety_check["recommend_rollback"]:
        return {
            "success": False,
            "message": "No rollback needed - system within safe parameters"
        }
    
    # Get most recent stable snapshot
    snapshots = rollback_manager.list_snapshots()
    stable_snapshots = [s for s in snapshots if "stable" in s.get("tags", [])]
    
    if not stable_snapshots:
        return {
            "success": False,
            "message": "No stable snapshot available for rollback"
        }
    
    target_snapshot = stable_snapshots[0]
    result = rollback_manager.rollback_to_snapshot(target_snapshot["id"])
    
    return {
        **result,
        "reason": "Automatic rollback triggered by safety threshold breach",
        "breaches": safety_check["breaches"]
    }

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
