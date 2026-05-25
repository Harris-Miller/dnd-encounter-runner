import { z } from 'zod';

export const STANDARD_CONDITION_IDS = [
  'blinded',
  'charmed',
  'concentrating',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const;

export const StandardCondition = z.enum(STANDARD_CONDITION_IDS);
export type StandardCondition = z.infer<typeof StandardCondition>;

export const TRIGGER_EVENT_TYPES = [
  'START_OF_TURN',
  'END_OF_TURN',
  'START_OF_ROUND',
  'END_OF_ROUND',
  'ON_ATTACK',
  'ON_HIT',
  'ON_CRIT',
  'ON_MISS',
  'ON_DAMAGE',
  'ON_SPELL_CAST',
  'ON_REACTION_USED',
] as const;

export const TriggerEvent = z.enum(TRIGGER_EVENT_TYPES);
export type TriggerEvent = z.infer<typeof TriggerEvent>;

export const TickOn = z.enum(['start_of_owner_turn', 'end_of_owner_turn', 'start_of_round', 'end_of_round', 'manual']);
export type TickOn = z.infer<typeof TickOn>;

export const EffectSource = z.enum(['item', 'spell', 'manual', 'concentration', 'condition']);
export type EffectSource = z.infer<typeof EffectSource>;

export const EffectDescriptor = z.discriminatedUnion('kind', [
  z.object({ damageType: z.string(), kind: z.literal('damage_resistance') }),
  z.object({ damageType: z.string(), kind: z.literal('damage_immunity') }),
  z.object({ damageType: z.string(), kind: z.literal('damage_vulnerability') }),
  z.object({ kind: z.literal('crit_damage_immunity') }),
  z.object({ conditionId: StandardCondition, kind: z.literal('condition') }),
  z.object({ kind: z.literal('concentration'), spellName: z.string() }),
  z.object({
    kind: z.literal('reaction_available'),
    promptMessage: z.string(),
    reactionName: z.string(),
    triggerEvents: z.array(TriggerEvent),
  }),
  z.object({ descriptor: z.string(), kind: z.literal('custom') }),
]);
export type EffectDescriptor = z.infer<typeof EffectDescriptor>;

export const EffectExpiry = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('never') }),
  z.object({ kind: z.literal('end_of_combat') }),
  z.object({ kind: z.literal('after_rounds'), rounds: z.number().int().nonnegative() }),
]);
export type EffectExpiry = z.infer<typeof EffectExpiry>;

export const ActiveEffect = z.object({
  description: z.string(),
  expiresAt: EffectExpiry,
  id: z.string(),
  name: z.string(),
  notifyOn: z.array(TriggerEvent),
  provides: z.array(EffectDescriptor),
  refId: z.string().nullable(),
  remainingRounds: z.number().int().nullable(),
  source: z.string(),
  sourceType: EffectSource,
  tickOn: TickOn,
});
export type ActiveEffect = z.infer<typeof ActiveEffect>;

export const ActionEconomy = z.object({
  actionUsed: z.boolean(),
  bonusActionUsed: z.boolean(),
  reactionUsed: z.boolean(),
});
export type ActionEconomy = z.infer<typeof ActionEconomy>;

export const DEFAULT_ACTION_ECONOMY: ActionEconomy = {
  actionUsed: false,
  bonusActionUsed: false,
  reactionUsed: false,
};

export const CombatantType = z.enum(['character', 'monster']);
export type CombatantType = z.infer<typeof CombatantType>;

export const EquippedItem = z.object({
  description: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  refId: z.string().nullable(),
});
export type EquippedItem = z.infer<typeof EquippedItem>;

export const KnownSpell = z.object({
  description: z.string().nullable(),
  id: z.string(),
  isConcentration: z.boolean(),
  level: z.number().int().nonnegative(),
  name: z.string(),
  refId: z.string().nullable(),
});
export type KnownSpell = z.infer<typeof KnownSpell>;

export const Combatant = z.object({
  actionEconomy: ActionEconomy,
  armorClass: z.number().int(),
  currentHp: z.number().int(),
  damageImmunities: z.array(z.string()),
  damageResistances: z.array(z.string()),
  damageVulnerabilities: z.array(z.string()),
  effects: z.array(ActiveEffect),
  equippedItems: z.array(EquippedItem),
  id: z.string(),
  initiative: z.number().int().nullable(),
  knownSpells: z.array(KnownSpell),
  maxHp: z.number().int(),
  name: z.string(),
  refId: z.string().nullable(),
  tempHp: z.number().int(),
  type: CombatantType,
});
export type Combatant = z.infer<typeof Combatant>;

export const ReminderKind = z.enum([
  'concentration_save',
  'damage_resistance',
  'damage_immunity',
  'damage_vulnerability',
  'crit_damage_immunity',
  'reaction_prompt',
  'condition_tick',
  'effect_expired',
  'info',
]);
export type ReminderKind = z.infer<typeof ReminderKind>;

export const reminderSchema = z.object({
  combatantId: z.string().nullable(),
  dismissed: z.boolean(),
  effectId: z.string().nullable(),
  eventId: z.string().nullable(),
  id: z.string(),
  kind: ReminderKind,
  message: z.string(),
  ts: z.string(),
});
export type Reminder = z.infer<typeof reminderSchema>;

export const DamageType = z.string();
export type DamageType = z.infer<typeof DamageType>;

const baseEventFields = {
  id: z.string(),
  ts: z.string(),
};

export const EncounterEvent = z.discriminatedUnion('type', [
  z.object({
    ...baseEventFields,
    combatantId: z.string(),
    payload: z.object({ previousRound: z.number().int(), previousTurnIndex: z.number().int() }).optional(),
    type: z.literal('START_OF_TURN'),
  }),
  z.object({
    ...baseEventFields,
    combatantId: z.string(),
    type: z.literal('END_OF_TURN'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ round: z.number().int() }),
    type: z.literal('START_OF_ROUND'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ round: z.number().int() }),
    type: z.literal('END_OF_ROUND'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ attackerCombatantId: z.string(), targetCombatantId: z.string() }),
    type: z.literal('ON_ATTACK'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ attackerCombatantId: z.string(), targetCombatantId: z.string() }),
    type: z.literal('ON_HIT'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ attackerCombatantId: z.string(), targetCombatantId: z.string() }),
    type: z.literal('ON_CRIT'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ attackerCombatantId: z.string(), targetCombatantId: z.string() }),
    type: z.literal('ON_MISS'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({
      amount: z.number().int().nonnegative(),
      damageType: DamageType,
      sourceCombatantId: z.string().nullable(),
      targetCombatantId: z.string(),
    }),
    type: z.literal('ON_DAMAGE'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({
      casterCombatantId: z.string(),
      isConcentration: z.boolean(),
      spellName: z.string(),
      targetCombatantIds: z.array(z.string()),
    }),
    type: z.literal('ON_SPELL_CAST'),
  }),
  z.object({
    ...baseEventFields,
    payload: z.object({ combatantId: z.string(), reactionName: z.string() }),
    type: z.literal('ON_REACTION_USED'),
  }),
]);
export type EncounterEvent = z.infer<typeof EncounterEvent>;

export type EventOfType<T extends TriggerEvent> = Extract<EncounterEvent, { type: T }>;

export const EncounterState = z.object({
  combatants: z.record(z.string(), Combatant),
  events: z.array(EncounterEvent),
  initiativeOrder: z.array(z.string()),
  reminders: z.array(reminderSchema),
  round: z.number().int().nonnegative(),
  turnIndex: z.number().int().nonnegative(),
});
export type EncounterState = z.infer<typeof EncounterState>;
