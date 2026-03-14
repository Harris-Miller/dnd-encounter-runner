import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// the localhost fallback is for a running docker compose
const dbUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/dnd_encounter_runner';

export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    url: dbUrl,
  },
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/db/schema.ts',
});
