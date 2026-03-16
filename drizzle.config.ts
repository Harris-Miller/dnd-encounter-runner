import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.development' });

// TODO: const dbUrl = process.env.DATABASE_URL;
const dbUrl: string | undefined = 'postgres://postgres:postgres@localhost:5435/dnd_2?sslmode=disable';

console.log(dbUrl);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  // @ts-expect-error - drizzle-kit@beta doesn't have this typed yet
  relations: './db/relations.ts',
  schema: './db/schema.ts',
});
