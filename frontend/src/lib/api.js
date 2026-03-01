const defaultApiBaseUrl = (() => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8001';
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8001`;
})();

const API = defaultApiBaseUrl;

export async function getACCFHealth() {
  const r = await fetch(`${API}/api/accf/health`);
  if (!r.ok) throw new Error('Failed ACCF health');
  return r.json();
}

export async function getProjects() {
  const r = await fetch(`${API}/api/accf/projects`);
  if (!r.ok) throw new Error('Failed projects');
  return r.json();
}

export async function createProject(payload) {
  const r = await fetch(`${API}/api/accf/projects`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error('Failed create project');
  return r.json();
}

export async function createTask(payload) {
  const r = await fetch(`${API}/api/accf/tasks`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
