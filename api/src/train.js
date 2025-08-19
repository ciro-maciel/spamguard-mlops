import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './db/schema.js';
import { eq } from 'drizzle-orm';
import natural from 'natural';
import { promises as fs } from 'fs';

const { BayesClassifier } = natural;

async function trainAndEvaluate() {
  console.log('Iniciando o pipeline de treinamento...');

  // Lê o dataset da raiz do monorepo (script roda em api/)
  const datasetRaw = await fs.readFile('../dataset.csv', 'utf-8');
  const dataset = datasetRaw.split('\n').slice(1).map(line => {
    const parts = line.match(/(?:\"([^\"]+)\"|([^,]+)),(.+)/);
    if (!parts) return null;
    return { text: parts[1] || parts[2], label: parts[3] };
  }).filter(Boolean);

  const classifier = new BayesClassifier();
  dataset.forEach(item => item && classifier.addDocument(item.text, item.label));
  classifier.train();
  console.log('Modelo treinado.');

  let correct = 0;
  dataset.forEach(item => {
    if (item && classifier.classify(item.text) === item.label) correct++;
  });
  const accuracy = correct / dataset.length;
  const metrics = { f1Score: accuracy, accuracy: accuracy }; // Simplificação
  console.log(`Acurácia do novo modelo: ${metrics.accuracy}`);

  const sqlite = new Database('main.db', { create: true });
  const db = drizzle(sqlite, { schema });

  // Garante que exista um experimento padrão e obtem seu ID
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
    console.warn('Não foi possível verificar/criar experimento padrão:', e?.message || e);
  }

  const currentProdRun = await db.query.runs.findFirst({
    where: eq(schema.runs.isProduction, true),
  });

  // Lê métricas atuais do modelo em produção (podem estar como string JSON)
  let currentProdAccuracy = 0;
  if (currentProdRun?.metrics) {
    try {
      const m = typeof currentProdRun.metrics === 'string' ? JSON.parse(currentProdRun.metrics) : currentProdRun.metrics;
      currentProdAccuracy = m?.accuracy || 0;
    } catch {
      currentProdAccuracy = 0;
    }
  }
  console.log(`Acurácia do modelo em produção: ${currentProdAccuracy}`);

  if (metrics.accuracy <= currentProdAccuracy) {
    console.log('Novo modelo não superou o modelo em produção. Abortando.');
    return;
  }

  console.log('Novo modelo é superior! Promovendo para produção.');
  const runId = Date.now();
  // Salva o artefato dentro de api/artifacts para que a API (rodando do root) encontre com o mesmo path
  const modelArtifactPath = `api/artifacts/model_${runId}.json`;

  await fs.mkdir('artifacts', { recursive: true });
  const classifierJson = JSON.stringify(classifier);
  // Garante a pasta correta: ao escrever usamos path relativo ao CWD atual (api/). Remova o prefixo 'api/' aqui.
  await fs.writeFile(`artifacts/model_${runId}.json`, classifierJson);
  console.log(`Modelo salvo em: ${modelArtifactPath}`);

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

  console.log('Pipeline de treinamento concluído com sucesso!');
}

trainAndEvaluate();
