import type { ActiveEffect, Combatant, EffectDescriptor, EncounterState } from '../../types/encounterState';
import { DEFAULT_ACTION_ECONOMY } from '../../types/encounterState';

let counter = 0;

export const resetCounter = (): void => {
  counter = 0;
};

export const buildId = (): string => {
  counter += 1;
  return `id-${String(counter).padStart(4, '0')}`;
};

export const FIXED_NOW = '2026-05-25T00:00:00.000Z';

export const buildFactories = (): { buildId: () => string; now: string } => ({
  buildId,
  now: FIXED_NOW,
});

export const buildCombatant = (overrides: { id: string; name: string } & Partial<Combatant>): Combatant => ({
  actionEconomy: { ...DEFAULT_ACTION_ECONOMY },
  armorClass: 14,
  currentHp: 30,
  damageImmunities: [],
  damageResistances: [],
  damageVulnerabilities: [],
  effects: [],
  equippedItems: [],
  initiative: 10,
  knownSpells: [],
  maxHp: 30,
  refId: null,
  tempHp: 0,
  type: 'character',
  ...overrides,
});

export const buildEffect = (
  overrides: { id: string; name: string; provides: EffectDescriptor[] } & Partial<ActiveEffect>,
): ActiveEffect => ({
  description: 'Test effect',
  expiresAt: { kind: 'never' },
  notifyOn: [],
  refId: null,
  remainingRounds: null,
  source: overrides.name,
  sourceType: 'manual',
  tickOn: 'manual',
  ...overrides,
});

export const buildState = (combatants: Combatant[]): EncounterState => {
  const combatantsMap: Record<string, Combatant> = {};
  combatants.forEach(combatant => {
    combatantsMap[combatant.id] = combatant;
  });

  return {
    combatants: combatantsMap,
    events: [],
    initiativeOrder: [...combatants]
      .sort((left, right) => (right.initiative ?? 0) - (left.initiative ?? 0))
      .map(combatant => combatant.id),
    reminders: [],
    round: 1,
    turnIndex: 0,
  };
};
