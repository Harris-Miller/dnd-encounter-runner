import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

if (process.env.GITHUB_ACTIONS !== 'true') {
  config({ path: '.env.development' });
}

const dbUrl = process.env.DATABASE_URL;

if (dbUrl == null || dbUrl === '') {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    url: dbUrl,
  },
  dialect: 'postgresql',
  out: './drizzle',
  schema: ['./db/schema.ts'],
});
