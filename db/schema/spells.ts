import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { uuidPk } from '../column.utils';

export const spells = pgTable('spells', {
  castingTime: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
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
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
