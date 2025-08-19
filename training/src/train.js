import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../inference/src/db/schema.js';
import { eq } from 'drizzle-orm';
import natural from 'natural';
import { promises as fs } from 'fs';

const { BayesClassifier } = natural;

async function trainAndEvaluate() {
  console.log('Starting training pipeline...');

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

  // Use the same DB as the inference service (inference/main.db)
  const dbPath = new URL('../../inference/main.db', import.meta.url).pathname;
  const sqlite = new Database(dbPath, { create: true });
  const db = drizzle(sqlite, { schema });

  // Ensure a default experiment exists and get its ID
  let experimentId = 1;
  try {
    const existing = await db.query.experiments.findFirst({
      where: eq(schema.experiments.name, 'default'),
    });
    if (!existing) {
      await db.insert(schema.experiments).values({ name: 'default' });
      const created = await db.query.experiments.findFirst({
        where: eq(schema.experiments.name, 'default'),
      });
      experimentId = created?.id ?? 1;
    } else {
      experimentId = existing.id;
    }
  } catch (e) {
    console.warn('Could not verify/create default experiment:', e?.message || e);
  }

  const currentProdRun = await db.query.runs.findFirst({
    where: eq(schema.runs.isProduction, true),
  });

  // Read current production model metrics (may be stored as JSON string)
  let currentProdAccuracy = 0;
  if (currentProdRun?.metrics) {
    try {
      const m = typeof currentProdRun.metrics === 'string' ? JSON.parse(currentProdRun.metrics) : currentProdRun.metrics;
      currentProdAccuracy = m?.accuracy || 0;
    } catch {
      currentProdAccuracy = 0;
    }
  }
  console.log(`Production model accuracy: ${currentProdAccuracy}`);

  if (metrics.accuracy <= currentProdAccuracy) {
    console.log('New model did not outperform the production model. Aborting.');
    return;
  }

  console.log('New model is better! Promoting to production.');
  const runId = Date.now();
  // Save artifact centralized under artifacts/ at the repo root
  const modelArtifactPath = `artifacts/model_${runId}.json`;

  const artifactDir = new URL('../../artifacts/', import.meta.url).pathname;
  await fs.mkdir(artifactDir, { recursive: true });
  const classifierJson = JSON.stringify(classifier);
  await fs.writeFile(`${artifactDir}model_${runId}.json`, classifierJson);
  console.log(`Model saved at: ${modelArtifactPath}`);

  if (currentProdRun) {
    await db.update(schema.runs).set({ isProduction: false }).where(eq(schema.runs.id, currentProdRun.id));
  }

  const gitCommit = Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']).stdout.toString().trim();
  await db.insert(schema.runs).values({
    experimentId,
    gitCommit,
    metrics: JSON.stringify(metrics),
    modelArtifactPath,
    isProduction: true,
  });

  console.log('Training pipeline completed successfully!');
}

trainAndEvaluate();
