import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import natural from 'natural';

const { BayesClassifier } = natural;
let classifier = null;

// NOTE: In production you'd pull the model from MLflow Model Registry.
// For this template, try to load a local demo artifact if present.
async function loadDemoModel() {
  try {
    const artifactPath = new URL(`../../artifacts/model_latest.json`, import.meta.url).pathname;
    console.log(`Loading demo model: ${artifactPath}`);
    const modelJson = await Bun.file(artifactPath).text();
    classifier = BayesClassifier.restore(JSON.parse(modelJson));
  } catch (e) {
    console.error('Could not load a demo model. Please run training to produce an artifact.', e.message);
  }
}


const app = new Elysia()
  .use(cors())
  .post('/predict', async ({ body }) => {
    if (!classifier) return { error: 'Model is not loaded on the server. The MLOps pipeline is the focus.' };
    const prediction = classifier.getClassifications(body.message);
    return { prediction };
  }, {
    // `t.Object` is a runtime schema validator; useful in JS too.
    body: t.Object({ message: t.String() })
  })
  .listen(3001);

console.log(`API running at http://${app.server?.hostname}:${app.server?.port}`);
loadDemoModel();
