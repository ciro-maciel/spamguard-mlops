# Use uma imagem Python leve
FROM python:3.9-slim

# Instale o mlflow
RUN pip install --no-cache-dir mlflow gunicorn

# Crie o diretório onde os dados do volume serão montados
RUN mkdir /mlflow-data

# Exponha a porta padrão do mlflow
EXPOSE 5000

# Garanta que o Gunicorn faça bind corretamente para o proxy do Fly
ENV GUNICORN_CMD_ARGS="--bind 0.0.0.0:5000 --workers 2 --timeout 180"

# Comando para iniciar o servidor mlflow
CMD ["mlflow", "server", "--host", "0.0.0.0", "--port", "5000", "--backend-store-uri", "sqlite:////mlflow-data/mlflow.db", "--default-artifact-root", "/mlflow-data/artifacts"]
