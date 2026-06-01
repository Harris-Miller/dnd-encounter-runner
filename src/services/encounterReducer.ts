import * as R from 'ramda';
import { match } from 'ts-pattern';

import type {
  ActionEconomy,
  ActiveEffect,
  Combatant,
  EncounterEvent,
  EncounterState,
  EventOfType,
  Reminder,
} from '../types/encounterState';
import { DEFAULT_ACTION_ECONOMY } from '../types/encounterState';

import { generateReminders } from './reminderEngine';
import type { ReminderFactories } from './reminderEngine';

const sortInitiativeOrder = (combatants: Record<string, Combatant>): string[] =>
  Object.keys(combatants).toSorted((leftId, rightId) => {
    const leftInitiative = combatants[leftId]?.initiative ?? Number.NEGATIVE_INFINITY;
    const rightInitiative = combatants[rightId]?.initiative ?? Number.NEGATIVE_INFINITY;

    if (leftInitiative === rightInitiative) {
      return leftId.localeCompare(rightId);
    }

    return rightInitiative - leftInitiative;
  });

const requireCombatant = (state: EncounterState, combatantId: string): Combatant => {
  const combatant = state.combatants[combatantId];

  if (combatant == null) {
    throw new Error(`Combatant "${combatantId}" not found in encounter`);
  }

  return combatant;
};

export interface AddCombatantInput {
  combatant: Combatant;
}

export const addCombatant = (state: EncounterState, { combatant }: AddCombatantInput): EncounterState => {
  if (state.combatants[combatant.id] != null) {
    throw new Error(`Combatant "${combatant.id}" already exists in encounter`);
  }

  const nextCombatants = { ...state.combatants, [combatant.id]: combatant };
  const nextOrder = sortInitiativeOrder(nextCombatants);

  return { ...state, combatants: nextCombatants, initiativeOrder: nextOrder };
};

export interface RemoveCombatantInput {
  combatantId: string;
}

export const removeCombatant = (state: EncounterState, { combatantId }: RemoveCombatantInput): EncounterState => {
  if (state.combatants[combatantId] == null) {
    throw new Error(`Combatant "${combatantId}" not found in encounter`);
  }

  const nextCombatants = R.dissoc(combatantId, state.combatants);
  const nextOrder = state.initiativeOrder.filter(id => id !== combatantId);
  const clampedTurnIndex = Math.min(state.turnIndex, Math.max(0, nextOrder.length - 1));

  return { ...state, combatants: nextCombatants, initiativeOrder: nextOrder, turnIndex: clampedTurnIndex };
};

export interface AdjustHpInput {
  combatantId: string;
  delta: number;
}

export const adjustHp = (state: EncounterState, { combatantId, delta }: AdjustHpInput): EncounterState => {
  const combatant = requireCombatant(state, combatantId);
  const nextHp = Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + delta));

  return R.assocPath(['combatants', combatantId, 'currentHp'], nextHp, state);
};

export interface SetInitiativeInput {
  combatantId: string;
  initiative: number;
}

export const setInitiative = (
  state: EncounterState,
  { combatantId, initiative }: SetInitiativeInput,
): EncounterState => {
  requireCombatant(state, combatantId);

  const withInitiative = R.assocPath<number, EncounterState>(
    ['combatants', combatantId, 'initiative'],
    initiative,
    state,
  );

  return { ...withInitiative, initiativeOrder: sortInitiativeOrder(withInitiative.combatants) };
};

export interface MarkReactionUsedInput {
  combatantId: string;
  used: boolean;
}

export const markReactionUsed = (
  state: EncounterState,
  { combatantId, used }: MarkReactionUsedInput,
): EncounterState => {
  requireCombatant(state, combatantId);

  return R.assocPath(['combatants', combatantId, 'actionEconomy', 'reactionUsed'], used, state);
};

export interface ResetActionEconomyInput {
  combatantId: string;
}

