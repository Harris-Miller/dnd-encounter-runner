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

export const sourceTypeEnum = pgEnum('source_type', ['player_character', 'monster']);
export const damageModifierEnum = pgEnum('damage_modifier', ['vulnerable', 'resistant', 'immune']);
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
export const damageModifierAppliedEnum = pgEnum('damage_modifier_applied', ['normal', 'half', 'double', 'zero']);
export const combatOutcomeEnum = pgEnum('combat_outcome', ['hit', 'miss', 'critical']);
export const encounterStatusEnum = pgEnum('encounter_status', ['setup', 'in_progress', 'ended']);

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

export const damageTypes = pgTable('damage_types', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  slug: text().notNull(),
});

export const statusDefinitions = pgTable('status_definitions', {
  description: text(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  slug: text().notNull(),
});

export const statusRules = pgTable('status_rules', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  ruleType: statusRuleTypeEnum().notNull(),
  ruleValue: jsonb(),
  statusDefinitionId: ulid()
    .notNull()
    .references(() => statusDefinitions.id, { onDelete: 'cascade' }),
  trigger: statusTriggerEnum().notNull(),
});

export const weapons = pgTable('weapons', {
  damageTypeId: ulid()
    .notNull()
    .references(() => damageTypes.id, { onDelete: 'cascade' }),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const monsters = pgTable('monsters', {
  armorClass: integer().notNull(),
  hitPoints: integer().notNull(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const monsterDamageModifiers = pgTable('monster_damage_modifiers', {
  damageTypeId: ulid()
    .notNull()
    .references(() => damageTypes.id, { onDelete: 'cascade' }),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  modifier: damageModifierEnum().notNull(),
  monsterId: ulid()
    .notNull()
    .references(() => monsters.id, { onDelete: 'cascade' }),
});

export const playerCharacters = pgTable('player_characters', {
  armorClass: integer().notNull(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  maxHitPoints: integer().notNull(),
  name: text().notNull(),
  userId: ulid().references(() => users.id, { onDelete: 'set null' }),
});

export const encounters = pgTable('encounters', {
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  currentRound: integer(),
  currentTurnIndex: integer(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  status: encounterStatusEnum().notNull(),
});

export const encounterCreatures = pgTable('encounter_creatures', {
  armorClass: integer().notNull(),
  currentHp: integer().notNull(),
  displayName: text().notNull(),
  encounterId: ulid()
    .notNull()
    .references(() => encounters.id, { onDelete: 'cascade' }),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  initiativeOrder: integer().notNull(),
  initiativeRoll: integer().notNull(),
  maxHp: integer().notNull(),
  monsterId: ulid().references(() => monsters.id, { onDelete: 'set null' }),
  playerCharacterId: ulid().references(() => playerCharacters.id, {
    onDelete: 'set null',
  }),
  sourceType: sourceTypeEnum().notNull(),
});

export const creatureEffects = pgTable('creature_effects', {
  appliedAt: timestamp({ withTimezone: true }).notNull(),
  encounterCreatureId: ulid()
    .notNull()
    .references(() => encounterCreatures.id, { onDelete: 'cascade' }),
  expiresAt: timestamp({ withTimezone: true }),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  metadata: jsonb(),
  statusDefinitionId: ulid()
    .notNull()
    .references(() => statusDefinitions.id, { onDelete: 'cascade' }),
});

export const combatEvents = pgTable('combat_events', {
  attackerEncounterCreatureId: ulid()
    .notNull()
    .references(() => encounterCreatures.id, { onDelete: 'cascade' }),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  damageTypeId: ulid()
    .notNull()
    .references(() => damageTypes.id, { onDelete: 'cascade' }),
  encounterId: ulid()
    .notNull()
    .references(() => encounters.id, { onDelete: 'cascade' }),
  finalDamage: integer(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  modifierApplied: damageModifierAppliedEnum().notNull(),
  outcome: combatOutcomeEnum().notNull(),
  rawDamage: integer(),
  round: integer(),
  targetEncounterCreatureId: ulid()
    .notNull()
    .references(() => encounterCreatures.id, { onDelete: 'cascade' }),
  weaponId: ulid().references(() => weapons.id, { onDelete: 'set null' }),
});

export const playerCharacterWeapons = pgTable(
  'player_character_weapons',
  {
    equipped: boolean().default(false),
    playerCharacterId: ulid()
      .notNull()
      .references(() => playerCharacters.id, { onDelete: 'cascade' }),
    weaponId: ulid()
      .notNull()
      .references(() => weapons.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.playerCharacterId, t.weaponId] })],
);

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
