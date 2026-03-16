import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { damageTypes } from '../schema';
import { ulidFk, ulidPk } from '../column.utils';

export const mastery = pgTable('mastery', {
  description: text().notNull(),
  id: ulidPk(),
});

export const weapons = pgTable('weapons', {
  /** simple or martial */
  category: text().notNull(),
  /** melee or ranged */
  classification: text().notNull(),
  damageDie: text().notNull(),
  damageTypeId: ulidFk(() => damageTypes.id),
  id: ulidPk(),
  masteryId: ulidFk(() => mastery.id).notNull(),
  name: text().notNull().unique(),
});

export const weaponProperties = pgTable('weapon_properties', {
  id: ulidPk(),
  name: text().notNull(),
  rangeLong: integer(),
  rangeShort: integer(),
  versatileDamageDie: text(),
});
