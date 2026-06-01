import { config } from 'dotenv';
import postgres from 'postgres';

import { readFileSync } from 'node:fs';
import process from 'node:process';

config({ path: '.env.development', quiet: true });

const TIMESTAMP_COLUMNS = new Set(['created_at', 'updated_at']);

const SEEDED_TABLES = ['spells', 'monsters', 'magic_items'] as const;

type SeededTable = (typeof SEEDED_TABLES)[number];

type UnknownRow = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRow =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stripTimestamps = (row: UnknownRow): UnknownRow => {
  const next: UnknownRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (!TIMESTAMP_COLUMNS.has(key)) {
      next[key] = value;
    }
  }
  return next;
};

const stableStringify = (row: UnknownRow): string => JSON.stringify(row, Object.keys(row).toSorted());

const normalizeRowForCompare = (row: UnknownRow): UnknownRow => {
  const asJson = structuredClone(row);
  return stripTimestamps(asJson);
};

const assertRowsEqualIgnoringTimestamps = (label: string, before: UnknownRow[], after: UnknownRow[]): void => {
  if (before.length !== after.length) {
    throw new Error(`${label}: row count mismatch (${before.length} vs ${after.length})`);
  }
  for (let index = 0; index < before.length; index += 1) {
    const left = normalizeRowForCompare(before[index] ?? {});
    const right = normalizeRowForCompare(after[index] ?? {});
    if (stableStringify(left) !== stableStringify(right)) {
      throw new Error(
        `${label}: row at index ${index} differs after reseed.\nBefore: ${stableStringify(left)}\nAfter:  ${stableStringify(right)}`,
      );
    }
  }
};

const sampleIds = async (sql: ReturnType<typeof postgres>, table: SeededTable, limit: number): Promise<string[]> => {
  const rows = await sql.unsafe(`select id from ${table} order by random() limit ${limit}`);
  if (!Array.isArray(rows)) {
    throw new TypeError(`Expected array result sampling ${table}`);
  }
  return rows.map(r => {
    if (!isRecord(r) || typeof r.id !== 'string') {
      throw new Error(`Malformed id row from ${table}`);
    }
    return r.id;
  });
};

const fetchRowsByIds = async (
  sql: ReturnType<typeof postgres>,
  table: SeededTable,
  ids: readonly string[],
): Promise<UnknownRow[]> => {
  const rows: UnknownRow[] = [];
  for (const id of ids) {
    const result = await sql.unsafe(`select * from ${table} where id = $1`, [id]);
    if (!Array.isArray(result) || result.length !== 1) {
      throw new Error(`Expected exactly one row in ${table} for id ${id}`);
    }
    const [row] = result;
    if (!isRecord(row)) {
      throw new Error(`Malformed row from ${table}`);
    }
    rows.push(row);
  }
  return rows;
};

const fetchTableCount = async (sql: ReturnType<typeof postgres>, table: SeededTable): Promise<number> => {
  const rows = await sql.unsafe(`select count(*)::int as c from ${table}`);
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error(`Expected count row from ${table}`);
  }
  const [row] = rows;
  if (!isRecord(row) || typeof row.c !== 'number') {
    throw new Error(`Malformed count from ${table}`);
  }
  return row.c;
};

const captureSnapshot = async (): Promise<string> => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl == null || databaseUrl === '') {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = postgres(databaseUrl, { max: 1 });
  try {
    const sampleSize = 5;
    const payload: Record<string, unknown> = { countsByTable: {}, idsByTable: {} };
    for (const table of SEEDED_TABLES) {
      const count = await fetchTableCount(sql, table);
      (payload.countsByTable as Record<string, number>)[table] = count;
      const ids = await sampleIds(sql, table, sampleSize);
      const rows = await fetchRowsByIds(sql, table, ids);
      (payload.idsByTable as Record<string, string[]>)[table] = ids;
      payload[`${table}_rows`] = rows;
    }
    return JSON.stringify(payload, null, 2);
  } finally {
    await sql.end({ timeout: 5 });
  }
};

const compareSnapshot = async (snapshotJson: string): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl == null || databaseUrl === '') {
    throw new Error('DATABASE_URL is not set');
  }
  const parsed: unknown = JSON.parse(snapshotJson);
  if (!isRecord(parsed) || !isRecord(parsed.idsByTable) || !isRecord(parsed.countsByTable)) {
    throw new Error('Snapshot JSON must contain idsByTable and countsByTable objects');
  }

  const sql = postgres(databaseUrl, { max: 1 });
  try {
    for (const table of SEEDED_TABLES) {
      const expectedCount = parsed.countsByTable[table];
      if (typeof expectedCount !== 'number') {
        throw new TypeError(`Snapshot counts for ${table} must be a number`);
      }
      const actualCount = await fetchTableCount(sql, table);
      if (actualCount !== expectedCount) {
        throw new Error(`${table}: row count changed (${expectedCount} -> ${actualCount})`);
      }

      const rawIds = parsed.idsByTable[table];
      if (!Array.isArray(rawIds) || !rawIds.every((id): id is string => typeof id === 'string')) {
        throw new Error(`Snapshot ids for ${table} must be a string array`);
      }
      const rowsBefore = parsed[`${table}_rows`];
      if (!Array.isArray(rowsBefore) || !rowsBefore.every(isRecord)) {
        throw new Error(`Snapshot missing ${table}_rows array`);
      }
      const rowsAfter = await fetchRowsByIds(sql, table, rawIds);
      assertRowsEqualIgnoringTimestamps(table, rowsBefore, rowsAfter);
      console.log(
        `${table}: OK (${rawIds.length} sampled rows + count ${actualCount}, excluding created_at/updated_at)`,
      );
    }
    console.log('\nAll sampled rows match after second seed.');
  } finally {
    await sql.end({ timeout: 5 });
  }
};

const argv = process.argv.slice(2);
if (argv.includes('--capture')) {
  const json = await captureSnapshot();
  console.log(json);
} else if (argv.includes('--compare')) {
  const pathIndex = argv.indexOf('--from-file');
  const filePath = pathIndex === -1 ? undefined : argv[pathIndex + 1];
  if (filePath === undefined || filePath === '') {
    throw new Error('Usage: node db/seeds/verifyDeterministicReseed.ts --compare --from-file <path.json>');
  }
  await compareSnapshot(readFileSync(filePath, 'utf8'));
} else {
  throw new Error('Usage: node db/seeds/verifyDeterministicReseed.ts --capture | --compare --from-file <path.json>');
}
