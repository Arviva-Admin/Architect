# Bolt Integration Guide for ACCF

## Overview

This guide provides step-by-step instructions for integrating the **Autonomous Cognitive Control Fabric (ACCF)** with **Bolt** for enhanced AI-driven development capabilities.

## Prerequisites

- **ACCF System** running (Backend + Frontend)
- **Bolt** installed and configured
- **Node.js** 18+ and **Python** 3.10+
- **Docker** (optional, for containerized deployment)

## Architecture Integration

### ACCF + Bolt Communication Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Bolt     │ ◄─────► │  ACCF API    │ ◄─────► │  Database   │
│   (Client)  │  REST   │  (FastAPI)   │  Query  │  (MongoDB)  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       │
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│  Bolt UI    │         │  ACCF React  │
│ Components  │         │  Dashboard   │
└─────────────┘         └──────────────┘
```

## Step 1: Environment Configuration

### 1.1 Backend Configuration

Create or update `/app/backend/.env`:

```bash
# Core Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="accf_database"
CORS_ORIGINS="*"

# Voice Integration (Optional)
WHISPER_MODEL_SIZE="base"
WHISPER_DEVICE="cuda"  # or "cpu"
PIPER_MODEL_DIR="/models/piper"
PIPER_DEFAULT_VOICE="en_US-lessac-medium"

# Safety Thresholds
MAX_MEMORY_GB=35
MAX_CPU_PERCENT=80
MAX_EXECUTION_TIME=300

# Performance
COGNITIVE_SLA_MS=2000
```

### 1.2 Frontend Configuration

Update `/app/frontend/.env`:

```bash
REACT_APP_BACKEND_URL=https://your-accf-domain.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=true
```

### 1.3 Bolt Configuration

Add ACCF integration to Bolt's configuration:

```json
{
  "integrations": {
    "accf": {
      "enabled": true,
      "api_url": "https://your-accf-domain.com/api",
      "websocket_url": "wss://your-accf-domain.com/ws/system-state",
      "features": {
        "autonomy_control": true,
        "project_management": true,
        "voice_interface": true,
        "safety_monitoring": true
      }
    }
  }
}
```

## Step 2: API Integration

### 2.1 Install ACCF Client SDK (for Bolt)

Create a lightweight SDK for Bolt to communicate with ACCF:

```bash
cd bolt-project
npm install axios
```

Create `bolt-accf-client.js`:

```javascript
import axios from 'axios';

class ACCFClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Autonomy Control
  async setAutonomyLevel(level) {
    return await this.client.post('/control-kernel/autonomy-level', { level });
  }

  async getControlKernelStatus() {
    return await this.client.get('/control-kernel/status');
  }

  // Project Management
  async listProjects(status = null) {
    return await this.client.get('/projects', { params: { status } });
  }

  async registerProject(projectData) {
    return await this.client.post('/projects', projectData);
  }

  async toggleProject(projectId) {
    return await this.client.post(`/projects/${projectId}/toggle`);
  }

  // Voice Interface
  async transcribeAudio(audioBase64, language = 'en') {
    return await this.client.post('/voice/transcribe', {
      audio_base64: audioBase64,
      language
    });
  }

  async synthesizeSpeech(text, voice = null) {
    return await this.client.post('/voice/synthesize', { text, voice });
  }

  // Safety & Monitoring
  async getSafetyMetrics() {
    return await this.client.get('/safety/metrics');
  }

  async checkSafetyThresholds() {
    return await this.client.post('/safety/check-thresholds');
  }

  // Rollback
  async createSnapshot(description, tags = []) {
    return await this.client.post('/rollback/snapshot', { description, tags });
  }

  async listSnapshots() {
    return await this.client.get('/rollback/snapshots');
  }

  async restoreSnapshot(snapshotId) {
    return await this.client.post(`/rollback/snapshot/${snapshotId}/restore`);
  }
}

