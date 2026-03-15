import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.development' });

// the localhost fallback is for a running docker compose
const dbUrl = process.env.DATABASE_URL;

console.log(dbUrl);

if (dbUrl == null || dbUrl === '') {
  throw new Error('DATABASE_URL is not set');
} else {
  console.log(`DATABASE_URL is set as "${dbUrl}"`);
}

export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    url: dbUrl,
  },
  dialect: 'postgresql',
  out: './drizzle',
  relations: './db/relations.ts',
  schema: './db/schema.ts',
});
