import { boolean, integer, numeric, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { ulid, ulidFk, ulidPk } from './column.utils';
import { spells } from './schema/spells';

export { spells };

export const damageTypes = pgTable('damage_types', {
  id: ulidPk(),
  name: text().notNull(),
});

export const sizes = pgTable('sizes', {
  id: ulidPk(),
  name: text().notNull(),
});

export const creatureTypes = pgTable('creature_types', {
  id: ulidPk(),
  name: text().notNull(),
});

export const alignments = pgTable('alignments', {
  id: ulidPk(),
  name: text().notNull(),
});

export const descriptiveTags = pgTable('descriptive_tags', {
  id: ulidPk(),
  name: text().notNull(),
});

export const conditions = pgTable('conditions', {
  id: ulidPk(),
  name: text().notNull(),
});

export const tools = pgTable('tools', {
  id: ulidPk(),
});

export const armor = pgTable('armor', {
  id: ulidPk(),
});

export const weapons = pgTable('weapons', {
  damageTypeId: ulidFk(() => damageTypes.id),
  id: ulidPk(),
  name: text().notNull().unique(),
});

export const spellDamageTypes = pgTable(
  'spell_damage_types',
  {
    damageTypeId: ulidFk(() => damageTypes.id).notNull(),
    spellId: ulidFk(() => spells.id).notNull(),
  },
  t => [primaryKey({ columns: [t.spellId, t.damageTypeId] })],
);

export const monsters = pgTable('monsters', {
  ac: integer().notNull(),
  alignmentId: ulidFk(() => alignments.id).notNull(),
  cha: integer().notNull(),
  chaSave: integer(),
  con: integer().notNull(),
  conSave: integer(),
  cr: numeric('cr', { precision: 6, scale: 2 }),
  creatureTypeId: ulidFk(() => creatureTypes.id).notNull(),
  dex: integer().notNull(),
  dexSave: integer(),
  gearText: text(),
  hpAverage: integer().notNull(),
  hpDice: text().notNull(),
  id: ulidPk(),
  initiativeModifier: integer().notNull(),
  initiativeScore: integer().notNull(),
  intSave: integer(),
  intScore: integer().notNull(),
  languagesText: text(),
  legendaryActionUses: integer(),
  legendaryActionUsesInLair: integer(),
  name: text().notNull(),
  proficiencyBonus: integer().notNull(),
  sensesText: text(),
  sizeId: ulidFk(() => sizes.id).notNull(),
  skillsText: text(),
  speedText: text(),
  str: integer().notNull(),
  strSave: integer(),
  wis: integer().notNull(),
  wisSave: integer(),
  xp: integer(),
  xpInLair: integer(),
});

export const monsterDescriptiveTags = pgTable(
  'monster_descriptive_tags',
  {
    descriptiveTagId: ulidFk(() => descriptiveTags.id).notNull(),
    monsterId: ulidFk(() => monsters.id).notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.descriptiveTagId] })],
);

export const monsterDamageResistances = pgTable(
  'monster_damage_resistances',
  {
    damageTypeId: ulidFk(() => damageTypes.id).notNull(),
    monsterId: ulidFk(() => monsters.id).notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.damageTypeId] })],
);

export const monsterDamageVulnerabilities = pgTable(
  'monster_damage_vulnerabilities',
  {
    damageTypeId: ulidFk(() => damageTypes.id).notNull(),
    monsterId: ulidFk(() => monsters.id).notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.damageTypeId] })],
);

export const monsterDamageImmunities = pgTable(
  'monster_damage_immunities',
  {
    damageTypeId: ulidFk(() => damageTypes.id).notNull(),
    monsterId: ulidFk(() => monsters.id).notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.damageTypeId] })],
);

export const monsterConditionImmunities = pgTable(
  'monster_condition_immunities',
  {
    conditionId: ulidFk(() => conditions.id).notNull(),
    monsterId: ulidFk(() => monsters.id).notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.conditionId] })],
);

export const monsterTraits = pgTable('monster_traits', {
  descriptionText: text(),
  id: ulidPk(),
  monsterId: ulidFk(() => monsters.id).notNull(),
  name: text().notNull(),
  sortOrder: integer().notNull(),
  usageLimitText: text(),
});