export const resetActionEconomy = (state: EncounterState, { combatantId }: ResetActionEconomyInput): EncounterState => {
  requireCombatant(state, combatantId);

  return R.assocPath<ActionEconomy, EncounterState>(
    ['combatants', combatantId, 'actionEconomy'],
    { ...DEFAULT_ACTION_ECONOMY },
    state,
  );
};

export interface ApplyEffectInput {
  combatantId: string;
  effect: ActiveEffect;
}

export const applyEffect = (state: EncounterState, { combatantId, effect }: ApplyEffectInput): EncounterState => {
  const combatant = requireCombatant(state, combatantId);
  const nextEffects = [...combatant.effects, effect];

  return R.assocPath(['combatants', combatantId, 'effects'], nextEffects, state);
};

export interface RemoveEffectInput {
  combatantId: string;
  effectId: string;
}

export const removeEffect = (state: EncounterState, { combatantId, effectId }: RemoveEffectInput): EncounterState => {
  const combatant = requireCombatant(state, combatantId);
  const nextEffects = combatant.effects.filter(effect => effect.id !== effectId);

  return R.assocPath(['combatants', combatantId, 'effects'], nextEffects, state);
};

export interface DismissReminderInput {
  reminderId: string;
}

export const dismissReminder = (state: EncounterState, { reminderId }: DismissReminderInput): EncounterState => {
  const indexOfReminder = state.reminders.findIndex(reminder => reminder.id === reminderId);

  if (indexOfReminder === -1) {
    return state;
  }

  const updatedReminders = [...state.reminders];
  const existing = updatedReminders[indexOfReminder];

  if (existing == null) {
    return state;
  }

  updatedReminders[indexOfReminder] = { ...existing, dismissed: true };

  return { ...state, reminders: updatedReminders };
};

/**
 * Tick effect durations for a specific scope. Decrements `remainingRounds` for
 * matching effects on the targeted combatant(s) and removes any whose duration
 * has elapsed. Returns the next state and the list of effects that expired so
 * the engine can emit `effect_expired` reminders.
 */
export interface TickEffectsResult {
  expired: { combatant: Combatant; effect: ActiveEffect }[];
  state: EncounterState;
}

export const tickEffects = (
  state: EncounterState,
  tickOn: ActiveEffect['tickOn'],
  combatantIds: string[],
): TickEffectsResult => {
  const expired: { combatant: Combatant; effect: ActiveEffect }[] = [];

  const nextCombatants: Record<string, Combatant> = { ...state.combatants };

  combatantIds.forEach(combatantId => {
    const combatant = nextCombatants[combatantId];

    if (combatant == null) {
      return;
    }

    const tickedEffects: ActiveEffect[] = [];

    combatant.effects.forEach(effect => {
      if (effect.tickOn !== tickOn || effect.remainingRounds == null) {
        tickedEffects.push(effect);
        return;
      }

      const nextRemaining = effect.remainingRounds - 1;

      if (nextRemaining <= 0) {
        expired.push({ combatant, effect });
        return;
      }

      tickedEffects.push({ ...effect, remainingRounds: nextRemaining });
    });

    nextCombatants[combatantId] = { ...combatant, effects: tickedEffects };
  });

  return { expired, state: { ...state, combatants: nextCombatants } };
};

const appendEvent = (state: EncounterState, event: EncounterEvent): EncounterState => ({
  ...state,
  events: [...state.events, event],
});

const appendReminders = (state: EncounterState, reminders: Reminder[]): EncounterState => {
  if (reminders.length === 0) {
    return state;
  }

  return { ...state, reminders: [...state.reminders, ...reminders] };
};

const buildExpiryReminders = (
  expired: { combatant: Combatant; effect: ActiveEffect }[],
  now: string,
  buildId: () => string,
): Reminder[] =>
  expired.map(({ combatant, effect }) => ({
    combatantId: combatant.id,
    dismissed: false,
    effectId: effect.id,
    eventId: null,
    id: buildId(),
    kind: 'effect_expired' as const,
    message: `${effect.name} on ${combatant.name} has ended.`,
    ts: now,
  }));

