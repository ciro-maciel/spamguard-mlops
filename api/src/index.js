import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './db/schema.js';
import { eq } from 'drizzle-orm';
import natural from 'natural';

const { BayesClassifier } = natural;

// Resolve caminho do DB relativo a este arquivo (independente do CWD)
const dbPath = new URL('../main.db', import.meta.url).pathname;
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

let classifier = null;

async function loadProductionModel() {
    const prodRun = await db.query.runs.findFirst({ where: eq(schema.runs.isProduction, true) });
    if (prodRun && prodRun.modelArtifactPath) {
        console.log(`Carregando modelo: ${prodRun.modelArtifactPath}`);
        const modelJson = await Bun.file(prodRun.modelArtifactPath).text();
        classifier = BayesClassifier.restore(JSON.parse(modelJson));
    } else {
        console.log("Nenhum modelo em produção encontrado.");
    }
}

function parseMetrics(m) {
  try {
    if (!m) return null;
    return typeof m === 'string' ? JSON.parse(m) : m;
  } catch {
    return null;
  }
}

const app = new Elysia()
  .use(cors())
  .get('/dashboard', async () => {
    const rows = await db.query.runs.findMany({
      orderBy: (runs, { desc }) => [desc(runs.createdAt)],
    });
    return rows.map((r) => ({ ...r, metrics: parseMetrics(r.metrics) }));
  })
  .post('/predict', async ({ body }) => {
    if (!classifier) {
        await loadProductionModel();
        if(!classifier) return { error: 'Modelo não está carregado' };
    }
    const prediction = classifier.getClassifications(body.message);
    return { prediction };
  }, {
    // O `t.Object` é um validador de schema em tempo de execução, útil também em JS.
    body: t.Object({ message: t.String() })
  })
  .listen(3001);

console.log(`API rodando em http://${app.server?.hostname}:${app.server?.port}`);
loadProductionModel();
