// Public entry point of @saveroo/shared: zod schemas, types and helpers.
// Browser code should import t() from `@saveroo/shared/i18n` so zod stays out of page bundles.
// Imported by apps/web and apps/api (later also mobile and extension).
export * from './api';
export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums } from './database.types';
export * from './health';
export * from './i18n';
