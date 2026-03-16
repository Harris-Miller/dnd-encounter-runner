import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';

import { ulidPk } from '../column.utils';

export const spells = pgTable('spells', {
  castingTime: text().notNull(),
  description: text(),
  duration: text().notNull(),
  id: ulidPk(),
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
});
