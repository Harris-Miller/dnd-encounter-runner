import { match } from 'ts-pattern';

import type {
  ActiveEffect,
  Combatant,
  EffectDescriptor,
  EncounterEvent,
  EncounterState,
  EventOfType,
  Reminder,
} from '../types/encounterState';

export interface ReminderFactories {
  buildId: () => string;
  now: string;
}

const createReminder = (
  combatantId: string | null,
  kind: Reminder['kind'],
  message: string,
  eventId: string | null,
  effectId: string | null,
  factories: ReminderFactories,
): Reminder => ({
  combatantId,
  dismissed: false,
  effectId,
  eventId,
  id: factories.buildId(),
  kind,
  message,
  ts: factories.now,
});

const hasCritDamageImmunity = (combatant: Combatant): ActiveEffect | undefined =>
  combatant.effects.find(effect => effect.provides.some(descriptor => descriptor.kind === 'crit_damage_immunity'));

const findDamageModifierEffect = (
  combatant: Combatant,
  damageType: string,
  kind: 'damage_immunity' | 'damage_resistance' | 'damage_vulnerability',
): ActiveEffect | undefined =>
  combatant.effects.find(effect =>
    effect.provides.some(
      descriptor => descriptor.kind === kind && descriptor.damageType.toLowerCase() === damageType.toLowerCase(),
    ),
  );

const findConcentrationEffect = (combatant: Combatant): ActiveEffect | undefined =>
  combatant.effects.find(effect => effect.provides.some(descriptor => descriptor.kind === 'concentration'));

const getConcentrationDescriptor = (
  effect: ActiveEffect,
): Extract<EffectDescriptor, { kind: 'concentration' }> | undefined =>
  effect.provides.find(
    (descriptor): descriptor is Extract<EffectDescriptor, { kind: 'concentration' }> =>
      descriptor.kind === 'concentration',
  );

const critImmunityReminders = (
  state: EncounterState,
  event: EventOfType<'ON_CRIT'>,
  factories: ReminderFactories,
): Reminder[] => {
  const target = state.combatants[event.payload.targetCombatantId];

  if (target == null) {
    return [];
  }

  const protectingEffect = hasCritDamageImmunity(target);

  if (protectingEffect == null) {
    return [];
  }

  return [
    createReminder(
      target.id,
      'crit_damage_immunity',
      `${target.name}'s ${protectingEffect.name} prevents critical hit damage — deal normal damage only.`,
      event.id,
      protectingEffect.id,
      factories,
    ),
  ];
};

const damageModifierReminders = (
  state: EncounterState,
  event: EventOfType<'ON_DAMAGE'>,
  factories: ReminderFactories,
): Reminder[] => {
  const target = state.combatants[event.payload.targetCombatantId];

  if (target == null) {
    return [];
  }

  const reminders: Reminder[] = [];
  const { damageType } = event.payload;
  const immunity = findDamageModifierEffect(target, damageType, 'damage_immunity');

  if (immunity != null) {
    reminders.push(
      createReminder(
        target.id,
        'damage_immunity',
        `${target.name} is immune to ${damageType} damage (${immunity.name}) — no damage taken.`,
        event.id,
        immunity.id,
        factories,
      ),
    );
  }

  const resistance = findDamageModifierEffect(target, damageType, 'damage_resistance');

  if (resistance != null) {
    reminders.push(
      createReminder(
        target.id,
        'damage_resistance',
        `${target.name} has resistance to ${damageType} damage (${resistance.name}) — take half damage.`,
        event.id,
        resistance.id,
        factories,
      ),
    );
  }

  const vulnerability = findDamageModifierEffect(target, damageType, 'damage_vulnerability');

  if (vulnerability != null) {
    reminders.push(
      createReminder(
        target.id,
        'damage_vulnerability',
        `${target.name} has vulnerability to ${damageType} damage (${vulnerability.name}) — take double damage.`,
        event.id,
        vulnerability.id,
        factories,
      ),
    );
  }

  return reminders;
};

const concentrationSaveReminders = (
  state: EncounterState,
  event: EventOfType<'ON_DAMAGE'>,
  factories: ReminderFactories,
): Reminder[] => {
  const target = state.combatants[event.payload.targetCombatantId];

  if (target == null) {
    return [];
  }

  const concentrationEffect = findConcentrationEffect(target);

  if (concentrationEffect == null) {
    return [];
  }

  const descriptor = getConcentrationDescriptor(concentrationEffect);
  const spellName = descriptor?.spellName ?? concentrationEffect.name;
  const dc = Math.max(10, Math.floor(event.payload.amount / 2));

  return [
    createReminder(
      target.id,
      'concentration_save',
      `${target.name} must make a DC ${String(dc)} Constitution saving throw to maintain concentration on ${spellName}.`,
      event.id,
      concentrationEffect.id,
      factories,
    ),
  ];
};

