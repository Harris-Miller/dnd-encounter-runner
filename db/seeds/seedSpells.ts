import { spells } from '../schema/spells.ts';

import type { createSeedClient } from './connection.ts';
import { drizzleSeedForSpells } from './drizzleSeedNumbers.ts';
import { chunk, readJsonArray } from './json.ts';
import { resolveDataJsonPath } from './paths.ts';
import { resetAndDeterministicSeedPgTable } from './seedPgTableFromRows.ts';
import { spellInsertFromJsonRecord } from './spellJson.ts';

export const seedSpells = async (params: {
  client: ReturnType<typeof createSeedClient>;
  replaceExisting: boolean;
}): Promise<number> => {
  const { client, replaceExisting } = params;
  const path = resolveDataJsonPath('spells.json');
  const parsed = readJsonArray<unknown>(path, 'spells.json');
  const rows = parsed.map((entry, index) => spellInsertFromJsonRecord(entry, index));

  if (replaceExisting) {
    await resetAndDeterministicSeedPgTable({
      columnsFalse: [],
      db: client.db,
      refineTableKey: 'spells',
      rows,
      seedNumber: drizzleSeedForSpells(),
      table: spells,
    });
  } else {
    const batches = chunk(rows, 200);
    for (const batch of batches) {
      await client.db.insert(spells).values(batch);
    }
  }

  return rows.length;
};
