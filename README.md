# SpamGuard MLOps — Landing

This repository highlights two complementary tracks of my MLOps skill set:

- Concepts (baseline): principles, architecture decisions, and end-to-end flow.
  Branch: mlops-concepts

- Market tools: DVC (data versioning) + MLflow (experiment tracking/model registry),
  hardened CI/CD and containerized deployment.
  Branch: mlops-market-tools

How to use:
- Read this overview and pick the track you’re interested in.
- Each branch has its own README with Quickstart, decisions, and trade-offs.

What you’ll see:
- Train → metric-gated promotion → serving
- Versioned artifacts, schema migrations (Drizzle/SQLite)
- GitHub Actions CI/CD
- Docker/Compose and K8s manifests (portability)
- DVC and MLflow in the market-tools track

Quick links:
- Concepts: branch mlops-concepts
- Market tools: branch mlops-market-tools
- High-level diff: compare mlops-concepts...mlops-market-tools

# SpamGuard MLOps

Production-minded, didactic MLOps template for spam detection. Service-oriented structure with clear seams to evolve from a baseline to production.

## Start here

- Executive summary (1‑min): `infra/ONE-PAGER.md`
- Quickstart: see the next section below

## Value proposition

- Fast: minutes from dataset to serving a model
- Clear: simple stack for onboarding and interviews
- Extensible: upgrade DB, swap model, add observability without rewrites
- Portable: Bun-native dev, Docker/K8s-ready

## Repository structure

```
artifacts/                 # Centralized model artifacts (JSON)
data/raw/dataset.csv       # Sample dataset (CSV)
dashboard/                 # React + Mantine UI (demo/dashboard)
inference/                 # API (Bun + Elysia) + Drizzle ORM + SQLite
training/                  # Training job (Natural Naive Bayes)
infra/                     # Dockerfiles, Compose, K8s manifests, docs
```

## Quickstart (local)

Prereq: Bun installed (https://bun.sh/)

Install dependencies (workspaces):

```sh
bun install
```

Run DB migrations (if needed):

```sh
bun --cwd inference run db:generate
bun --cwd inference run db:migrate
```

Train and promote a model:

```sh
bun --cwd training run train
ls -l artifacts
```

Start services (inference API + dashboard):

```sh
bun run dev
# API: http://localhost:3001
# UI:  http://localhost:5173 (Vite default) or as configured in dashboard
```

## Quickstart (Docker Compose)

```sh
docker compose -f infra/docker-compose.yml up -d --build inference dashboard
# Optional on-demand training job
docker compose -f infra/docker-compose.yml --profile training run --rm training
```

## API (short)

- POST `/predict` -> `{ prediction: [{ label, value }, ...] }`
- GET `/dashboard` -> list of runs with metrics
  Details: see `infra/API.md`.

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci-cd.yml`):

1. Install deps
2. Generate + apply DB migrations
3. Train and (if better) promote model, saving artifact to `artifacts/`
4. Build dashboard and upload artifact (deploy step is a placeholder)

## Tech stack

- Runtime: Bun (JavaScript ESM)
- API: Elysia, @elysiajs/cors
- ORM/DB: Drizzle ORM + SQLite
- ML: Natural (Naive Bayes)
- UI: React, Mantine, Recharts, Vite
- CI: GitHub Actions
- Infra: Docker, Docker Compose, Kubernetes manifests

## Architecture & Ops

- One-pager (simple): `infra/ONE-PAGER.md`
- API reference: `infra/API.md`
- Runbook (local, Compose, K8s, troubleshooting): `infra/RUNBOOK.md`
- Security checklist: `infra/SECURITY.md`
- Infra index: `infra/README.md`

## Notes

- This is an educational template. For production, upgrade DB (e.g., Postgres), add auth/rate limiting, observability, and persistent volumes.
