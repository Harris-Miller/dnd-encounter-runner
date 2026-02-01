// Trigger system for D&D encounter events

export type TriggerEventType = 'END_OF_TURN' | 'ON_ATTACK' | 'ON_DAMAGE' | 'ON_HIT' | 'ON_SPELL_CAST' | 'START_OF_TURN';

export interface TriggerEvent {
  characterId: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  type: TriggerEventType;
}

export interface StartOfTurnEvent extends TriggerEvent {
  type: 'START_OF_TURN';
}

export interface EndOfTurnEvent extends TriggerEvent {
  type: 'END_OF_TURN';
}

export interface OnHitEvent extends TriggerEvent {
  payload: {
    attackerId: string;
    targetId: string;
  };
  type: 'ON_HIT';
}

export interface OnDamageEvent extends TriggerEvent {
  payload: {
    amount?: number;
    damageType: string;
    sourceId?: string;
  };
  type: 'ON_DAMAGE';
}

export interface OnAttackEvent extends TriggerEvent {
  payload: {
    targetId: string;
  };
  type: 'ON_ATTACK';
}

export interface OnSpellCastEvent extends TriggerEvent {
  payload: {
    requiresConcentration: boolean;
    spellIndex?: string;
    spellName: string;
    targetIds?: string[];
  };
  type: 'ON_SPELL_CAST';
}
