import { boolean, char, integer, numeric, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { ulid as getUlid } from 'ulid';

const ulid = () => char({ length: 26 });

export const schools = pgTable('schools', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const classes = pgTable('classes', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const castingTimes = pgTable('casting_times', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  qualifierText: text(),
});

export const ranges = pgTable('ranges', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  sortFeet: integer().notNull(),
});

export const durations = pgTable('durations', {
  amount: integer(),
  displayText: text(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  isConcentration: boolean().notNull(),
  name: text().notNull(),
  unit: text(),
});

export const damageTypes = pgTable('damage_types', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const sizes = pgTable('sizes', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const creatureTypes = pgTable('creature_types', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const alignments = pgTable('alignments', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const descriptiveTags = pgTable('descriptive_tags', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const conditions = pgTable('conditions', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const tools = pgTable('tools', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
});

export const armor = pgTable('armor', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
});

export const weapons = pgTable('weapons', {
  damageTypeId: ulid().references(() => damageTypes.id, { onDelete: 'cascade' }),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull().unique(),
});

export const spells = pgTable('spells', {
  cantripUpgradeDescription: text(),
  castingTimeId: ulid()
    .notNull()
    .references(() => castingTimes.id, { onDelete: 'cascade' }),
  description: text(),
  durationId: ulid()
    .notNull()
    .references(() => durations.id, { onDelete: 'cascade' }),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  isRitual: boolean().notNull(),
  level: integer().notNull(),
  name: text().notNull(),
  rangeId: ulid()
    .notNull()
    .references(() => ranges.id, { onDelete: 'cascade' }),
  schoolId: ulid()
    .notNull()
    .references(() => schools.id, { onDelete: 'cascade' }),
  upcastDescription: text(),
});

export const spellClassMap = pgTable(
  'spell_class_map',
  {
    classId: ulid()
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    spellId: ulid()
      .notNull()
      .references(() => spells.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.spellId, t.classId] })],
);

export const spellComponents = pgTable('spell_components', {
  material: boolean().notNull(),
  materialConsumed: boolean().notNull(),
  materialCostGp: numeric('material_cost_gp', { precision: 12, scale: 2 }),
  materialDescription: text(),
  somatic: boolean().notNull(),
  spellId: ulid()
    .primaryKey()
    .references(() => spells.id, { onDelete: 'cascade' }),
  verbal: boolean().notNull(),
});

export const spellDamageTypes = pgTable(
  'spell_damage_types',
  {
    damageTypeId: ulid()
      .notNull()
      .references(() => damageTypes.id, { onDelete: 'cascade' }),
    spellId: ulid()
      .notNull()
      .references(() => spells.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.spellId, t.damageTypeId] })],
);

export const monsters = pgTable('monsters', {
  ac: integer().notNull(),
  alignmentId: ulid()
    .notNull()
    .references(() => alignments.id, { onDelete: 'cascade' }),
  cha: integer().notNull(),
  chaSave: integer(),
  con: integer().notNull(),
  conSave: integer(),
  cr: numeric('cr', { precision: 6, scale: 2 }),
  creatureTypeId: ulid()
    .notNull()
    .references(() => creatureTypes.id, { onDelete: 'cascade' }),
  dex: integer().notNull(),
  dexSave: integer(),
  gearText: text(),
  hpAverage: integer().notNull(),
  hpDice: text().notNull(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
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
  sizeId: ulid()
    .notNull()
    .references(() => sizes.id, { onDelete: 'cascade' }),
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
    descriptiveTagId: ulid()
      .notNull()
      .references(() => descriptiveTags.id, { onDelete: 'cascade' }),
    monsterId: ulid()
      .notNull()
      .references(() => monsters.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.monsterId, t.descriptiveTagId] })],
);

export const monsterDamageResistances = pgTable(
  'monster_damage_resistances',
  {
    damageTypeId: ulid()
      .notNull()
      .references(() => damageTypes.id, { onDelete: 'cascade' }),
    monsterId: ulid()
      .notNull()
      .references(() => monsters.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.monsterId, t.damageTypeId] })],
);

export const monsterDamageVulnerabilities = pgTable(
  'monster_damage_vulnerabilities',
  {
    damageTypeId: ulid()
      .notNull()
      .references(() => damageTypes.id, { onDelete: 'cascade' }),
    monsterId: ulid()
      .notNull()
      .references(() => monsters.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.monsterId, t.damageTypeId] })],
);

