# Arviva Nexus + ACCF Integration

Detta repo kör **Nexus** med ACCF som en integrerad modul i befintlig FastAPI-backend (ingen separat Node/TS-server).

## Arkitektur (alignment)
- Backend: `backend/app/main.py` (FastAPI)
- ACCF-modul: `backend/app/modules/accf/*`
- Frontend: `frontend/` (React/Vite) med ny route `/accf`
- Hub finns kvar i dev-compose (`hub-dev`) men ACCF är inte hub-centrerad.

## Frontend/backend anslutning
- Backend har CORS aktiverat för lokal UI-integration.
- Frontend använder `VITE_API_BASE_URL` och `VITE_WS_BASE_URL` om de finns.
- Om env saknas används samma host som frontend med backend-port `8001`.

## ACCF endpoints
- `GET /api/accf/health`
- `POST /api/accf/tasks`
- `GET /api/accf/projects`
- `POST /api/accf/snapshots`
- `POST /api/accf/rollback`
- `WS /ws/accf`

Existerande endpoints bibehålls:
- `GET /health`
- `GET /api/health`

## Säkerhet och guardrails
- Hård RAM-guard i runtime: max `35GB`.
- Compose-limit på backend tjänster: `deploy.resources.limits.memory: "35G"`.
- Proxy policy med allowlist/denylist.
- Shadow/simulate-körning före apply.
- Audit-log i JSONL: `backend/data/accf_audit.jsonl`.

## RUNBOOK
### Dev
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Backend: `http://127.0.0.1:8001`
- Frontend: `http://127.0.0.1:3000/accf`
- Hub dev: `http://127.0.0.1:3001`

Du kan byta bind-ip med `DEV_BIND_IP`, t.ex:
```bash
DEV_BIND_IP=0.0.0.0 docker compose -f docker-compose.dev.yml up --build
```

### Prod
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
- Backend och mongo publiceras **inte** på host-portar i prod.
- Frontend når backend internt via `backend:8001`.

## Tester
```bash
python -m pip install -r backend/requirements.txt
python -m pip install pytest
PYTHONPATH=backend pytest -q backend/tests
```
