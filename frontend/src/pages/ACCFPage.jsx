import { useEffect, useMemo, useState } from 'react';
import { createProject, createTask, getACCFHealth, getProjects } from '../lib/api';
import { ExecutionGraphViewer } from '../components/ExecutionGraphViewer';

const levels = ['A0', 'A1', 'A2', 'A3', 'A4'];

function resolveWsBaseUrl() {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return 'ws://127.0.0.1:8001';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8001`;
}

export function ACCFPage() {
  const [toast, setToast] = useState('');
  const [autonomy, setAutonomy] = useState('A1');
  const [health, setHealth] = useState(null);
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);

  const sampleGraph = useMemo(() => ({
    task_id: 'ui-sample',
    steps: [{ id: 's1', command: 'sandbox://echo from-ui', requires_proxy: true }]
  }), []);

  useEffect(() => {
    getACCFHealth().then(setHealth).catch(() => setToast('Could not load ACCF health'));
    getProjects().then(setProjects).catch(() => setToast('Could not load projects'));

    const ws = new WebSocket(`${resolveWsBaseUrl()}/ws/accf`);
    ws.onmessage = (evt) => setLogs((prev) => [evt.data, ...prev].slice(0, 30));
    ws.onerror = () => setToast('WS disconnected');
    return () => ws.close();
  }, []);

  async function onSeedProject() {
    try {
      const p = await createProject({ name: 'Nexus', tags: ['core'], memory_budget_gb: 8 });
      setProjects((prev) => [p, ...prev]);
      setToast('Project added');
    } catch {
      setToast('Could not create project');
    }
  }

  async function onSimulateTask() {
    if (!projects[0]) return setToast('Create a project first');
    try {
      const task = await createTask({
        project_id: projects[0].id,
        description: 'UI simulated run',
        risk: 'low',
        estimated_memory_gb: 2,
        simulated: true,
        graph: sampleGraph
      });
      setLogs((prev) => [JSON.stringify(task), ...prev]);
      setToast('Task executed (simulated=true)');
    } catch {
      setToast('Could not run task');
    }
  }

  return (
    <div className="accf-layout">
      <h1>Autonomous Cognitive Control Fabric</h1>
      {toast && <div className="toast">{toast}</div>}

      <div className="card">
        <h3>Autonomy Level</h3>
        <div className="row">
          {levels.map((level) => (
            <button
              key={level}
              className={level === autonomy ? 'active' : ''}
              onClick={() => {
                setAutonomy(level);
                setToast(`Autonomy switched to ${level}`);
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>System Metrics</h3>
          <pre>{JSON.stringify(health?.metrics ?? {}, null, 2)}</pre>
          <button onClick={onSeedProject}>Add Project</button>
          <button onClick={onSimulateTask}>Run Simulated Task</button>
        </div>

        <div className="card">
          <h3>Project Registry</h3>
          <ul>{projects.map((p) => <li key={p.id}>{p.name} ({p.memory_budget_gb}GB)</li>)}</ul>
        </div>
      </div>

      <ExecutionGraphViewer graph={sampleGraph} />

      <div className="card">
        <h3>Live Log Stream</h3>
        <div className="logbox">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}
