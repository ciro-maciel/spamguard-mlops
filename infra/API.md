# API

Base URL (local): http://localhost:3001

## POST /predict
- Description: Returns ranked spam/ham classifications for a given message.
- Request
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    { "message": "congratulations! you won a prize" }
    ```
- Response (200)
  ```json
  {
    "prediction": [
      { "label": "spam", "value": 0.92 },
      { "label": "ham", "value": 0.08 }
    ]
  }
  ```
- Error
  - 400: invalid body
  - 500: internal error

- cURL
  ```bash
  curl -s -X POST http://localhost:3001/predict \
    -H "Content-Type: application/json" \
    -d '{"message":"congratulations! you won a prize"}' | jq
  ```

## GET /dashboard
- Description: Returns a list of training runs (newest first) with metrics.
- Response (200)
  ```json
  [
    {
      "id": 1739999999999,
      "experimentId": 1,
      "createdAt": "2025-08-19T12:34:56.000Z",
      "gitCommit": "a1b2c3d",
      "metrics": { "accuracy": 0.90, "f1Score": 0.90 },
      "modelArtifactPath": "artifacts/model_1739999999999.json",
      "isProduction": true
    }
  ]
  ```

## CORS
- CORS is enabled in the inference service (`@elysiajs/cors`). The dashboard (Vite) can call the API directly in local dev.

## Notes
- If you get `"Model is not loaded"`, run a training job: `bun --cwd training run train`.
- Artifacts are JSON files saved under `artifacts/` and referenced from the DB.
