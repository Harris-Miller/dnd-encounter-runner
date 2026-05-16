import type { InferInsertModel } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { reset, seed } from 'drizzle-seed';

import type { createSeedClient } from './connection.ts';

type SeedRefineTableKey = 'magicItems' | 'monsters' | 'spells';

type SeedDb = ReturnType<typeof createSeedClient>['db'];

const OMIT_VALUE_COLUMNS = new Set(['id', 'createdAt', 'updatedAt']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readRowValue = <Table extends PgTable>(row: InferInsertModel<Table>, key: string): unknown => {
  if (!isRecord(row)) {
    throw new Error('Each seed row must be a plain object.');
  }
  return (row as Record<string, unknown>)[key];
};

export const resetAndDeterministicSeedPgTable = async <Table extends PgTable>(params: {
  columnsFalse: readonly string[];
  db: SeedDb;
  refineTableKey: SeedRefineTableKey;
  rows: InferInsertModel<Table>[];
  seedNumber: number;
  table: Table;
}): Promise<void> => {
  const { columnsFalse, db, refineTableKey, rows, seedNumber, table } = params;

  await reset(db, { [refineTableKey]: table } as Record<string, Table>);

  if (rows.length === 0) {
    return;
  }

  const falseColumnSet = new Set(columnsFalse);

  const keys = rows.flatMap(row => {
    if (!isRecord(row)) {
      throw new Error('Each seed row must be a plain object.');
    }

    return Object.keys(row).filter(key => !OMIT_VALUE_COLUMNS.has(key) && !falseColumnSet.has(key));
  });

  const uniqueKeys = [...new Set(keys)];

  const sortedDataKeys = uniqueKeys.toSorted((left, right) => left.localeCompare(right));

  await seed(db, { [refineTableKey]: table } as never, { count: rows.length, seed: seedNumber }).refine(funcs => {
    const dataKeyEntries = sortedDataKeys.map(
      key => [key, funcs.valuesFromArray({ values: rows.map(row => readRowValue(row, key)) as never })] as const,
    );

    const falseEntries = columnsFalse.map(key => [key, false] as const);

    const columns: Record<string, unknown> = {
      createdAt: false,
      id: funcs.uuid(),
      updatedAt: false,
      ...Object.fromEntries(dataKeyEntries),
      ...Object.fromEntries(falseEntries),
    };

    return {
      [refineTableKey]: {
        columns,
        count: rows.length,
      },
    } as never;
  });
};