export type IdAndTimeFactories = ReminderFactories;

export interface RecordEventInput extends IdAndTimeFactories {
  event: EncounterEvent;
}

/**
 * Records a player-recorded event, appends it to the audit log, and runs the
 * reminder engine to surface any DM prompts that result.
 */
export const recordEvent = (state: EncounterState, input: RecordEventInput): EncounterState => {
  const { event, ...factories } = input;
  const withEvent = appendEvent(state, event);
  const newReminders = generateReminders(withEvent, event, factories);

  return appendReminders(withEvent, newReminders);
};

const turnEventForCombatant = (
  type: 'END_OF_TURN' | 'START_OF_TURN',
  combatantId: string,
  factories: IdAndTimeFactories,
  payload?: EventOfType<'START_OF_TURN'>['payload'],
): EncounterEvent =>
  type === 'START_OF_TURN'
    ? {
        combatantId,
        id: factories.buildId(),
        payload,
        ts: factories.now,
        type: 'START_OF_TURN',
      }
    : {
        combatantId,
        id: factories.buildId(),
        ts: factories.now,
        type: 'END_OF_TURN',
      };

const roundEvent = (
  type: 'END_OF_ROUND' | 'START_OF_ROUND',
  round: number,
  factories: IdAndTimeFactories,
): EncounterEvent => ({
  id: factories.buildId(),
  payload: { round },
  ts: factories.now,
  type,
});

const applyTurnLifecycle = (
  state: EncounterState,
  combatantId: string,
  tickOn: 'end_of_owner_turn' | 'start_of_owner_turn',
  triggerType: 'END_OF_TURN' | 'START_OF_TURN',
  factories: IdAndTimeFactories,
): EncounterState => {
  const tickResult = tickEffects(state, tickOn, [combatantId]);
  const event = turnEventForCombatant(triggerType, combatantId, factories);
  const withEvent = appendEvent(tickResult.state, event);
  const eventReminders = generateReminders(withEvent, event, factories);
  const expiryReminders = buildExpiryReminders(tickResult.expired, factories.now, factories.buildId);

  return appendReminders(withEvent, [...eventReminders, ...expiryReminders]);
};

const applyRoundLifecycle = (
  state: EncounterState,
  tickOn: 'end_of_round' | 'start_of_round',
  triggerType: 'END_OF_ROUND' | 'START_OF_ROUND',
  round: number,
  factories: IdAndTimeFactories,
): EncounterState => {
  const tickResult = tickEffects(state, tickOn, Object.keys(state.combatants));
  const event = roundEvent(triggerType, round, factories);
  const withEvent = appendEvent(tickResult.state, event);
  const eventReminders = generateReminders(withEvent, event, factories);
  const expiryReminders = buildExpiryReminders(tickResult.expired, factories.now, factories.buildId);

  return appendReminders(withEvent, [...eventReminders, ...expiryReminders]);
};

const resetActionEconomyFor = (state: EncounterState, combatantId: string): EncounterState => {
  if (state.combatants[combatantId] == null) {
    return state;
  }

  return resetActionEconomy(state, { combatantId });
};

export type AdvanceTurnInput = IdAndTimeFactories;

/**
 * Advances to the next combatant in initiative order. When the cursor wraps
 * past the last combatant, advances the round counter and runs round
 * lifecycle hooks. Runs end-of-turn hooks on the leaving combatant and
 * start-of-turn hooks on the arriving combatant.
 */
