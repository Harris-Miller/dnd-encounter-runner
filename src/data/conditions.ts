import { STANDARD_CONDITION_IDS } from '../types/encounterState';
import type { StandardCondition, TickOn, TriggerEventType } from '../types/encounterState';

export interface ConditionDef {
  defaultNotifyOn: TriggerEventType[];
  defaultTickOn: TickOn;
  description: string;
  id: StandardCondition;
  name: string;
}

export const STANDARD_CONDITIONS: Record<StandardCondition, ConditionDef> = {
  blinded: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
    id: 'blinded',
    name: 'Blinded',
  },
  charmed: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.",
    id: 'charmed',
    name: 'Charmed',
  },
  concentrating: {
    defaultNotifyOn: ['ON_DAMAGE'],
    defaultTickOn: 'manual',
    description:
      'When you take damage while concentrating, make a Constitution saving throw (DC equal to 10 or half the damage taken, whichever is higher) to maintain concentration on the spell.',
    id: 'concentrating',
    name: 'Concentrating',
  },
  deafened: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
    id: 'deafened',
    name: 'Deafened',
  },
  exhaustion: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      'Levels of exhaustion impose stacking penalties to ability checks, attack rolls, saving throws, and ultimately reduce HP maximum and movement.',
    id: 'exhaustion',
    name: 'Exhaustion',
  },
  frightened: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can't willingly move closer to the source of its fear.",
    id: 'frightened',
    name: 'Frightened',
  },
  grappled: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed. The condition ends if the grappler is incapacitated.",
    id: 'grappled',
    name: 'Grappled',
  },
  incapacitated: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description: "An incapacitated creature can't take actions or reactions.",
    id: 'incapacitated',
    name: 'Incapacitated',
  },
  invisible: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "An invisible creature is impossible to see without the aid of magic or a special sense. Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
    id: 'invisible',
    name: 'Invisible',
  },
  paralyzed: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A paralyzed creature is incapacitated and can't move or speak. It automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits is a crit if the attacker is within 5 feet.",
    id: 'paralyzed',
    name: 'Paralyzed',
  },
  petrified: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      'A petrified creature is transformed into a solid inanimate substance, incapacitated, has resistance to all damage, and is immune to poison and disease.',
    id: 'petrified',
    name: 'Petrified',
  },
  poisoned: {
    defaultNotifyOn: ['START_OF_TURN'],
    defaultTickOn: 'manual',
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    id: 'poisoned',
    name: 'Poisoned',
  },
  prone: {
    defaultNotifyOn: ['START_OF_TURN'],
    defaultTickOn: 'manual',
    description:
      "A prone creature's only movement option is to crawl, unless it stands up. It has disadvantage on attack rolls. Attack rolls against the creature have advantage if the attacker is within 5 feet, otherwise disadvantage.",
    id: 'prone',
    name: 'Prone',
  },
  restrained: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A restrained creature's speed is 0. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.",
    id: 'restrained',
    name: 'Restrained',
  },
  stunned: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "A stunned creature is incapacitated, can't move, and can speak only falteringly. It automatically fails Strength and Dexterity saving throws, and attack rolls against it have advantage.",
    id: 'stunned',
    name: 'Stunned',
  },
  unconscious: {
    defaultNotifyOn: [],
    defaultTickOn: 'manual',
    description:
      "An unconscious creature is incapacitated, can't move or speak, drops what it's holding, and falls prone. It automatically fails Strength and Dexterity saving throws, attack rolls against it have advantage, and any hit within 5 feet is a critical hit.",
    id: 'unconscious',
    name: 'Unconscious',
  },
};

export const getConditionById = (id: StandardCondition): ConditionDef => {
  const def = STANDARD_CONDITIONS[id];

  if (def == null) {
    throw new Error(`Unknown condition id: "${id}"`);
  }

  return def;
};

export const getAllConditions = (): ConditionDef[] => STANDARD_CONDITION_IDS.map(id => STANDARD_CONDITIONS[id]);
