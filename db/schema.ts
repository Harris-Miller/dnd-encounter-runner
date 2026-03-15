import {
  boolean,
  char,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { ulid as getUlid } from 'ulid';

const ulid = () => char({ length: 26 });

export const sourceTypeEnum = pgEnum('source_type', [
  'player_character',
  'monster',
]);
export const damageModifierEnum = pgEnum('damage_modifier', [
  'vulnerable',
  'resistant',
  'immune',
]);
export const statusTriggerEnum = pgEnum('status_trigger', [
  'start_of_turn',
  'end_of_turn',
  'when_damaged',
  'when_attacked',
  'melee_attack_roll_against',
  'ranged_attack_roll_against',
]);
export const statusRuleTypeEnum = pgEnum('status_rule_type', [
  'advantage',
  'disadvantage',
  'saving_throw',
  'ability_check',
]);
export const damageModifierAppliedEnum = pgEnum('damage_modifier_applied', [
  'normal',
  'half',
  'double',
  'zero',
]);
export const combatOutcomeEnum = pgEnum('combat_outcome', [
  'hit',
  'miss',
  'critical',
]);
export const encounterStatusEnum = pgEnum('encounter_status', [
  'setup',
  'in_progress',
  'ended',
]);

export const damageTypes = pgTable('damage_types', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  slug: text().notNull(),
});

export const statusDefinitions = pgTable('status_definitions', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  slug: text().notNull(),
  description: text(),
});

export const statusRules = pgTable('status_rules', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  statusDefinitionId: ulid()
    .notNull()
    .references(() => statusDefinitions.id, { onDelete: 'cascade' }),
  trigger: statusTriggerEnum().notNull(),
  ruleType: statusRuleTypeEnum().notNull(),
  ruleValue: jsonb(),
});

export const weapons = pgTable('weapons', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  damageTypeId: ulid()
    .notNull()
    .references(() => damageTypes.id, { onDelete: 'cascade' }),
});

export const monsters = pgTable('monsters', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  armorClass: integer().notNull(),
  hitPoints: integer().notNull(),
});

export const monsterDamageModifiers = pgTable('monster_damage_modifiers', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  monsterId: ulid()
    .notNull()
    .references(() => monsters.id, { onDelete: 'cascade' }),
  damageTypeId: ulid()
    .notNull()
    .references(() => damageTypes.id, { onDelete: 'cascade' }),
  modifier: damageModifierEnum().notNull(),
});

export const playerCharacters = pgTable('player_characters', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  userId: ulid().references(() => users.id, { onDelete: 'set null' }),
  armorClass: integer().notNull(),
  maxHitPoints: integer().notNull(),
});

export const encounters = pgTable('encounters', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  status: encounterStatusEnum().notNull(),
  currentRound: integer(),
  currentTurnIndex: integer(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const encounterCreatures = pgTable('encounter_creatures', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  encounterId: ulid()
    .notNull()
    .references(() => encounters.id, { onDelete: 'cascade' }),
  sourceType: sourceTypeEnum().notNull(),
  playerCharacterId: ulid().references(() => playerCharacters.id, {
    onDelete: 'set null',
  }),
  monsterId: ulid().references(() => monsters.id, { onDelete: 'set null' }),
  displayName: text().notNull(),
  currentHp: integer().notNull(),
  maxHp: integer().notNull(),
  armorClass: integer().notNull(),
  initiativeRoll: integer().notNull(),
  initiativeOrder: integer().notNull(),
});

export const creatureEffects = pgTable('creature_effects', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  encounterCreatureId: ulid()
    .notNull()
    .references(() => encounterCreatures.id, { onDelete: 'cascade' }),
  statusDefinitionId: ulid()
    .notNull()
    .references(() => statusDefinitions.id, { onDelete: 'cascade' }),
  appliedAt: timestamp({ withTimezone: true }).notNull(),
  expiresAt: timestamp({ withTimezone: true }),
  metadata: jsonb(),
});

export const combatEvents = pgTable('combat_events', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  encounterId: ulid()
    .notNull()
    .references(() => encounters.id, { onDelete: 'cascade' }),
  round: integer(),
  attackerEncounterCreatureId: ulid()
    .notNull()
    .references(() => encounterCreatures.id, { onDelete: 'cascade' }),
  targetEncounterCreatureId: ulid()
    .notNull()
    .references(() => encounterCreatures.id, { onDelete: 'cascade' }),
  weaponId: ulid().references(() => weapons.id, { onDelete: 'set null' }),
  damageTypeId: ulid()
    .notNull()
    .references(() => damageTypes.id, { onDelete: 'cascade' }),
  modifierApplied: damageModifierAppliedEnum().notNull(),
  rawDamage: integer(),
  finalDamage: integer(),
  outcome: combatOutcomeEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const playerCharacterWeapons = pgTable(
  'player_character_weapons',
  {
    playerCharacterId: ulid()
      .notNull()
      .references(() => playerCharacters.id, { onDelete: 'cascade' }),
    weaponId: ulid()
      .notNull()
      .references(() => weapons.id, { onDelete: 'cascade' }),
    equipped: boolean().default(false),
  },
  t => [primaryKey({ columns: [t.playerCharacterId, t.weaponId] })],
);

export const users = pgTable('users', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  email: text().unique(),
  emailVerified: boolean().default(false),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  image: text(),
  name: text(),
  passwordHash: text(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    accessToken: text(),
    expiresAt: timestamp({ withTimezone: true }),
    id: ulid()
      .primaryKey()
      .$defaultFn(() => getUlid()),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text(),
    userId: ulid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  t => [unique().on(t.provider, t.providerAccountId)],
);

export const sessions = pgTable('sessions', {
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  token: text().notNull().unique(),
  userId: ulid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});
