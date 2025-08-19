# Runbook

Operational guidance to run, observe, and troubleshoot the system.

## Quick run (local)
- Install deps:
  ```sh
  bun install
  ```
- Migrate DB (first run or schema changes):
  ```sh
  bun --cwd inference run db:generate && bun --cwd inference run db:migrate
  ```
- Start API + dashboard:
  ```sh
  bun run dev
  # API: http://localhost:3001  UI: http://localhost:5173
  ```
- Train and promote model:
  ```sh
  bun --cwd training run train && ls -l artifacts
  ```

## Docker Compose
- Up API + dashboard:
  ```sh
  docker compose -f infra/docker-compose.yml up -d --build inference dashboard
  ```
- One-off training:
  ```sh
  docker compose -f infra/docker-compose.yml --profile training run --rm training
  ```
- Down:
  ```sh
  docker compose -f infra/docker-compose.yml down
  ```

## Kubernetes (optional)
- Update images in `infra/k8s/*.yaml` and apply manifests. Replace `emptyDir` with PVCs for persistence.

## Health
- API: `POST /predict` returns classifications; `GET /dashboard` returns runs
- UI: open the dashboard URL and check charts load

## Troubleshooting
- Missing model: run training; verify `isProduction` and artifact path in DB
- CORS: ensure API at http://localhost:3001 and CORS enabled in `inference/src/index.js`
- Migrations: rerun generate/migrate; inspect `inference/drizzle/` and `inference/main.db`
- Artifacts in containers: ensure `../artifacts:/app/artifacts` volume or PVC
