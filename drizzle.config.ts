import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.development' });

const dbUrl = process.env.DATABASE_URL;

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
  schema: ['./db/schema.ts', './db/relations.ts'],
});