export const monsterActions = pgTable('monster_actions', {
  descriptionText: text(),
  id: ulidPk(),
  monsterId: ulidFk(() => monsters.id).notNull(),
  name: text().notNull(),
  section: text(),
  sortOrder: integer().notNull(),
  usageLimitText: text(),
});

export const monsterSpeeds = pgTable('monster_speeds', {
  distanceFt: integer().notNull(),
  id: ulidPk(),
  monsterId: ulidFk(() => monsters.id).notNull(),
  note: text(),
  speedType: text().notNull(),
});

export const monsterSpellcasting = pgTable('monster_spellcasting', {
  componentNote: text(),
  monsterId: ulid()
    .primaryKey()
    .references(() => monsters.id, { onDelete: 'cascade' }),
  spellAttackBonus: integer().notNull(),
  spellSaveDc: integer().notNull(),
  spellcastingAbility: text().notNull(),
});

export const monsterSpells = pgTable(
  'monster_spells',
  {
    monsterId: ulidFk(() => monsters.id).notNull(),
    spellId: ulidFk(() => spells.id).notNull(),
    usage: text().notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.spellId, t.usage] })],
);

export const magicItemCategories = pgTable('magic_item_categories', {
  id: ulidPk(),
  name: text().notNull(),
});

export const magicItemRarities = pgTable('magic_item_rarities', {
  craftingCostGp: numeric('crafting_cost_gp', { precision: 12, scale: 2 }),
  craftingDays: integer(),
  id: ulidPk(),
  name: text().notNull(),
  valueGp: numeric('value_gp', { precision: 12, scale: 2 }),
});

export const magicItems = pgTable('magic_items', {
  baseArmorId: ulid().references(() => armor.id, { onDelete: 'set null' }),
  baseWeaponId: ulid().references(() => weapons.id, { onDelete: 'set null' }),
  categorySpecifierText: text(),
  descriptionText: text(),
  id: ulidPk(),
  isConsumable: boolean().notNull(),
  isCursed: boolean().notNull(),
  magicItemCategoryId: ulidFk(() => magicItemCategories.id).notNull(),
  magicItemRarityId: ulidFk(() => magicItemRarities.id).notNull(),
  name: text().notNull(),
  requiresAttunement: boolean().notNull(),
});

export const magicItemCharges = pgTable('magic_item_charges', {
  magicItemId: ulid()
    .primaryKey()
    .references(() => magicItems.id, { onDelete: 'cascade' }),
  maxCharges: integer().notNull(),
  rechargeText: text(),
});

export const magicItemSpells = pgTable(
  'magic_item_spells',
  {
    magicItemId: ulidFk(() => magicItems.id).notNull(),
    spellId: ulidFk(() => spells.id).notNull(),
    usage: text(),
  },
  t => [primaryKey({ columns: [t.magicItemId, t.spellId] })],
);

export const magicItemDamageResistances = pgTable(
  'magic_item_damage_resistances',
  {
    damageTypeId: ulidFk(() => damageTypes.id).notNull(),
    magicItemId: ulidFk(() => magicItems.id).notNull(),
  },
  t => [primaryKey({ columns: [t.magicItemId, t.damageTypeId] })],
);

export const magicItemDamageVulnerabilities = pgTable(
  'magic_item_damage_vulnerabilities',
  {
    damageTypeId: ulidFk(() => damageTypes.id).notNull(),
    magicItemId: ulidFk(() => magicItems.id).notNull(),
  },
  t => [primaryKey({ columns: [t.magicItemId, t.damageTypeId] })],
);

export const magicItemCraftingTools = pgTable(
  'magic_item_crafting_tools',
  {
    magicItemCategoryId: ulidFk(() => magicItemCategories.id).notNull(),
    toolId: ulidFk(() => tools.id).notNull(),
  },
  t => [primaryKey({ columns: [t.magicItemCategoryId, t.toolId] })],
);

export const sentientMagicItems = pgTable('sentient_magic_items', {
  alignmentId: ulidFk(() => alignments.id).notNull(),
  chaScore: integer().notNull(),
  communicationType: text(),
  intScore: integer().notNull(),
  magicItemId: ulid()
    .primaryKey()
    .references(() => magicItems.id, { onDelete: 'cascade' }),
  sensesText: text(),
  specialPurposeText: text(),
  wisScore: integer().notNull(),
});
