import type { Character, CreateCharacterInput } from '../../api/characters';

export interface CharacterFormValues {
  armorClass: string;
  level: string;
  maxHitPoints: string;
  name: string;
  notes: string;
}

export const emptyCharacterFormValues = (): CharacterFormValues => ({
  armorClass: '10',
  level: '1',
  maxHitPoints: '10',
  name: '',
  notes: '',
});

export const characterToFormValues = (character: Character): CharacterFormValues => ({
  armorClass: String(character.armorClass),
  level: String(character.level),
  maxHitPoints: String(character.maxHitPoints),
  name: character.name,
  notes: character.notes ?? '',
});

const parseIntOrNull = (raw: string): null | number => {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

export const parseCharacterForm = (values: CharacterFormValues): CreateCharacterInput | null => {
  const name = values.name.trim();
  if (name === '') return null;

  const armorClass = parseIntOrNull(values.armorClass);
  const maxHitPoints = parseIntOrNull(values.maxHitPoints);
  const level = parseIntOrNull(values.level) ?? 1;

  if (armorClass == null || maxHitPoints == null || maxHitPoints < 1 || level < 1) {
    return null;
  }

  const trimmedNotes = values.notes.trim();

  return {
    armorClass,
    level,
    maxHitPoints,
    name,
    notes: trimmedNotes === '' ? null : trimmedNotes,
  };
};

export const isCharacterFormValid = (values: CharacterFormValues): boolean => parseCharacterForm(values) != null;
