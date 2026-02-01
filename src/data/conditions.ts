// Standard D&D 5e condition definitions with their triggers

import type { Condition, StandardCondition } from '../types/encounter';

export const STANDARD_CONDITIONS: Record<StandardCondition, Condition> = {
  blinded: {
    description:
      "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
    id: 'blinded',
    name: 'Blinded',
    triggers: [],
  },
  charmed: {
    description:
      "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.",
    id: 'charmed',
    name: 'Charmed',
    triggers: [],
  },
  concentrating: {
    description:
      'When you cast a spell that has a casting time longer than a single action or reaction, you must spend your action each turn casting the spell, and you must maintain your concentration while you do so. If your concentration is broken, the spell fails.',
    id: 'concentrating',
    name: 'Concentrating',
    triggers: ['ON_DAMAGE'],
  },
  deafened: {
    description: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
    id: 'deafened',
    name: 'Deafened',
    triggers: [],
  },
  exhaustion: {
    description:
      'Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion.',
    id: 'exhaustion',
    name: 'Exhaustion',
    triggers: [],
  },
  frightened: {
    description:
      "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can't willingly move closer to the source of its fear.",
    id: 'frightened',
    name: 'Frightened',
    triggers: [],
  },
  grappled: {
    description:
      "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed. The condition ends if the grappler is incapacitated.",
    id: 'grappled',
    name: 'Grappled',
    triggers: [],
  },
  incapacitated: {
    description: "An incapacitated creature can't take actions or reactions.",
    id: 'incapacitated',
    name: 'Incapacitated',
    triggers: [],
  },
  invisible: {
    description:
      "An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves. Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.",
    id: 'invisible',
    name: 'Invisible',
    triggers: [],
  },
  paralyzed: {
    description:
      "A paralyzed creature is incapacitated and can't move or speak. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
    id: 'paralyzed',
    name: 'Paralyzed',
    triggers: [],
  },
  petrified: {
    description:
      "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). The creature's weight increases by a factor of ten, and it ceases aging. The creature is incapacitated, can't move or speak, and is unaware of its surroundings. Attack rolls against the creature have advantage. The creature automatically fails Strength and Dexterity saving throws. The creature has resistance to all damage. The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
    id: 'petrified',
    name: 'Petrified',
    triggers: [],
  },
  poisoned: {
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    id: 'poisoned',
    name: 'Poisoned',
    triggers: [],
  },
  prone: {
    description:
      "A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition. The creature has disadvantage on attack rolls. An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.",
    id: 'prone',
    name: 'Prone',
    triggers: [],
  },
  restrained: {
    description:
      "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.",
    id: 'restrained',
    name: 'Restrained',
    triggers: [],
  },
  stunned: {
    description:
      "A stunned creature is incapacitated, can't move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.",
    id: 'stunned',
    name: 'Stunned',
    triggers: [],
  },
  unconscious: {
    description:
      "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings. The creature drops whatever it's holding and falls prone. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
    id: 'unconscious',
    name: 'Unconscious',
    triggers: [],
  },
};

export const getConditionById = (id: StandardCondition): Condition => {
  return STANDARD_CONDITIONS[id];
};

export const getAllConditions = (): Condition[] => {
  return Object.values(STANDARD_CONDITIONS);
};