export const monsterDamageImmunities = pgTable(
  'monster_damage_immunities',
  {
    damageTypeId: ulid()
      .notNull()
      .references(() => damageTypes.id, { onDelete: 'cascade' }),
    monsterId: ulid()
      .notNull()
      .references(() => monsters.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.monsterId, t.damageTypeId] })],
);

export const monsterConditionImmunities = pgTable(
  'monster_condition_immunities',
  {
    conditionId: ulid()
      .notNull()
      .references(() => conditions.id, { onDelete: 'cascade' }),
    monsterId: ulid()
      .notNull()
      .references(() => monsters.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.monsterId, t.conditionId] })],
);

export const monsterTraits = pgTable('monster_traits', {
  descriptionText: text(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  monsterId: ulid()
    .notNull()
    .references(() => monsters.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  sortOrder: integer().notNull(),
  usageLimitText: text(),
});

export const monsterActions = pgTable('monster_actions', {
  descriptionText: text(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  monsterId: ulid()
    .notNull()
    .references(() => monsters.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  section: text(),
  sortOrder: integer().notNull(),
  usageLimitText: text(),
});

export const monsterSpeeds = pgTable('monster_speeds', {
  distanceFt: integer().notNull(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  monsterId: ulid()
    .notNull()
    .references(() => monsters.id, { onDelete: 'cascade' }),
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
    monsterId: ulid()
      .notNull()
      .references(() => monsters.id, { onDelete: 'cascade' }),
    spellId: ulid()
      .notNull()
      .references(() => spells.id, { onDelete: 'cascade' }),
    usage: text().notNull(),
  },
  t => [primaryKey({ columns: [t.monsterId, t.spellId, t.usage] })],
);

export const magicItemCategories = pgTable('magic_item_categories', {
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
});

export const magicItemRarities = pgTable('magic_item_rarities', {
  craftingCostGp: numeric('crafting_cost_gp', { precision: 12, scale: 2 }),
  craftingDays: integer(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  name: text().notNull(),
  valueGp: numeric('value_gp', { precision: 12, scale: 2 }),
});

export const magicItems = pgTable('magic_items', {
  baseArmorId: ulid().references(() => armor.id, { onDelete: 'set null' }),
  baseWeaponId: ulid().references(() => weapons.id, { onDelete: 'set null' }),
  categorySpecifierText: text(),
  descriptionText: text(),
  id: ulid()
    .primaryKey()
    .$defaultFn(() => getUlid()),
  isConsumable: boolean().notNull(),
  isCursed: boolean().notNull(),
  magicItemCategoryId: ulid()
    .notNull()
    .references(() => magicItemCategories.id, { onDelete: 'cascade' }),
  magicItemRarityId: ulid()
    .notNull()
    .references(() => magicItemRarities.id, { onDelete: 'cascade' }),
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
    magicItemId: ulid()
      .notNull()
      .references(() => magicItems.id, { onDelete: 'cascade' }),
    spellId: ulid()
      .notNull()
      .references(() => spells.id, { onDelete: 'cascade' }),
    usage: text(),
  },
  t => [primaryKey({ columns: [t.magicItemId, t.spellId] })],
);

export const magicItemDamageResistances = pgTable(
  'magic_item_damage_resistances',
  {
    damageTypeId: ulid()
      .notNull()
      .references(() => damageTypes.id, { onDelete: 'cascade' }),
    magicItemId: ulid()
      .notNull()
      .references(() => magicItems.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.magicItemId, t.damageTypeId] })],
);

export const magicItemDamageVulnerabilities = pgTable(
  'magic_item_damage_vulnerabilities',
  {
    damageTypeId: ulid()
      .notNull()
      .references(() => damageTypes.id, { onDelete: 'cascade' }),
    magicItemId: ulid()
      .notNull()
      .references(() => magicItems.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.magicItemId, t.damageTypeId] })],
);

export const magicItemCraftingTools = pgTable(
  'magic_item_crafting_tools',
  {
    magicItemCategoryId: ulid()
      .notNull()
      .references(() => magicItemCategories.id, { onDelete: 'cascade' }),
    toolId: ulid()
      .notNull()
      .references(() => tools.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.magicItemCategoryId, t.toolId] })],
);

export const sentientMagicItems = pgTable('sentient_magic_items', {
  alignmentId: ulid()
    .notNull()
    .references(() => alignments.id, { onDelete: 'cascade' }),
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
