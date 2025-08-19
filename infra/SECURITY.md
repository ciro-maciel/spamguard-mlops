# Security (checklist)

Quick checklist for minimal hardening.

- AuthN/Z: Protect inference API (API key/JWT). Limit roles for dashboard.
- Rate limiting: Prevent abuse on `/predict`.
- Secrets: Never commit. Store in CI/CD secrets/manager.
- TLS: Encrypt in transit (HTTPS/ingress). Avoid plain HTTP over public networks.
- Data at rest: If using managed DB/object storage, enable encryption + backups.
- Logs: Redact PII/tokens. Use structured logs.
- CORS: Restrict origins in production.
- Dependencies: Pin/update; enable Dependabot/Renovate.
- Containers: Minimal images; add `.dockerignore`; scan images.
- CI/CD: Branch protections, PR reviews, SAST/dep/container scans.
- Observability: Metrics + alerts for latency, errors, model load failures.
- Privacy: Document retention/deletion if handling user data.