export default ACCFClient;
```

### 2.2 WebSocket Integration

Integrate real-time updates in Bolt:

```javascript
class ACCFWebSocket {
  constructor(wsURL) {
    this.wsURL = wsURL;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(onMessage, onError) {
    this.ws = new WebSocket(this.wsURL);

    this.ws.onopen = () => {
      console.log('[ACCF] WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('[ACCF] WebSocket error:', error);
      onError(error);
    };

    this.ws.onclose = () => {
      console.log('[ACCF] WebSocket disconnected');
      this.reconnect(onMessage, onError);
    };
  }

  reconnect(onMessage, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[ACCF] Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(onMessage, onError), 5000);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default ACCFWebSocket;
```

## Step 3: Bolt UI Components Integration

### 3.1 Add ACCF Dashboard to Bolt

Embed ACCF React components in Bolt's UI:

```jsx
import React from 'react';
import ACCFClient from './bolt-accf-client';

const ACCFDashboard = () => {
  const [controlStatus, setControlStatus] = React.useState(null);
  const client = new ACCFClient('https://your-accf-domain.com/api');

  React.useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await client.getControlKernelStatus();
      setControlStatus(response.data);
    } catch (error) {
      console.error('Failed to load ACCF status:', error);
    }
  };

  return (
    <div className="accf-dashboard">
      <h2>ACCF Control Panel</h2>
      {controlStatus && (
        <div>
          <p>Autonomy Level: {controlStatus.autonomy_level}</p>
          <p>Status: {controlStatus.status}</p>
        </div>
      )}
    </div>
  );
};

export default ACCFDashboard;
```

### 3.2 Autonomy Control Widget

Create a compact autonomy control widget for Bolt:

```jsx
import React from 'react';
import ACCFClient from './bolt-accf-client';

const AutonomyWidget = () => {
  const [currentLevel, setCurrentLevel] = React.useState('A2');
  const [updating, setUpdating] = React.useState(false);
  const client = new ACCFClient('https://your-accf-domain.com/api');

  const updateLevel = async (level) => {
    setUpdating(true);
    try {
      await client.setAutonomyLevel(level);
      setCurrentLevel(level);
      alert(`Autonomy level updated to ${level}`);
    } catch (error) {
      alert('Failed to update autonomy level');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="autonomy-widget">
      <h3>Autonomy Level: {currentLevel}</h3>
      <select
        value={currentLevel}
        onChange={(e) => updateLevel(e.target.value)}
        disabled={updating}
      >
        <option value="A0">A0 - Manual</option>
        <option value="A1">A1 - Supervised</option>
        <option value="A2">A2 - Monitored</option>
        <option value="A3">A3 - Autonomous</option>
        <option value="A4">A4 - Full Autonomy</option>
      </select>
    </div>
  );
};

export default AutonomyWidget;
```

## Step 4: Voice Command Integration

### 4.1 Add Voice Commands to Bolt

Enable voice commands in Bolt using ACCF:

```javascript
import ACCFClient from './bolt-accf-client';

class BoltVoiceCommands {
  constructor() {
    this.client = new ACCFClient('https://your-accf-domain.com/api');
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        await this.processVoiceCommand(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      console.log('[Bolt] Listening for voice command...');
    } catch (error) {
      console.error('[Bolt] Failed to start voice recognition:', error);
    }
  }

  stopListening() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  async processVoiceCommand(audioBlob) {
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        // Transcribe
        const response = await this.client.transcribeAudio(base64Audio);
        const command = response.data.text.toLowerCase();
        
        // Parse and execute command
        this.executeCommand(command);
      };
    } catch (error) {
      console.error('[Bolt] Failed to process voice command:', error);
    }
  }

  executeCommand(command) {
    console.log('[Bolt] Executing command:', command);
    
    // Example command parsing
    if (command.includes('set autonomy')) {
      // Extract level and update
      const level = command.match(/a[0-4]/i)?.[0]?.toUpperCase();
      if (level) {
        this.client.setAutonomyLevel(level);
      }
    } else if (command.includes('create snapshot')) {
      this.client.createSnapshot('Voice-triggered snapshot', ['voice']);
    }
    // Add more command handlers...
  }
}

export default BoltVoiceCommands;
```

## Step 5: Safety Integration

### 5.1 Implement Safety Monitoring in Bolt

```javascript
import ACCFClient from './bolt-accf-client';

class BoltSafetyMonitor {
  constructor() {
    this.client = new ACCFClient('https://your-accf-domain.com/api');
    this.checkInterval = null;
  }

