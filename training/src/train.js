import natural from 'natural';
import { promises as fs } from 'fs';

const { BayesClassifier } = natural;

async function trainAndEvaluate() {
  console.log('Starting training pipeline with DVC and MLflow...');

  // Read dataset centralized in data/raw/ (relative to this file)
  const datasetPath = new URL('../../data/raw/dataset.csv', import.meta.url).pathname;
  const datasetRaw = await fs.readFile(datasetPath, 'utf-8');
  const dataset = datasetRaw.split('\n').slice(1).map(line => {
    const parts = line.match(/(?:\"([^\"]+)\"|([^,]+)),(.+)/);
    if (!parts) return null;
    return { text: parts[1] || parts[2], label: parts[3] };
  }).filter(Boolean);

  const classifier = new BayesClassifier();
  dataset.forEach(item => item && classifier.addDocument(item.text, item.label));
  classifier.train();
  console.log('Model trained.');

  let correct = 0;
  dataset.forEach(item => {
    if (item && classifier.classify(item.text) === item.label) correct++;
  });
  const accuracy = correct / dataset.length;
  const metrics = { f1Score: accuracy, accuracy: accuracy }; // Simplification
  console.log(`New model accuracy: ${metrics.accuracy}`);

  // Save artifact under artifacts/
  const runId = Date.now();
  const artifactDir = new URL('../../artifacts/', import.meta.url).pathname;
  const modelArtifactPath = `${artifactDir}model_${runId}.json`;

  await fs.mkdir(artifactDir, { recursive: true });
  const classifierJson = JSON.stringify(classifier);
  await fs.writeFile(modelArtifactPath, classifierJson);
  // Keep a stable path for the inference demo server
  await fs.writeFile(`${artifactDir}model_latest.json`, classifierJson);
  console.log(`Model saved at: ${modelArtifactPath}`);

  // Version artifacts with DVC
  console.log('Versioning artifacts with DVC...');
  const dvcAddProcess = Bun.spawnSync(['dvc', 'add', 'artifacts']);
  if (dvcAddProcess.exitCode !== 0) {
    console.error('DVC Error:', dvcAddProcess.stderr.toString());
    throw new Error('Failed to version artifacts with DVC');
  }
  console.log(dvcAddProcess.stdout.toString());

  // Log metrics and artifacts to MLflow via helper script
  console.log('Logging to MLflow...');
  const metricsJsonString = JSON.stringify(metrics);
  const mlflowLogProcess = Bun.spawnSync([
      'python',
      new URL('log_mlflow.py', import.meta.url).pathname,
      metricsJsonString,
      artifactDir
  ]);

  if (mlflowLogProcess.exitCode !== 0) {
      console.error('MLflow Error:', mlflowLogProcess.stderr.toString());
      throw new Error('Failed to log to MLflow');
  }
  console.log(mlflowLogProcess.stdout.toString());

  console.log('Training pipeline completed successfully!');
}

trainAndEvaluate();
