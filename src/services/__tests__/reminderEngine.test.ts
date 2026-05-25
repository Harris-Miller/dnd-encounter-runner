import { beforeEach, describe, expect, it } from 'vitest';

import type { EncounterEvent } from '../../types/encounterState';
import { generateReminders } from '../reminderEngine';

import { buildCombatant, buildEffect, buildFactories, buildState, resetCounter } from './fixtures';

describe('reminderEngine.generateReminders', () => {
  beforeEach(() => {
    resetCounter();
  });

  it('emits a crit_damage_immunity reminder when target wears Adamantine Armour', () => {
    const playerA = buildCombatant({
      effects: [
        buildEffect({
          description: 'Critical hits against the wearer become normal hits.',
          id: 'eff-adamantine',
          name: 'Adamantine Armour',
          provides: [{ kind: 'crit_damage_immunity' }],
          sourceType: 'item',
        }),
      ],
      id: 'player-a',
      name: 'Player A',
    });
    const monsterX = buildCombatant({ id: 'monster-x', initiative: 5, name: 'Monster X', type: 'monster' });
    const state = buildState([playerA, monsterX]);

    const event: EncounterEvent = {
      id: 'evt-1',
      payload: { attackerCombatantId: 'monster-x', targetCombatantId: 'player-a' },
      ts: '2026-05-25T00:00:00.000Z',
      type: 'ON_CRIT',
    };

    const reminders = generateReminders(state, event, buildFactories());

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.kind).toBe('crit_damage_immunity');
    expect(reminders[0]?.combatantId).toBe('player-a');
    expect(reminders[0]?.message).toContain('Adamantine Armour');
  });

  it('emits a damage_resistance reminder when target has Potion of Fire Resistance and is hit by firebolt', () => {
    const playerB = buildCombatant({
      effects: [
        buildEffect({
          description: 'Resistance to fire damage for 1 hour.',
          expiresAt: { kind: 'after_rounds', rounds: 10 },
          id: 'eff-fire-resist',
          name: 'Potion of Fire Resistance',
          provides: [{ damageType: 'fire', kind: 'damage_resistance' }],
          remainingRounds: 10,
          sourceType: 'item',
        }),
      ],
      id: 'player-b',
      name: 'Player B',
    });
    const state = buildState([playerB]);

    const event: EncounterEvent = {
      id: 'evt-2',
      payload: {
        amount: 8,
        damageType: 'fire',
        sourceCombatantId: null,
        targetCombatantId: 'player-b',
      },
      ts: '2026-05-25T00:00:00.000Z',
      type: 'ON_DAMAGE',
    };

    const reminders = generateReminders(state, event, buildFactories());

    expect(reminders.map(reminder => reminder.kind)).toContain('damage_resistance');
    const resistanceReminder = reminders.find(reminder => reminder.kind === 'damage_resistance');
    expect(resistanceReminder?.message).toContain('half damage');
  });

  it('emits a concentration_save reminder when a concentrating combatant takes damage', () => {
    const playerD = buildCombatant({
      effects: [
        buildEffect({
          description: 'Concentrating on Bless.',
          id: 'eff-conc',
          name: 'Concentrating on Bless',
          provides: [{ kind: 'concentration', spellName: 'Bless' }],
          sourceType: 'concentration',
        }),
      ],
      id: 'player-d',
      name: 'Player D',
    });
    const state = buildState([playerD]);

    const event: EncounterEvent = {
      id: 'evt-3',
      payload: {
        amount: 14,
        damageType: 'slashing',
        sourceCombatantId: null,
        targetCombatantId: 'player-d',
      },
      ts: '2026-05-25T00:00:00.000Z',
      type: 'ON_DAMAGE',
    };

    const reminders = generateReminders(state, event, buildFactories());

    const concSave = reminders.find(reminder => reminder.kind === 'concentration_save');
    expect(concSave).toBeDefined();
    expect(concSave?.combatantId).toBe('player-d');
    expect(concSave?.message).toContain('DC 10');
    expect(concSave?.message).toContain('Bless');
  });

  it('uses half the damage as the concentration DC when half damage exceeds 10', () => {
    const playerD = buildCombatant({
      effects: [
        buildEffect({
          id: 'eff-conc-big',
          name: 'Concentrating',
          provides: [{ kind: 'concentration', spellName: 'Hold Person' }],
          sourceType: 'concentration',
        }),
      ],
      id: 'player-d',
      name: 'Player D',
    });
    const state = buildState([playerD]);

    const event: EncounterEvent = {
      id: 'evt-big-dmg',
      payload: {
        amount: 30,
        damageType: 'bludgeoning',
        sourceCombatantId: null,
        targetCombatantId: 'player-d',
      },
      ts: '2026-05-25T00:00:00.000Z',
      type: 'ON_DAMAGE',
    };

    const reminders = generateReminders(state, event, buildFactories());
    const concSave = reminders.find(reminder => reminder.kind === 'concentration_save');

    expect(concSave?.message).toContain('DC 15');
  });

  it('emits a reaction_prompt for Counterspell when an opponent casts a spell and the caster has unused reaction', () => {
    const playerC = buildCombatant({
      effects: [
        buildEffect({
          description: 'Reaction: Counterspell',
          id: 'eff-counterspell',
          name: 'Counterspell',
          provides: [
            {
              kind: 'reaction_available',
              promptMessage: 'Interrupt the spell with a 3rd-level (or higher) slot.',
              reactionName: 'Counterspell',
              triggerEvents: ['ON_SPELL_CAST'],
            },
          ],
          sourceType: 'spell',
        }),
      ],
      id: 'player-c',
      name: 'Player C',
    });
    const monsterY = buildCombatant({
      id: 'monster-y',
      initiative: 4,
      name: 'Monster Y',
      type: 'monster',
    });
    const state = buildState([playerC, monsterY]);

    const event: EncounterEvent = {
      id: 'evt-cast',
      payload: {
        casterCombatantId: 'monster-y',
        isConcentration: false,
        spellName: 'Firebolt',
        targetCombatantIds: ['player-c'],
      },
      ts: '2026-05-25T00:00:00.000Z',
      type: 'ON_SPELL_CAST',
    };

    const reminders = generateReminders(state, event, buildFactories());

    const counterspellReminder = reminders.find(reminder => reminder.kind === 'reaction_prompt');
    expect(counterspellReminder).toBeDefined();
    expect(counterspellReminder?.combatantId).toBe('player-c');
    expect(counterspellReminder?.message).toContain('Counterspell');
  });

  it('does not emit a reaction_prompt when the combatant has already used their reaction', () => {
    const playerC = buildCombatant({
      actionEconomy: { actionUsed: false, bonusActionUsed: false, reactionUsed: true },
      effects: [
        buildEffect({
          id: 'eff-counterspell',
          name: 'Counterspell',
          provides: [
            {
              kind: 'reaction_available',
              promptMessage: 'Interrupt the spell.',
              reactionName: 'Counterspell',
              triggerEvents: ['ON_SPELL_CAST'],
            },
          ],
          sourceType: 'spell',
        }),
      ],
      id: 'player-c',
      name: 'Player C',
    });
    const monsterY = buildCombatant({ id: 'monster-y', name: 'Monster Y', type: 'monster' });
    const state = buildState([playerC, monsterY]);

    const event: EncounterEvent = {
      id: 'evt-cast2',
      payload: {
        casterCombatantId: 'monster-y',
        isConcentration: false,
        spellName: 'Firebolt',
        targetCombatantIds: ['player-c'],
      },
      ts: '2026-05-25T00:00:00.000Z',
      type: 'ON_SPELL_CAST',
    };

    const reminders = generateReminders(state, event, buildFactories());
    expect(reminders.find(reminder => reminder.kind === 'reaction_prompt')).toBeUndefined();
  });

  it('emits a condition_tick reminder at start of turn for poisoned', () => {
    const monsterZ = buildCombatant({
      effects: [
        buildEffect({
          description: 'Has disadvantage on attack rolls and ability checks.',
          id: 'eff-poisoned',
          name: 'Poisoned',
          notifyOn: ['START_OF_TURN'],
          provides: [{ conditionId: 'poisoned', kind: 'condition' }],
          sourceType: 'condition',
        }),
      ],
      id: 'monster-z',
      name: 'Monster Z',
      type: 'monster',
    });
    const state = buildState([monsterZ]);

    const event: EncounterEvent = {
      combatantId: 'monster-z',
      id: 'evt-turn-start',
      ts: '2026-05-25T00:00:00.000Z',
      type: 'START_OF_TURN',
    };

    const reminders = generateReminders(state, event, buildFactories());
    expect(reminders.some(reminder => reminder.kind === 'condition_tick')).toBe(true);
  });
});
