import type {
  ActiveEffect,
  Combatant,
  CombatantType,
  EffectDescriptor,
  EncounterState,
} from '../../types/encounterState';
import { DEFAULT_ACTION_ECONOMY, emptyEncounterState } from '../../types/encounterState';

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

export const buildCombatant = (overrides: Partial<Combatant> & { id: string; name: string }): Combatant => ({
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
  type: 'character' as CombatantType,
  ...overrides,
});

export const buildEffect = (
  overrides: Partial<ActiveEffect> & { id: string; name: string; provides: EffectDescriptor[] },
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
  const base = emptyEncounterState();
  const combatantsMap: Record<string, Combatant> = {};
  combatants.forEach(combatant => {
    combatantsMap[combatant.id] = combatant;
  });

  return {
    ...base,
    combatants: combatantsMap,
    initiativeOrder: [...combatants]
      .sort((left, right) => (right.initiative ?? 0) - (left.initiative ?? 0))
      .map(combatant => combatant.id),
  };
};
