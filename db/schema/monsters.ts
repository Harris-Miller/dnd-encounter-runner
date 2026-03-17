import { sql } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { uuidPk } from '../column.utils';

const textArray = () =>
  text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`);

export const monsters = pgTable('monsters', {
  id: uuidPk(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),

  actions: textArray(),
  alignment: text().notNull(),
  armorClass: integer().notNull(),
  bonusActions: textArray(),
  challengeRating: text().notNull(),
  charisma: integer().notNull(),
  charismaSave: integer().notNull(),
  constitution: integer().notNull(),
  constitutionSave: integer().notNull(),
  creatureType: text().notNull(),
  descriptiveTags: text(),
  dexterity: integer().notNull(),
  dexteritySave: integer().notNull(),
  experiencePoints: integer(),
  experiencePointsAlt: text(),
  gear: text(),
  hitPointDice: text().notNull(),
  hitPoints: integer().notNull(),
  immunities: textArray(),
  initiativeModifier: text().notNull(),
  initiativeScore: integer().notNull(),
  intelligence: integer().notNull(),
  intelligenceSave: integer().notNull(),
  languages: text().notNull(),
  legendaryActions: textArray(),
  name: text().notNull(),
  proficiencyBonus: integer().notNull(),
  reactions: textArray(),
  resistances: textArray(),
  senses: textArray(),
  size: text().notNull(),
  skills: textArray(),
  speed: text().notNull(),
  speedBurrow: text(),
  speedClimb: text(),
  speedFly: text(),
  speedSwim: text(),
  strength: integer().notNull(),
  strengthSave: integer().notNull(),
  traits: textArray(),
  vulnerabilities: text(),
  wisdom: integer().notNull(),
  wisdomSave: integer().notNull(),
});
