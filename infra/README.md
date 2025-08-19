# Infraestrutura (conceitual)

Este diretório contém artefatos de infraestrutura para executar o monorepo em ambientes conteinerizados ou orquestrados.

Estrutura:
- docker/
  - Dockerfile.inference: imagem do serviço de inferência (Elysia/Bun)
  - Dockerfile.dashboard: imagem do dashboard (Vite -> Nginx)
  - Dockerfile.training: imagem para job de treinamento on-demand
- docker-compose.yml: orquestração local dos serviços (inference + dashboard). O serviço de training está em profile opcional.
- k8s/
  - inference-deployment.yaml, inference-service.yaml
  - dashboard-deployment.yaml, dashboard-service.yaml

Observações:
- Artefatos de modelo ficam centralizados em `artifacts/` na raiz e são montados nos containers.
- O banco SQLite (`inference/main.db`) é compartilhado entre treino e inferência. No compose, o DB é efêmero por simplicidade; pode-se bind-mount conforme necessidade.
- As imagens no diretório k8s são placeholders; ajuste com seu registry.
