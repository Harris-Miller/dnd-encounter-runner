// Core encounter data types for D&D encounter state tracking

import type { TriggerEventType } from './triggers';

export type CharacterType = 'monster' | 'player';

export interface Character {
  activeEffects: ActiveEffect[];
  damageImmunities: string[];
  damageResistances: string[];
  damageVulnerabilities: string[];
  id: string;
  initiative: number;
  name: string;
  type: CharacterType;
}

export type StandardCondition =
  | 'blinded'
  | 'charmed'
  | 'concentrating'
  | 'deafened'
  | 'exhaustion'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious';

export interface Condition {
  description: string;
  id: StandardCondition;
  name: string;
  triggers: TriggerEventType[];
}

export interface ActiveEffect {
  // What caused this effect (e.g., "Poison Dart", "Spell: Hold Person")
  appliedAt: number;
  conditionId: StandardCondition;
  // Timestamp
  duration?: number;
  id: string;
  // Duration in turns, undefined means until removed manually
  remainingTurns?: number;
  source: string; // Remaining turns, decremented each turn
}

export interface Reminder {
  characterId: string;
  characterName: string;
  id: string;
  message: string;
  timestamp: number;
  triggerEvent: TriggerEventType;
}

export interface Encounter {
  characters: Character[];
  id: string;
  reminderLog: Reminder[];
}
