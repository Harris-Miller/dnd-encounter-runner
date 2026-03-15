import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.development' });

// the localhost fallback is for a running docker compose
const dbUrl = 'postgres://postgres:postgres@localhost:5435/dnd_2?sslmode=disable';
export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    url: dbUrl,
  },
  dialect: 'postgresql',
  out: './drizzle2',
  // @ts-expect-error - drizzle-kit@beta doesn't have this typed yet
  relations: './db2/relations.ts',
  schema: './db2/schema.ts',
});
