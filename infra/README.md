# Infrastructure (conceptual)

This directory contains infrastructure artifacts to run the monorepo in containerized or orchestrated environments.

Structure:
- docker/
  - Dockerfile.inference: image for the inference service (Elysia/Bun)
  - Dockerfile.dashboard: image for the dashboard (Vite -> Nginx)
  - Dockerfile.training: image for an on-demand training job
- docker-compose.yml: local orchestration for services (inference + dashboard). The training job is in an optional profile.
- k8s/
  - inference-deployment.yaml, inference-service.yaml
  - dashboard-deployment.yaml, dashboard-service.yaml

Notes:
- Model artifacts are centralized under `artifacts/` at the repo root and are mounted into containers.
- The SQLite database (`inference/main.db`) is shared between training and inference. In compose, the DB is ephemeral for simplicity; you can bind-mount if needed.
- Images in the k8s directory are placeholders; update them with your registry.
