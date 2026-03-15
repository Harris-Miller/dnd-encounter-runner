import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, r => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  combatEvents: {
    attackerEncounterCreature: r.one.encounterCreatures({
      from: r.combatEvents.attackerEncounterCreatureId,
      to: r.encounterCreatures.id,
    }),
    damageType: r.one.damageTypes({
      from: r.combatEvents.damageTypeId,
      to: r.damageTypes.id,
    }),
    encounter: r.one.encounters({
      from: r.combatEvents.encounterId,
      to: r.encounters.id,
    }),
    targetEncounterCreature: r.one.encounterCreatures({
      from: r.combatEvents.targetEncounterCreatureId,
      to: r.encounterCreatures.id,
    }),
    weapon: r.one.weapons({
      from: r.combatEvents.weaponId,
      to: r.weapons.id,
    }),
  },
  creatureEffects: {
    encounterCreature: r.one.encounterCreatures({
      from: r.creatureEffects.encounterCreatureId,
      to: r.encounterCreatures.id,
    }),
    statusDefinition: r.one.statusDefinitions({
      from: r.creatureEffects.statusDefinitionId,
      to: r.statusDefinitions.id,
    }),
  },
  damageTypes: {
    combatEvents: r.many.combatEvents(),
    monsterDamageModifiers: r.many.monsterDamageModifiers(),
    weapons: r.many.weapons(),
  },
  encounterCreatures: {
    combatEventsAsAttacker: r.many.combatEvents(),
    combatEventsAsTarget: r.many.combatEvents(),
    creatureEffects: r.many.creatureEffects(),
    encounter: r.one.encounters({
      from: r.encounterCreatures.encounterId,
      to: r.encounters.id,
    }),
    monster: r.one.monsters({
      from: r.encounterCreatures.monsterId,
      to: r.monsters.id,
    }),
    playerCharacter: r.one.playerCharacters({
      from: r.encounterCreatures.playerCharacterId,
      to: r.playerCharacters.id,
    }),
  },
  encounters: {
    combatEvents: r.many.combatEvents(),
    encounterCreatures: r.many.encounterCreatures(),
  },
  monsterDamageModifiers: {
    damageType: r.one.damageTypes({
      from: r.monsterDamageModifiers.damageTypeId,
      to: r.damageTypes.id,
    }),
    monster: r.one.monsters({
      from: r.monsterDamageModifiers.monsterId,
      to: r.monsters.id,
    }),
  },
  monsters: {
    encounterCreatures: r.many.encounterCreatures(),
    monsterDamageModifiers: r.many.monsterDamageModifiers(),
  },
  playerCharacterWeapons: {
    playerCharacter: r.one.playerCharacters({
      from: r.playerCharacterWeapons.playerCharacterId,
      to: r.playerCharacters.id,
    }),
    weapon: r.one.weapons({
      from: r.playerCharacterWeapons.weaponId,
      to: r.weapons.id,
    }),
  },
  playerCharacters: {
    encounterCreatures: r.many.encounterCreatures(),
    playerCharacterWeapons: r.many.playerCharacterWeapons(),
    user: r.one.users({
      from: r.playerCharacters.userId,
      to: r.users.id,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  statusDefinitions: {
    creatureEffects: r.many.creatureEffects(),
    statusRules: r.many.statusRules(),
  },
  statusRules: {
    statusDefinition: r.one.statusDefinitions({
      from: r.statusRules.statusDefinitionId,
      to: r.statusDefinitions.id,
    }),
  },
  users: {
    accounts: r.many.accounts(),
    playerCharacters: r.many.playerCharacters(),
    sessions: r.many.sessions(),
  },
  weapons: {
    combatEvents: r.many.combatEvents(),
    damageType: r.one.damageTypes({
      from: r.weapons.damageTypeId,
      to: r.damageTypes.id,
    }),
    playerCharacterWeapons: r.many.playerCharacterWeapons(),
  },
}));
