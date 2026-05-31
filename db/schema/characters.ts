import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFkCascade, uuidFkSetNull, uuidPk } from '../column.utils.ts';

import { campaigns } from './campaigns.ts';
import { profiles } from './profile.ts';

export const characters = pgTable.withRLS('characters', {
  armorClass: integer().notNull(),
  campaignId: uuidFkSetNull(() => campaigns.id),
  createdAt: createdAt(),
  id: uuidPk(),
  level: integer().notNull().default(1),
  maxHitPoints: integer().notNull(),
  name: text().notNull(),
  notes: text(),
  profileId: uuidFkCascade(() => profiles.id),
  updatedAt: updatedAt(),
});