const eventInvolvesCombatant = (event: EncounterEvent, combatantId: string): boolean =>
  match(event)
    .with({ type: 'START_OF_TURN' }, ({ combatantId: id }) => id === combatantId)
    .with({ type: 'END_OF_TURN' }, ({ combatantId: id }) => id === combatantId)
    .with(
      { type: 'ON_ATTACK' },
      ({ payload }) => payload.attackerCombatantId === combatantId || payload.targetCombatantId === combatantId,
    )
    .with(
      { type: 'ON_HIT' },
      ({ payload }) => payload.attackerCombatantId === combatantId || payload.targetCombatantId === combatantId,
    )
    .with(
      { type: 'ON_CRIT' },
      ({ payload }) => payload.attackerCombatantId === combatantId || payload.targetCombatantId === combatantId,
    )
    .with(
      { type: 'ON_MISS' },
      ({ payload }) => payload.attackerCombatantId === combatantId || payload.targetCombatantId === combatantId,
    )
    .with(
      { type: 'ON_DAMAGE' },
      ({ payload }) => payload.targetCombatantId === combatantId || payload.sourceCombatantId === combatantId,
    )
    .with(
      { type: 'ON_SPELL_CAST' },
      ({ payload }) => payload.casterCombatantId === combatantId || payload.targetCombatantIds.includes(combatantId),
    )
    .with({ type: 'ON_REACTION_USED' }, ({ payload }) => payload.combatantId === combatantId)
    .with({ type: 'START_OF_ROUND' }, () => true)
    .with({ type: 'END_OF_ROUND' }, () => true)
    .exhaustive();

const reactionPromptReminders = (
  state: EncounterState,
  event: EncounterEvent,
  factories: ReminderFactories,
): Reminder[] => {
  const reminders: Reminder[] = [];

  Object.values(state.combatants).forEach(combatant => {
    if (combatant.actionEconomy.reactionUsed) {
      return;
    }

    combatant.effects.forEach(effect => {
      effect.provides.forEach(descriptor => {
        if (descriptor.kind !== 'reaction_available') {
          return;
        }

        if (!descriptor.triggerEvents.includes(event.type)) {
          return;
        }

        if (!eventInvolvesCombatant(event, combatant.id)) {
          return;
        }

        reminders.push(
          createReminder(
            combatant.id,
            'reaction_prompt',
            `${combatant.name} may use ${descriptor.reactionName}: ${descriptor.promptMessage}`,
            event.id,
            effect.id,
            factories,
          ),
        );
      });
    });
  });

  return reminders;
};

const conditionTickReminders = (
  state: EncounterState,
  event: EventOfType<'END_OF_TURN'> | EventOfType<'START_OF_TURN'>,
  factories: ReminderFactories,
): Reminder[] => {
  const owner = state.combatants[event.combatantId];

  if (owner == null) {
    return [];
  }

  const reminders: Reminder[] = [];

  owner.effects.forEach(effect => {
    if (!effect.notifyOn.includes(event.type)) {
      return;
    }

    reminders.push(
      createReminder(
        owner.id,
        'condition_tick',
        `${owner.name}: ${effect.description}`,
        event.id,
        effect.id,
        factories,
      ),
    );
  });

  return reminders;
};

/**
 * Pure derivation of reminders given an encounter state and a triggering event.
 *
 * Rule families:
 * - ON_CRIT: crit-damage immunity prompts (e.g., Adamantine Armour)
 * - ON_DAMAGE: damage resistance/immunity/vulnerability and concentration saves
 * - ON_HIT / ON_MISS / ON_ATTACK / ON_SPELL_CAST: reaction prompts for any
 *   combatant with a matching `reaction_available` effect who hasn't used their
 *   reaction this round
 * - START_OF_TURN / END_OF_TURN: condition-tick reminders for effects whose
 *   notifyOn list includes the trigger
 */
export const generateReminders = (
  state: EncounterState,
  event: EncounterEvent,
  factories: ReminderFactories,
): Reminder[] =>
  match(event)
    .with({ type: 'ON_CRIT' }, evt => [
      ...critImmunityReminders(state, evt, factories),
      ...reactionPromptReminders(state, evt, factories),
    ])
    .with({ type: 'ON_DAMAGE' }, evt => [
      ...damageModifierReminders(state, evt, factories),
      ...concentrationSaveReminders(state, evt, factories),
      ...reactionPromptReminders(state, evt, factories),
    ])
    .with({ type: 'ON_SPELL_CAST' }, evt => reactionPromptReminders(state, evt, factories))
    .with({ type: 'ON_HIT' }, evt => reactionPromptReminders(state, evt, factories))
    .with({ type: 'ON_ATTACK' }, evt => reactionPromptReminders(state, evt, factories))
    .with({ type: 'ON_MISS' }, evt => reactionPromptReminders(state, evt, factories))
    .with({ type: 'START_OF_TURN' }, evt => [
      ...conditionTickReminders(state, evt, factories),
      ...reactionPromptReminders(state, evt, factories),
    ])
    .with({ type: 'END_OF_TURN' }, evt => [
      ...conditionTickReminders(state, evt, factories),
      ...reactionPromptReminders(state, evt, factories),
    ])
    .with({ type: 'START_OF_ROUND' }, () => [])
    .with({ type: 'END_OF_ROUND' }, () => [])
    .with({ type: 'ON_REACTION_USED' }, () => [])
    .exhaustive();
