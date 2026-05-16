import { config } from 'dotenv';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import process from 'node:process';

import * as schema from '../schema.ts';

config({ path: '.env.development' });

export const createSeedClient = (): {
  close: () => Promise<void>;
  db: PostgresJsDatabase<typeof schema>;
  sql: ReturnType<typeof postgres>;
} => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl == null || databaseUrl === '') {
    throw new Error(
      'DATABASE_URL is not set. Ensure .env.development defines DATABASE_URL or export it before running seeds.',
    );
  }
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle({
    casing: 'snake_case',
    client: sql,
    schema,
  });
  return {
    close: () => sql.end({ timeout: 5 }),
    db,
    sql,
  };
};
