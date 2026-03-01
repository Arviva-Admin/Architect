from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_accf_health_smoke():
    response = client.get('/api/accf/health')
    assert response.status_code == 200
    assert response.json()['ok'] is True


def test_accf_task_smoke():
    project = client.post('/api/accf/projects', json={
        'name': 'core',
        'tags': ['smoke'],
        'memory_budget_gb': 4
    })
    assert project.status_code == 200
    project_id = project.json()['id']

    task = client.post('/api/accf/tasks', json={
        'project_id': project_id,
        'description': 'safe op',
        'risk': 'low',
        'estimated_memory_gb': 2,
        'simulated': True,
        'graph': {
            'task_id': 'graph-1',
            'steps': [
                {'id': 's1', 'command': 'sandbox://echo safe', 'requires_proxy': True}
            ]
        }
    })
    assert task.status_code == 200
    data = task.json()
    assert data['simulated'] is True
    assert data['task']['status'] == 'completed'
