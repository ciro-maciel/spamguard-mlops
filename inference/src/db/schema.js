import { sqliteTable, text, real, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const experiments = sqliteTable('experiments', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const runs = sqliteTable('runs', {
  id: integer('id').primaryKey(),
  experimentId: integer('experiment_id').notNull().references(() => experiments.id),
  gitCommit: text('git_commit'),
  // O helper de tipo '$type' foi removido para compatibilidade com JavaScript.
  metrics: text('metrics', { mode: 'json' }),
  modelArtifactPath: text('model_artifact_path'),
  isProduction: integer('is_production', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
