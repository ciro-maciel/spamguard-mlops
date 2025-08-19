import mlflow
import sys
import json

# Argumentos: 1=metricas_json, 2=caminho_artefatos_dir
metrics_json = sys.argv[1]
artifacts_dir = sys.argv[2]

metrics = json.loads(metrics_json)

# Inicia uma nova execução no MLflow
with mlflow.start_run():
    print("MLflow: Logging metrics...")
    mlflow.log_metrics(metrics)
    print("MLflow: Logging model artifacts...")
    mlflow.log_artifacts(artifacts_dir, artifact_path="model")
    print("MLflow: Logged successfully.")
