import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidPk } from '../column.utils.ts';

export const spells = pgTable.withRLS('spells', {
  castingTime: text().notNull(),
  createdAt: createdAt(),
  description: text(),
  duration: text().notNull(),
  id: uuidPk(),
  isConcentration: boolean().notNull(),
  isMaterial: boolean().notNull(),
  isRitual: boolean().notNull(),
  isSomatic: boolean().notNull(),
  isVerbal: boolean().notNull(),
  level: integer().notNull(),
  materialDescription: text(),
  name: text().notNull(),
  range: text().notNull(),
  school: text().notNull(),
  upcastDescription: text(),
  updatedAt: updatedAt(),
});
