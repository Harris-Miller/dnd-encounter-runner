import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidPk } from '../column.utils';

export const magicItems = pgTable.withRLS('magic_items', {
  categorySpecifierText: text(),
  createdAt: createdAt(),
  ddbId: text(),
  descriptionText: text(),
  id: uuidPk(),
  isConsumable: boolean().notNull(),
  isCursed: boolean().notNull(),
  magicItemCategory: text().notNull(),
  magicItemRarityId: text().notNull(),
  name: text().notNull(),
  requiresAttunement: boolean().notNull(),
  slug: text(),
  updatedAt: updatedAt(),
});
