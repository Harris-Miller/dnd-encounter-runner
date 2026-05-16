import type { InferInsertModel } from 'drizzle-orm';

import type { spells } from '../schema/spells.ts';

export type SpellInsert = InferInsertModel<typeof spells>;

const assertSpellRecord = (value: unknown, index: number): Record<string, unknown> => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`spells.json entry at index ${index} must be a JSON object`);
  }
  return value as Record<string, unknown>;
};

const getOptionalString = (raw: Record<string, unknown>, keys: readonly string[]): string | null => {
  for (const key of keys) {
    const candidate = raw[key];
    if (typeof candidate === 'string') {
      return candidate;
    }
  }
  return null;
};

const getRequiredString = (
  raw: Record<string, unknown>,
  keys: readonly string[],
  spellLabel: string,
  fieldLabel: string,
): string => {
  const value = getOptionalString(raw, keys);
  if (value == null || value === '') {
    throw new Error(`Spell "${spellLabel}" is missing ${fieldLabel} (expected one of: ${keys.join(', ')})`);
  }
  return value;
};

const parseSpellLevel = (value: unknown, spellLabel: string): number => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'cantrip') {
      return 0;
    }
    const ordinalMatch = /^(\d+)(st|nd|rd|th)$/i.exec(trimmed);
    if (ordinalMatch != null) {
      const [, ordinalDigits] = ordinalMatch;
      if (ordinalDigits === undefined) {
        throw new Error(`Spell "${spellLabel}" has malformed level ordinal: ${trimmed}`);
      }
      return Number.parseInt(ordinalDigits, 10);
    }
    const asInt = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(asInt)) {
      return asInt;
    }
  }
  throw new Error(`Spell "${spellLabel}" has an invalid level value: ${String(value)}`);
};

const parseComponentsLine = (
  components: string | null,
): { isMaterial: boolean; isSomatic: boolean; isVerbal: boolean; materialDescription: string | null } => {
  if (components == null || components === '') {
    return { isMaterial: false, isSomatic: false, isVerbal: false, materialDescription: null };
  }
  const isVerbal = /(^|[,\s])V($|[,\s])/i.test(components);
  const isSomatic = /(^|[,\s])S($|[,\s])/i.test(components);
  const isMaterial = /(^|[,\s])M($|[,\s])/i.test(components);
  const materialMatch = /\bM\s*\(([^)]+)\)/i.exec(components);
  const materialDescription = materialMatch?.[1]?.trim() ?? null;
  return { isMaterial, isSomatic, isVerbal, materialDescription };
};

const inferConcentrationFromDuration = (duration: string): boolean =>
  duration.toLowerCase().startsWith('concentration');

export const spellInsertFromJsonRecord = (value: unknown, index: number): SpellInsert => {
  const raw = assertSpellRecord(value, index);
  const spellLabel = getOptionalString(raw, ['name']) ?? `(index ${index})`;

  const castingTime = getRequiredString(raw, ['castingTime', 'casting_time'], spellLabel, 'casting time');
  const duration = getRequiredString(raw, ['duration'], spellLabel, 'duration');
  const name = getRequiredString(raw, ['name'], spellLabel, 'name');
  const range = getRequiredString(raw, ['range'], spellLabel, 'range');
  const school = getRequiredString(raw, ['school'], spellLabel, 'school');
  const description = getOptionalString(raw, ['description']);
  const upcastDescription = getOptionalString(raw, ['upcastDescription']);

  const level = parseSpellLevel(raw.level, name);

  const explicitConcentration = raw.isConcentration;
  const isConcentration =
    typeof explicitConcentration === 'boolean' ? explicitConcentration : inferConcentrationFromDuration(duration);

  const componentsLine = getOptionalString(raw, ['components']);
  const fromComponents = parseComponentsLine(componentsLine);

  const explicitRitual = raw.isRitual;
  const isRitual = typeof explicitRitual === 'boolean' ? explicitRitual : castingTime.toLowerCase().includes('ritual');

  const explicitMaterial = raw.isMaterial;
  const isMaterial = typeof explicitMaterial === 'boolean' ? explicitMaterial : fromComponents.isMaterial;

  const explicitSomatic = raw.isSomatic;
  const isSomatic = typeof explicitSomatic === 'boolean' ? explicitSomatic : fromComponents.isSomatic;

  const explicitVerbal = raw.isVerbal;
  const isVerbal = typeof explicitVerbal === 'boolean' ? explicitVerbal : fromComponents.isVerbal;

  const explicitMaterialDesc = getOptionalString(raw, ['materialDescription']);
  const materialDescription =
    explicitMaterialDesc != null && explicitMaterialDesc !== ''
      ? explicitMaterialDesc
      : fromComponents.materialDescription;

  return {
    castingTime,
    description,
    duration,
    isConcentration,
    isMaterial,
    isRitual,
    isSomatic,
    isVerbal,
    level,
    materialDescription,
    name,
    range,
    school,
    upcastDescription,
  };
};
