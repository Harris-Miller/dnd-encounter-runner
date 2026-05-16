import type { InferInsertModel } from 'drizzle-orm';

import { magicItems } from '../schema/magicItems.ts';

import type { createSeedClient } from './connection.ts';
import { drizzleSeedForMagicItems } from './drizzleSeedNumbers.ts';
import { chunk, readJsonArray } from './json.ts';
import { resolveDataJsonPath } from './paths.ts';
import { resetAndDeterministicSeedPgTable } from './seedPgTableFromRows.ts';

type MagicItemInsert = InferInsertModel<typeof magicItems>;

interface MagicItemJson {
  category: string;
  categorySpecifier: string | null;
  ddbId: string | null;
  description: string;
  isConsumable: boolean;
  isCursed: boolean;
  name: string;
  rarity: string;
  requiresAttunement: boolean;
  slug: string | null;
  variantRarities: string[] | null;
}

/* `variant_rarities` exists on the Drizzle schema but not yet in applied migrations; omit until the column exists. */
const mapMagicItemRow = (row: MagicItemJson): MagicItemInsert => ({
  categorySpecifierText: row.categorySpecifier,
  ddbId: row.ddbId,
  descriptionText: row.description,
  isConsumable: row.isConsumable,
  isCursed: row.isCursed,
  magicItemCategory: row.category,
  magicItemRarityId: row.rarity,
  name: row.name,
  requiresAttunement: row.requiresAttunement,
  slug: row.slug,
});

export const seedMagicItems = async (params: {
  client: ReturnType<typeof createSeedClient>;
  replaceExisting: boolean;
}): Promise<number> => {
  const { client, replaceExisting } = params;
  const path = resolveDataJsonPath('magicItems.json');
  const rows = readJsonArray<MagicItemJson>(path, 'magicItems.json').map(mapMagicItemRow);

  if (replaceExisting) {
    await resetAndDeterministicSeedPgTable({
      columnsFalse: ['variantRarities'],
      db: client.db,
      refineTableKey: 'magicItems',
      rows,
      seedNumber: drizzleSeedForMagicItems(),
      table: magicItems,
    });
  } else {
    const batches = chunk(rows, 200);
    for (const batch of batches) {
      await client.db.insert(magicItems).values(batch);
    }
  }

  return rows.length;
};
