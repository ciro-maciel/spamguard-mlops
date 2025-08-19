# SpamGuard MLOps — Executive Summary (1‑minute read)

## What it is

A minimal, production‑minded template for spam detection with three services:

- Inference API (Bun + Elysia) serving a Naive Bayes model
- Training job that promotes the best model automatically
- Dashboard (React + Mantine) to view runs/metrics

State is simple and local by default:

- SQLite DB at `inference/main.db` via Drizzle ORM
- Model artifacts (JSON) in `artifacts/`

## Why it matters

- Ship fast: minutes from dataset → trained → served
- Stay clear: small, readable stack for onboarding and demos
- Evolve safely: promotion only when metrics improve

## Run in 60 seconds

```sh
bun install
bun --cwd inference run db:generate && bun --cwd inference run db:migrate
bun --cwd training run train
bun run dev  # API: http://localhost:3001  UI: http://localhost:5173
```

## KPIs

- Accuracy vs. dataset (proxy for F1)
- Promotion rule: only promote if accuracy improves
- Lead time to change: single CI run from train → promote → serve

## Upgrade paths

- DB: SQLite → Postgres
- Tracking: add MLflow (experiments/artifacts)
- Ops: add auth, rate limiting, and observability (Prometheus/Grafana)
- Deploy: use provided Docker/K8s scaffolding and your registry
