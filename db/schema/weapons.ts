import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { uuidFk, uuidFkCascade, uuidPk } from '../column.utils';

// import { damageTypes } from './general';

export const mastery = pgTable('mastery', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  description: text().notNull(),
  id: uuidPk(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const weapons = pgTable('weapons', {
  /** simple or martial */
  category: text().notNull(),
  /** melee or ranged */
  classification: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  // TODO: these need to be combined and made into an array
  // damageDie: text().notNull(),
  // damageTypeId: ulidFk(() => damageTypes.id),
  id: uuidPk(),
  masteryId: uuidFk(() => mastery.id).notNull(),
  name: text().notNull().unique(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const weaponProperties = pgTable('weapon_properties', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  id: uuidPk(),
  name: text().notNull(),
  rangeLong: integer(),
  rangeShort: integer(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
  versatileDamageDie: text(),
});

export const weaponToWeaponProperties = pgTable('weapon_to_weapon_properties', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
  weaponId: uuidFkCascade(() => weapons.id).notNull(),
  weaponPropertyId: uuidFkCascade(() => weaponProperties.id).notNull(),
});
