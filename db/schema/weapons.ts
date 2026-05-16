import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, uuidFk, uuidFkCascade, uuidPk } from '../column.utils.ts';

// import { damageTypes } from './general';

export const mastery = pgTable.withRLS('mastery', {
  createdAt: createdAt(),
  description: text().notNull(),
  id: uuidPk(),
  updatedAt: updatedAt(),
});

export const weapons = pgTable.withRLS('weapons', {
  /** simple or martial */
  category: text().notNull(),
  /** melee or ranged */
  classification: text().notNull(),
  createdAt: createdAt(),
  // TODO: these need to be combined and made into an array
  // damageDie: text().notNull(),
  // damageTypeId: ulidFk(() => damageTypes.id),
  id: uuidPk(),
  masteryId: uuidFk(() => mastery.id).notNull(),
  name: text().notNull().unique(),
  updatedAt: updatedAt(),
});

export const weaponProperties = pgTable.withRLS('weapon_properties', {
  createdAt: createdAt(),
  id: uuidPk(),
  name: text().notNull(),
  rangeLong: integer(),
  rangeShort: integer(),
  updatedAt: updatedAt(),
  versatileDamageDie: text(),
});

export const weaponToWeaponProperties = pgTable.withRLS('weapon_to_weapon_properties', {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  weaponId: uuidFkCascade(() => weapons.id).notNull(),
  weaponPropertyId: uuidFkCascade(() => weaponProperties.id).notNull(),
});
