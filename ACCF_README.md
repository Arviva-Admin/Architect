# Autonomous Cognitive Control Fabric (ACCF)

## 🎯 Overview

The **Autonomous Cognitive Control Fabric** is a meta-layer control system designed for autonomous AI-driven development. It operates as a multi-project orchestrator with built-in safety mechanisms, fast reasoning capabilities (<2s response time), and guaranteed rollback functionality.

## 🏗️ System Architecture

### Dual-Core Design

The system is built on a **dual-core architecture**:

#### 1. Control Kernel (Immutable)
- **Status**: Immutable - never self-modifies
- **Color Theme**: Red (#ef4444)
- **Responsibilities**:
  - Enforces autonomy levels (A0-A4)
  - Validates operations against safety policies
  - Maintains immutable execution log
  - Assesses operation risks
  - Guarantees system safety

#### 2. Cognitive Engine (Evolvable)
- **Status**: Evolvable - can self-improve
- **Color Theme**: Cyan (#06b6d4)
- **Responsibilities**:
  - Fast reasoning (<2s constraint)
  - Project analysis and optimization
  - Dependency resolution
  - Self-improvement through feedback loops
  - Pattern recognition

## 🎚️ Autonomy Levels (A0-A4)

The system supports five autonomy levels that control the degree of automation:

| Level | Name | Behavior | Use Case |
|-------|------|----------|----------|
| **A0** | Manual Control | Manual approval for every action | Initial setup, critical systems |
| **A1** | Supervised Execution | Execute with confirmation for code/system changes | Development phase |
| **A2** | Monitored Autonomy | Execute with post-notification, approval for critical changes | Stable operations *(default)* |
| **A3** | Autonomous Operation | Fully autonomous with periodic reports | Mature systems |
| **A4** | Full Autonomy | Complete autonomy with automatic rollback capability | Production with robust testing |

## 🔧 Core Components

### 1. State Graph
- **Technology**: NetworkX
- **Performance**: <2s query response
- **Purpose**: Fast in-memory graph for reasoning and state management
- **Features**:
  - 3D visualization using react-force-graph-3d
  - Real-time graph updates
  - Multi-project relationship mapping

### 2. Proxy Executor
- **Status**: Conceptual (reference implementation)
- **Purpose**: Safe execution wrapper with container isolation
- **Isolation**: Docker-based

### 3. Shadow World
- **Purpose**: Safe refactor simulation environment
- **Features**:
  - Risk-free operation testing
  - Impact assessment before execution
  - Change preview and diff visualization
  - Risk assessment for operations

### 4. Rollback Manager
- **Purpose**: Snapshot and rollback system with guaranteed restore
- **Features**:
  - Automatic snapshot creation
  - Point-in-time restore
  - State history tracking
  - Tags and descriptions for snapshots

### 5. Project Indexer
- **Purpose**: Multi-project metadata indexer
- **Features**:
  - Project registration and tracking
  - Metadata management
  - Statistics aggregation
  - Multi-language support

## 🛡️ Safety Policies

### Enforcement Mechanisms
1. Proxy-enforced execution (all operations through controlled interface)
2. Shadow simulation requirement before production execution
3. Mandatory rollback point creation
4. Resource usage limits (35GB RAM, 80% CPU)
5. Forbidden operations list
6. Risk assessment for all operations

### Forbidden Operations
- `rm_rf_root`: Prevent root filesystem deletion
- `unrestricted_network_access`: Network must be controlled
- `kernel_modification`: System kernel changes blocked

### Resource Limits
- **Memory**: Max 35GB RAM
- **CPU**: Max 80%
- **Execution Time**: 300 seconds per operation

## 📊 System Metrics

The dashboard provides real-time monitoring of:
- **Response Time**: Average cognitive engine response time (target: <2000ms)
- **Total Queries**: Number of reasoning queries processed
- **Memory Usage**: Current system memory consumption
- **CPU Usage**: Current CPU utilization
- **SLA Compliance**: Whether system meets <2s response time SLA

## 🌐 API Endpoints

### Base URL
```
/api
```

### Control Kernel
- `GET /control-kernel/status` - Get Control Kernel status
- `POST /control-kernel/autonomy-level` - Set autonomy level (A0-A4)
- `POST /control-kernel/validate` - Validate operation against safety policies
- `GET /control-kernel/execution-log` - Get execution log

### Cognitive Engine
- `GET /cognitive-engine/status` - Get Cognitive Engine status
- `POST /cognitive-engine/reason` - Perform fast reasoning (<2s)
- `POST /cognitive-engine/self-improve` - Trigger self-improvement
- `GET /cognitive-engine/metrics` - Get performance metrics

### State Graph
- `POST /state-graph/query` - Query state graph
- `GET /state-graph/full` - Get full graph for visualization
- `GET /state-graph/stats` - Get graph statistics
- `GET /state-graph/node/{node_id}` - Get specific node data

### Shadow World
- `POST /shadow-world/simulation` - Create new simulation
- `POST /shadow-world/simulation/{id}/run` - Run simulation
- `GET /shadow-world/simulation/{id}` - Get simulation details
- `GET /shadow-world/simulations` - List all simulations

### Rollback Manager
- `POST /rollback/snapshot` - Create snapshot
- `GET /rollback/snapshots` - List all snapshots
- `POST /rollback/snapshot/{id}/restore` - Rollback to snapshot
- `DELETE /rollback/snapshot/{id}` - Delete snapshot

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Register new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project

### WebSocket
- `WS /ws/system-state` - Real-time system state updates

## 🎨 UI/UX Design

### Design Theme: "Cyber-Command"
- **Mode**: Dark
- **Background**: #030712 (Deep Black)
- **Aesthetic**: Mission-critical control room (NASA-inspired)
- **Typography**:
  - **Headings**: Manrope (bold, tight tracking)
  - **Body**: Inter
  - **Code/Data**: JetBrains Mono

### Color Palette
- **Control Kernel**: Red (#ef4444)
- **Cognitive Engine**: Cyan (#06b6d4)
- **Safe State**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Critical**: Red (#dc2626)

### Key Features
- Glassmorphism cards with tactical borders
- Scanline effect for retro-futuristic feel
- Glow effects on interactive elements
- High-density dashboard layout
- Status indicators with pulse animations
- Hover states with color shifts

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB
- Docker (for production deployment)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

### Access the Dashboard
```
http://localhost:3000
```

## 📖 Documentation

### Interactive Documentation Viewer
Access the built-in documentation viewer at `/docs` which includes:
- System Overview
- Component Details
- API Reference
- Control Flow
- Safety Policies
- Self-Improvement Pipeline

### Download Documentation
Complete architecture documentation can be downloaded as JSON from:
```
GET /api/documentation/download
```

## 🔄 Execution Control Flow

1. **Operation Request** received
2. **Control Kernel** validates against safety policies
3. Check **autonomy level** for approval requirements
4. If required, create **shadow simulation**
5. Execute simulation in **Shadow World**
6. Assess simulation results and risks
7. If A0-A2, request **manual approval**
8. Create **rollback snapshot**
9. Execute operation via **Proxy Executor**
10. Log execution in **Control Kernel**
11. Update **State Graph**
12. Broadcast status update via **WebSocket**

## 🧠 Self-Improvement Pipeline

### Improvement Cycle
1. Collect feedback and metrics
2. Cognitive Engine analyzes patterns
3. Generate improvement hypotheses
4. Simulate improvements in Shadow World
5. Validate safety and performance gains
6. Request approval (if required by autonomy level)
7. Apply improvement to Cognitive Engine
8. Monitor post-improvement metrics
9. Rollback if degradation detected

### Safety Constraints
- Control Kernel policies remain immutable
- Self-modifications tested in Shadow World first
- Rollback available for all improvements
- Manual approval required for major cognitive changes

## 🎯 Key Features

✅ **Dual-core architecture** (Control Kernel + Cognitive Engine)  
✅ **Fast state graph reasoning** (<2s)  
✅ **Proxy-enforced safe execution**  
✅ **Shadow-world refactor simulation**  
✅ **Autonomy levels** (A0-A4)  
✅ **Guaranteed rollback system**  
✅ **Multi-project indexing**  
✅ **Real-time WebSocket updates**  
✅ **3D graph visualization**  
✅ **Interactive documentation viewer**  

## 📝 Example Usage

### Set Autonomy Level
```python
import requests

response = requests.post(
    "http://localhost:8001/api/control-kernel/autonomy-level",
    json={"level": "A3"}
)
print(response.json())
```

### Perform Reasoning
```python
response = requests.post(
    "http://localhost:8001/api/cognitive-engine/reason",
    json={
        "type": "project_analysis",
        "data": {"project_id": "abc123"}
    }
)
print(response.json())
```

### Create Snapshot
```python
response = requests.post(
    "http://localhost:8001/api/rollback/snapshot",
    json={
        "description": "Before major refactor",
        "tags": ["pre-refactor", "stable"]
    }
)
print(response.json())
```

## 🔒 Security Considerations

- All operations validated through Control Kernel
- Shadow simulation required for high-risk operations
- Immutable execution logging
- Resource usage enforcement
- Container isolation for execution
- WebSocket authentication (production)

## 🐛 Troubleshooting

### WebSocket Not Connecting
- Check CORS settings in backend
- Verify WebSocket URL uses `wss://` for HTTPS
- Check firewall/proxy settings

### Graph Not Loading
- Ensure backend is running
- Check `/api/state-graph/full` endpoint
- Verify react-force-graph-3d installation

### Slow Response Times
- Check Cognitive Engine metrics
- Verify system resources (RAM, CPU)
- Review execution log for bottlenecks

## 📄 License

This is a reference implementation/blueprint for educational purposes.

## 👥 Credits

Built with:
- FastAPI (Python backend)
- React (Frontend)
- NetworkX (Graph processing)
- react-force-graph-3d (3D visualization)
- MongoDB (Data storage)
- Shadcn/UI (UI components)

---

**ACCF © 2026 | Emergent Labs**  
Meta-Layer Control System v1.0.0  
MAX RESOURCE USAGE: 35GB RAM | RESPONSE TIME: <2s SLA