  startMonitoring(intervalMs = 10000) {
    this.checkInterval = setInterval(async () => {
      await this.checkSafety();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  async checkSafety() {
    try {
      const response = await this.client.checkSafetyThresholds();
      const { safe, breaches, recommend_rollback } = response.data;

      if (!safe) {
        console.warn('[Bolt] Safety threshold breached:', breaches);
        
        // Notify user
        this.notifyUser(breaches);

        // Auto-rollback if critical
        if (recommend_rollback) {
          await this.triggerAutoRollback();
        }
      }
    } catch (error) {
      console.error('[Bolt] Safety check failed:', error);
    }
  }

  notifyUser(breaches) {
    breaches.forEach(breach => {
      alert(`⚠️ Safety Breach: ${breach.message}`);
    });
  }

  async triggerAutoRollback() {
    if (confirm('Critical safety breach detected. Trigger automatic rollback?')) {
      try {
        const response = await this.client.client.post('/safety/auto-rollback');
        alert('System rolled back to stable snapshot');
      } catch (error) {
        console.error('[Bolt] Auto-rollback failed:', error);
      }
    }
  }
}

export default BoltSafetyMonitor;
```

## Step 6: Testing the Integration

### 6.1 Test Checklist

- [ ] Backend API endpoints respond correctly
- [ ] WebSocket connection establishes
- [ ] Autonomy level changes reflect in both systems
- [ ] Project toggle functionality works
- [ ] Voice transcription processes correctly
- [ ] Safety monitoring triggers alerts
- [ ] Rollback functionality works
- [ ] Documentation is accessible

### 6.2 Example Test Script

```bash
#!/bin/bash
# test-accf-integration.sh

API_URL="https://your-accf-domain.com/api"

echo "Testing ACCF Integration..."

# Test 1: Health Check
echo "1. Health Check"
curl -X GET "$API_URL/health"

# Test 2: Get Control Kernel Status
echo "\n2. Control Kernel Status"
curl -X GET "$API_URL/control-kernel/status"

# Test 3: Set Autonomy Level
echo "\n3. Set Autonomy Level to A3"
curl -X POST "$API_URL/control-kernel/autonomy-level" \
  -H "Content-Type: application/json" \
  -d '{"level": "A3"}'

# Test 4: List Projects
echo "\n4. List Projects"
curl -X GET "$API_URL/projects"

# Test 5: Safety Metrics
echo "\n5. Safety Metrics"
curl -X GET "$API_URL/safety/metrics"

echo "\n\nIntegration tests complete!"
```

## Step 7: Deployment

### 7.1 Docker Deployment

Deploy both systems together:

```yaml
# docker-compose.yml
version: '3.8'

services:
  accf-backend:
    build: ./accf/backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=accf_database
    depends_on:
      - mongo

  accf-frontend:
    build: ./accf/frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://accf-backend:8001

  bolt:
    build: ./bolt
    ports:
      - "3001:3001"
    environment:
      - ACCF_API_URL=http://accf-backend:8001/api

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGINS` in backend `.env` includes Bolt's domain
   - Check browser console for specific CORS errors

2. **WebSocket Connection Fails**
   - Verify WebSocket URL uses `wss://` for HTTPS
   - Check firewall/proxy settings
   - Ensure backend WebSocket endpoint is accessible

3. **Voice Interface Not Working**
   - Check microphone permissions in browser
   - Verify Whisper/Piper services are running
   - Check backend logs for voice processing errors

4. **Autonomy Changes Not Reflecting**
   - Check network tab for API call responses
   - Verify authentication/authorization if implemented
   - Check backend logs for validation errors

## Support

For additional support:
- Check `/docs` endpoint for API documentation
- Review backend logs: `/var/log/supervisor/backend.*.log`
- Review frontend console for errors

## Summary

You now have ACCF integrated with Bolt, enabling:
- ✅ Autonomous control from Bolt UI
- ✅ Voice command integration
- ✅ Safety monitoring and auto-rollback
- ✅ Project/module management
- ✅ Real-time system state updates

---

**ACCF + Bolt Integration v1.0**  
Last Updated: 2026