export const advanceTurn = (state: EncounterState, factories: AdvanceTurnInput): EncounterState => {
  if (state.initiativeOrder.length === 0) {
    return state;
  }

  const leavingCombatantId = state.initiativeOrder[state.turnIndex];
  let nextState = state;

  if (leavingCombatantId != null) {
    nextState = applyTurnLifecycle(nextState, leavingCombatantId, 'end_of_owner_turn', 'END_OF_TURN', factories);
  }

  const wrappedToNextRound = state.turnIndex + 1 >= state.initiativeOrder.length;
  let nextTurnIndex = state.turnIndex + 1;
  let nextRound = state.round;

  if (wrappedToNextRound) {
    nextState = applyRoundLifecycle(nextState, 'end_of_round', 'END_OF_ROUND', state.round, factories);
    nextRound = state.round + 1;
    nextTurnIndex = 0;
    nextState = applyRoundLifecycle(nextState, 'start_of_round', 'START_OF_ROUND', nextRound, factories);
  }

  nextState = { ...nextState, round: nextRound, turnIndex: nextTurnIndex };

  const arrivingCombatantId = nextState.initiativeOrder[nextTurnIndex];

  if (arrivingCombatantId != null) {
    nextState = resetActionEconomyFor(nextState, arrivingCombatantId);
    nextState = applyTurnLifecycle(nextState, arrivingCombatantId, 'start_of_owner_turn', 'START_OF_TURN', factories);
  }

  return nextState;
};

export type AdvanceRoundInput = IdAndTimeFactories;

/**
 * Forces the round to advance regardless of turn position. Used by DMs to
 * skip ahead. Resets all action economies and runs round lifecycle hooks.
 */
export const advanceRound = (state: EncounterState, factories: AdvanceRoundInput): EncounterState => {
  let nextState = applyRoundLifecycle(state, 'end_of_round', 'END_OF_ROUND', state.round, factories);

  nextState = { ...nextState, round: state.round + 1, turnIndex: 0 };
  nextState = applyRoundLifecycle(nextState, 'start_of_round', 'START_OF_ROUND', nextState.round, factories);

  Object.keys(nextState.combatants).forEach(combatantId => {
    nextState = resetActionEconomyFor(nextState, combatantId);
  });

  return nextState;
};

export type Transform =
  | { input: AddCombatantInput; type: 'addCombatant' }
  | { input: AdjustHpInput; type: 'adjustHp' }
  | { input: AdvanceRoundInput; type: 'advanceRound' }
  | { input: AdvanceTurnInput; type: 'advanceTurn' }
  | { input: ApplyEffectInput; type: 'applyEffect' }
  | { input: DismissReminderInput; type: 'dismissReminder' }
  | { input: MarkReactionUsedInput; type: 'markReactionUsed' }
  | { input: RecordEventInput; type: 'recordEvent' }
  | { input: RemoveCombatantInput; type: 'removeCombatant' }
  | { input: RemoveEffectInput; type: 'removeEffect' }
  | { input: ResetActionEconomyInput; type: 'resetActionEconomy' }
  | { input: SetInitiativeInput; type: 'setInitiative' };

/**
 * Dispatches one of the named transforms. Used by the API mutation layer
 * to compute the optimistic next state given an externally-described
 * transform descriptor.
 */
export const applyTransform = (state: EncounterState, transform: Transform): EncounterState =>
  match(transform)
    .with({ type: 'addCombatant' }, ({ input }) => addCombatant(state, input))
    .with({ type: 'removeCombatant' }, ({ input }) => removeCombatant(state, input))
    .with({ type: 'adjustHp' }, ({ input }) => adjustHp(state, input))
    .with({ type: 'setInitiative' }, ({ input }) => setInitiative(state, input))
    .with({ type: 'markReactionUsed' }, ({ input }) => markReactionUsed(state, input))
    .with({ type: 'resetActionEconomy' }, ({ input }) => resetActionEconomy(state, input))
    .with({ type: 'applyEffect' }, ({ input }) => applyEffect(state, input))
    .with({ type: 'removeEffect' }, ({ input }) => removeEffect(state, input))
    .with({ type: 'dismissReminder' }, ({ input }) => dismissReminder(state, input))
    .with({ type: 'recordEvent' }, ({ input }) => recordEvent(state, input))
    .with({ type: 'advanceTurn' }, ({ input }) => advanceTurn(state, input))
    .with({ type: 'advanceRound' }, ({ input }) => advanceRound(state, input))
    .exhaustive();
