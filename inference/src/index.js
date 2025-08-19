import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './db/schema.js';
import { eq } from 'drizzle-orm';
import natural from 'natural';

const { BayesClassifier } = natural;

// Resolve DB path relative to this file (independent of CWD)
const dbPath = new URL('../main.db', import.meta.url).pathname;
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

let classifier = null;

async function loadProductionModel() {
    const prodRun = await db.query.runs.findFirst({ where: eq(schema.runs.isProduction, true) });
    if (prodRun && prodRun.modelArtifactPath) {
        // Resolve artifact path. If it's relative (e.g., 'artifacts/...'), resolve from the repo root.
        const artifactPath = prodRun.modelArtifactPath.startsWith('/')
          ? prodRun.modelArtifactPath
          : new URL(`../../${prodRun.modelArtifactPath}`, import.meta.url).pathname;
        console.log(`Loading model: ${artifactPath}`);
        const modelJson = await Bun.file(artifactPath).text();
        classifier = BayesClassifier.restore(JSON.parse(modelJson));
    } else {
        console.log("No production model found.");
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
        if(!classifier) return { error: 'Model is not loaded' };
    }
    const prediction = classifier.getClassifications(body.message);
    return { prediction };
  }, {
    // `t.Object` is a runtime schema validator; useful in JS too.
    body: t.Object({ message: t.String() })
  })
  .listen(3001);

console.log(`API running at http://${app.server?.hostname}:${app.server?.port}`);
loadProductionModel();
