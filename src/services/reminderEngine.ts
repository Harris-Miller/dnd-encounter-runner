// Reminder engine for generating reminders based on game events

import type { Character, Reminder, StandardCondition } from '../types/encounter';
import type { TriggerEvent, TriggerEventType } from '../types/triggers';

export interface ReminderRule {
  conditionId: StandardCondition;
  generateReminder: (character: Character, event: TriggerEvent) => Reminder | null;
  triggerEvent: TriggerEventType;
}

// Concentration check reminder: When a character concentrating is hit
const concentrationCheckRule: ReminderRule = {
  conditionId: 'concentrating',
  generateReminder: (character, _event) => {
    const hasConcentration = character.activeEffects.some(effect => effect.conditionId === 'concentrating');

    if (!hasConcentration) {
      return null;
    }

    return {
      characterId: character.id,
      characterName: character.name,
      id: `reminder-${Date.now()}-${Math.random()}`,
      message: `${character.name} must make a Constitution saving throw to maintain concentration (DC 10 or half the damage taken, whichever is higher).`,
      timestamp: Date.now(),
      triggerEvent: 'ON_HIT',
    };
  },
  triggerEvent: 'ON_HIT',
};

// Check damage resistance/vulnerability/immunity for a character
const checkDamageModifiers = (character: Character, damageType: string): Reminder | null => {
  const hasResistance = character.damageResistances.some(
    resistance => resistance.toLowerCase() === damageType.toLowerCase(),
  );

  const hasVulnerability = character.damageVulnerabilities.some(
    vulnerability => vulnerability.toLowerCase() === damageType.toLowerCase(),
  );

  const hasImmunity = character.damageImmunities.some(immunity => immunity.toLowerCase() === damageType.toLowerCase());

  if (hasImmunity) {
    return {
      characterId: character.id,
      characterName: character.name,
      id: `reminder-${Date.now()}-${Math.random()}`,
      message: `${character.name} is immune to ${damageType} damage and takes no damage.`,
      timestamp: Date.now(),
      triggerEvent: 'ON_DAMAGE',
    };
  }

  if (hasResistance) {
    return {
      characterId: character.id,
      characterName: character.name,
      id: `reminder-${Date.now()}-${Math.random()}`,
      message: `${character.name} has resistance to ${damageType} damage and takes half damage.`,
      timestamp: Date.now(),
      triggerEvent: 'ON_DAMAGE',
    };
  }

  if (hasVulnerability) {
    return {
      characterId: character.id,
      characterName: character.name,
      id: `reminder-${Date.now()}-${Math.random()}`,
      message: `${character.name} has vulnerability to ${damageType} damage and takes double damage.`,
      timestamp: Date.now(),
      triggerEvent: 'ON_DAMAGE',
    };
  }

  return null;
};

// Turn-based effect reminders
const turnBasedReminderRule = (
  conditionId: StandardCondition,
  message: string,
  triggerEvent: 'END_OF_TURN' | 'START_OF_TURN',
): ReminderRule => ({
  conditionId,
  generateReminder: character => {
    const hasCondition = character.activeEffects.some(effect => effect.conditionId === conditionId);

    if (!hasCondition) {
      return null;
    }

    return {
      characterId: character.id,
      characterName: character.name,
      id: `reminder-${Date.now()}-${Math.random()}`,
      message: `${character.name}: ${message}`,
      timestamp: Date.now(),
      triggerEvent,
    };
  },
  triggerEvent,
});

// Common turn-based reminders
export const TURN_BASED_RULES: ReminderRule[] = [
  turnBasedReminderRule('poisoned', 'Has disadvantage on attack rolls and ability checks.', 'START_OF_TURN'),
  turnBasedReminderRule('prone', 'Has disadvantage on attack rolls. Standing up ends this condition.', 'START_OF_TURN'),
];

// All reminder rules
export const REMINDER_RULES: ReminderRule[] = [concentrationCheckRule, ...TURN_BASED_RULES];

const checkConcentrationReminders = (character: Character, event: TriggerEvent): Reminder[] => {
  if (event.type !== 'ON_HIT') {
    return [];
  }
  const reminder = concentrationCheckRule.generateReminder(character, event);
  return reminder ? [reminder] : [];
};

const checkDamageReminders = (character: Character, event: TriggerEvent, damageType?: string): Reminder[] => {
  if (event.type !== 'ON_DAMAGE' || damageType === undefined || damageType === '') {
    return [];
  }
  const reminder = checkDamageModifiers(character, damageType);
  return reminder ? [reminder] : [];
};

const checkTurnBasedReminders = (character: Character, event: TriggerEvent): Reminder[] => {
  if (event.type !== 'START_OF_TURN' && event.type !== 'END_OF_TURN') {
    return [];
  }
  return TURN_BASED_RULES.filter(rule => rule.triggerEvent === event.type)
    .map(rule => rule.generateReminder(character, event))
    .filter((reminder): reminder is Reminder => reminder !== null);
};

/**
 * Generate reminders for a character based on a trigger event
 */
export const generateReminders = (character: Character, event: TriggerEvent, damageType?: string): Reminder[] => {
  return [
    ...checkConcentrationReminders(character, event),
    ...checkDamageReminders(character, event, damageType),
    ...checkTurnBasedReminders(character, event),
  ];
};
