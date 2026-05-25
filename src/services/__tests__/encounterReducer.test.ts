import { beforeEach, describe, expect, it } from 'vitest';

import {
  addCombatant,
  adjustHp,
  advanceRound,
  advanceTurn,
  applyEffect,
  dismissReminder,
  markReactionUsed,
  recordEvent,
  removeCombatant,
  removeEffect,
  resetActionEconomy,
  setInitiative,
  tickEffects,
} from '../encounterReducer';

import { buildCombatant, buildEffect, buildFactories, buildState, resetCounter } from './fixtures';

describe('encounterReducer', () => {
  beforeEach(() => {
    resetCounter();
  });

  describe('addCombatant / removeCombatant', () => {
    it('inserts a combatant and updates initiative order by initiative DESC', () => {
      const playerA = buildCombatant({ id: 'a', initiative: 12, name: 'A' });
      const state = buildState([playerA]);
      const playerB = buildCombatant({ id: 'b', initiative: 20, name: 'B' });

      const nextState = addCombatant(state, { combatant: playerB });

      expect(nextState.initiativeOrder).toStrictEqual(['b', 'a']);
      expect(Object.keys(nextState.combatants)).toHaveLength(2);
    });

    it('throws when adding a duplicate combatant id', () => {
      const a1 = buildCombatant({ id: 'a', name: 'A1' });
      const a2 = buildCombatant({ id: 'a', name: 'A2' });
      const state = buildState([a1]);

      expect(() => addCombatant(state, { combatant: a2 })).toThrow(/already exists/i);
    });

    it('removes a combatant and clamps turnIndex if necessary', () => {
      const a = buildCombatant({ id: 'a', initiative: 15, name: 'A' });
      const b = buildCombatant({ id: 'b', initiative: 10, name: 'B' });
      const state = { ...buildState([a, b]), turnIndex: 1 };

      const nextState = removeCombatant(state, { combatantId: 'b' });

      expect(Object.keys(nextState.combatants)).toStrictEqual(['a']);
      expect(nextState.initiativeOrder).toStrictEqual(['a']);
      expect(nextState.turnIndex).toBe(0);
    });
  });

  describe('adjustHp', () => {
    it('clamps damage at zero', () => {
      const combatant = buildCombatant({ currentHp: 5, id: 'a', maxHp: 30, name: 'A' });
      const state = buildState([combatant]);

      const nextState = adjustHp(state, { combatantId: 'a', delta: -100 });

      expect(nextState.combatants['a']?.currentHp).toBe(0);
    });

    it('clamps healing at maxHp', () => {
      const combatant = buildCombatant({ currentHp: 25, id: 'a', maxHp: 30, name: 'A' });
      const state = buildState([combatant]);

      const nextState = adjustHp(state, { combatantId: 'a', delta: 50 });

      expect(nextState.combatants['a']?.currentHp).toBe(30);
    });
  });

  describe('setInitiative', () => {
    it('updates initiative and resorts the order', () => {
      const a = buildCombatant({ id: 'a', initiative: 12, name: 'A' });
      const b = buildCombatant({ id: 'b', initiative: 8, name: 'B' });
      const state = buildState([a, b]);

      const nextState = setInitiative(state, { combatantId: 'b', initiative: 22 });

      expect(nextState.initiativeOrder).toStrictEqual(['b', 'a']);
      expect(nextState.combatants['b']?.initiative).toBe(22);
    });
  });

  describe('markReactionUsed / resetActionEconomy', () => {
    it('marks reaction used', () => {
      const combatant = buildCombatant({ id: 'a', name: 'A' });
      const state = buildState([combatant]);

      const nextState = markReactionUsed(state, { combatantId: 'a', used: true });

      expect(nextState.combatants['a']?.actionEconomy.reactionUsed).toBe(true);
    });

    it('resets action economy', () => {
      const combatant = buildCombatant({
        actionEconomy: { actionUsed: true, bonusActionUsed: true, reactionUsed: true },
        id: 'a',
        name: 'A',
      });
      const state = buildState([combatant]);

      const nextState = resetActionEconomy(state, { combatantId: 'a' });

      expect(nextState.combatants['a']?.actionEconomy).toStrictEqual({
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
      });
    });
  });

  describe('applyEffect / removeEffect', () => {
    it('appends an effect', () => {
      const combatant = buildCombatant({ id: 'a', name: 'A' });
      const state = buildState([combatant]);

      const effect = buildEffect({
        id: 'eff-1',
        name: 'Hex',
        provides: [{ damageType: 'necrotic', kind: 'damage_vulnerability' }],
      });

      const nextState = applyEffect(state, { combatantId: 'a', effect });

      expect(nextState.combatants['a']?.effects).toHaveLength(1);
      expect(nextState.combatants['a']?.effects[0]?.id).toBe('eff-1');
    });

    it('removes an effect by id', () => {
      const effect = buildEffect({
        id: 'eff-1',
        name: 'Hex',
        provides: [],
      });
      const combatant = buildCombatant({ effects: [effect], id: 'a', name: 'A' });
      const state = buildState([combatant]);

      const nextState = removeEffect(state, { combatantId: 'a', effectId: 'eff-1' });

      expect(nextState.combatants['a']?.effects).toHaveLength(0);
    });
  });

  describe('dismissReminder', () => {
    it('marks reminder dismissed', () => {
      const a = buildCombatant({ id: 'a', name: 'A' });
      const state = {
        ...buildState([a]),
        reminders: [
          {
            combatantId: 'a',
            dismissed: false,
            effectId: null,
            eventId: null,
            id: 'rem-1',
            kind: 'info' as const,
            message: 'hi',
            ts: 't',
          },
        ],
      };

      const nextState = dismissReminder(state, { reminderId: 'rem-1' });

      expect(nextState.reminders[0]?.dismissed).toBe(true);
    });
  });

  describe('tickEffects', () => {
    it('decrements remainingRounds for matching tickOn effects', () => {
      const combatant = buildCombatant({
        effects: [
          buildEffect({
            id: 'eff-1',
            name: 'Bless',
            provides: [],
            remainingRounds: 3,
            tickOn: 'end_of_owner_turn',
          }),
        ],
        id: 'a',
        name: 'A',
      });
      const state = buildState([combatant]);

      const result = tickEffects(state, 'end_of_owner_turn', ['a']);

      expect(result.state.combatants['a']?.effects[0]?.remainingRounds).toBe(2);
      expect(result.expired).toHaveLength(0);
    });

    it('removes effects whose remainingRounds reach zero and reports them as expired', () => {
      const combatant = buildCombatant({
        effects: [
          buildEffect({
            id: 'eff-1',
            name: 'Bless',
            provides: [],
            remainingRounds: 1,
            tickOn: 'end_of_owner_turn',
          }),
        ],
        id: 'a',
        name: 'A',
      });
      const state = buildState([combatant]);

      const result = tickEffects(state, 'end_of_owner_turn', ['a']);

      expect(result.state.combatants['a']?.effects).toHaveLength(0);
      expect(result.expired).toHaveLength(1);
      expect(result.expired[0]?.effect.id).toBe('eff-1');
    });

    it('does not tick effects whose tickOn does not match', () => {
      const combatant = buildCombatant({
        effects: [
          buildEffect({
            id: 'eff-1',
            name: 'Bless',
            provides: [],
            remainingRounds: 3,
            tickOn: 'start_of_owner_turn',
          }),
        ],
        id: 'a',
        name: 'A',
      });
      const state = buildState([combatant]);

      const result = tickEffects(state, 'end_of_owner_turn', ['a']);

      expect(result.state.combatants['a']?.effects[0]?.remainingRounds).toBe(3);
    });
  });

  describe('advanceTurn', () => {
    it('moves to the next combatant in initiative order without changing the round', () => {
      const a = buildCombatant({ id: 'a', initiative: 15, name: 'A' });
      const b = buildCombatant({ id: 'b', initiative: 10, name: 'B' });
      const state = buildState([a, b]);

      const nextState = advanceTurn(state, buildFactories());

      expect(nextState.turnIndex).toBe(1);
      expect(nextState.round).toBe(1);
    });

    it('wraps to a new round when the last combatant ends their turn', () => {
      const a = buildCombatant({ id: 'a', initiative: 15, name: 'A' });
      const b = buildCombatant({ id: 'b', initiative: 10, name: 'B' });
      const state = { ...buildState([a, b]), turnIndex: 1 };

      const nextState = advanceTurn(state, buildFactories());

      expect(nextState.round).toBe(2);
      expect(nextState.turnIndex).toBe(0);
    });

    it("resets the arriving combatant's reaction at the start of their turn", () => {
      const a = buildCombatant({
        actionEconomy: { actionUsed: true, bonusActionUsed: true, reactionUsed: true },
        id: 'a',
        initiative: 15,
        name: 'A',
      });
      const b = buildCombatant({ id: 'b', initiative: 10, name: 'B' });
      const state = { ...buildState([a, b]), turnIndex: 1 };

      const nextState = advanceTurn(state, buildFactories());

      expect(nextState.combatants['a']?.actionEconomy).toStrictEqual({
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
      });
    });

    it('decrements end_of_owner_turn effect durations on the leaving combatant', () => {
      const a = buildCombatant({
        effects: [
          buildEffect({
            expiresAt: { kind: 'after_rounds', rounds: 3 },
            id: 'eff-1',
            name: 'Bless',
            provides: [],
            remainingRounds: 3,
            tickOn: 'end_of_owner_turn',
          }),
        ],
        id: 'a',
        initiative: 15,
        name: 'A',
      });
      const b = buildCombatant({ id: 'b', initiative: 10, name: 'B' });
      const state = buildState([a, b]);

      const nextState = advanceTurn(state, buildFactories());

      expect(nextState.combatants['a']?.effects[0]?.remainingRounds).toBe(2);
    });
  });

  describe('advanceRound', () => {
    it('increments round and resets turnIndex to 0', () => {
      const a = buildCombatant({ id: 'a', initiative: 15, name: 'A' });
      const state = { ...buildState([a]), round: 2, turnIndex: 0 };

      const nextState = advanceRound(state, buildFactories());

      expect(nextState.round).toBe(3);
      expect(nextState.turnIndex).toBe(0);
    });

    it('resets all action economies', () => {
      const a = buildCombatant({
        actionEconomy: { actionUsed: true, bonusActionUsed: true, reactionUsed: true },
        id: 'a',
        name: 'A',
      });
      const state = buildState([a]);

      const nextState = advanceRound(state, buildFactories());

      expect(nextState.combatants['a']?.actionEconomy).toStrictEqual({
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
      });
    });
  });

  describe('recordEvent', () => {
    it('appends the event to the audit log and reminders from the engine', () => {
      const a = buildCombatant({
        effects: [
          buildEffect({
            id: 'eff-adamantine',
            name: 'Adamantine Armour',
            provides: [{ kind: 'crit_damage_immunity' }],
            sourceType: 'item',
          }),
        ],
        id: 'a',
        name: 'Player A',
      });
      const monster = buildCombatant({ id: 'm', name: 'Monster', type: 'monster' });
      const state = buildState([a, monster]);

      const nextState = recordEvent(state, {
        ...buildFactories(),
        event: {
          id: 'evt-1',
          payload: { attackerCombatantId: 'm', targetCombatantId: 'a' },
          ts: '2026-05-25T00:00:00.000Z',
          type: 'ON_CRIT',
        },
      });

      expect(nextState.events).toHaveLength(1);
      expect(nextState.reminders.length).toBeGreaterThanOrEqual(1);
      expect(nextState.reminders.some(reminder => reminder.kind === 'crit_damage_immunity')).toBe(true);
    });
  });
});
