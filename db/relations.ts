import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, r => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  users: {
    accounts: r.many.accounts(),
    sessions: r.many.sessions(),
    playerCharacters: r.many.playerCharacters(),
  },
  damageTypes: {
    weapons: r.many.weapons(),
    monsterDamageModifiers: r.many.monsterDamageModifiers(),
    combatEvents: r.many.combatEvents(),
  },
  statusDefinitions: {
    statusRules: r.many.statusRules(),
    creatureEffects: r.many.creatureEffects(),
  },
  statusRules: {
    statusDefinition: r.one.statusDefinitions({
      from: r.statusRules.statusDefinitionId,
      to: r.statusDefinitions.id,
    }),
  },
  weapons: {
    damageType: r.one.damageTypes({
      from: r.weapons.damageTypeId,
      to: r.damageTypes.id,
    }),
    playerCharacterWeapons: r.many.playerCharacterWeapons(),
    combatEvents: r.many.combatEvents(),
  },
  monsters: {
    monsterDamageModifiers: r.many.monsterDamageModifiers(),
    encounterCreatures: r.many.encounterCreatures(),
  },
  monsterDamageModifiers: {
    monster: r.one.monsters({
      from: r.monsterDamageModifiers.monsterId,
      to: r.monsters.id,
    }),
    damageType: r.one.damageTypes({
      from: r.monsterDamageModifiers.damageTypeId,
      to: r.damageTypes.id,
    }),
  },
  playerCharacters: {
    user: r.one.users({
      from: r.playerCharacters.userId,
      to: r.users.id,
    }),
    encounterCreatures: r.many.encounterCreatures(),
    playerCharacterWeapons: r.many.playerCharacterWeapons(),
  },
  encounters: {
    encounterCreatures: r.many.encounterCreatures(),
    combatEvents: r.many.combatEvents(),
  },
  encounterCreatures: {
    encounter: r.one.encounters({
      from: r.encounterCreatures.encounterId,
      to: r.encounters.id,
    }),
    playerCharacter: r.one.playerCharacters({
      from: r.encounterCreatures.playerCharacterId,
      to: r.playerCharacters.id,
    }),
    monster: r.one.monsters({
      from: r.encounterCreatures.monsterId,
      to: r.monsters.id,
    }),
    creatureEffects: r.many.creatureEffects(),
    combatEventsAsAttacker: r.many.combatEvents(),
    combatEventsAsTarget: r.many.combatEvents(),
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
  combatEvents: {
    encounter: r.one.encounters({
      from: r.combatEvents.encounterId,
      to: r.encounters.id,
    }),
    attackerEncounterCreature: r.one.encounterCreatures({
      from: r.combatEvents.attackerEncounterCreatureId,
      to: r.encounterCreatures.id,
    }),
    targetEncounterCreature: r.one.encounterCreatures({
      from: r.combatEvents.targetEncounterCreatureId,
      to: r.encounterCreatures.id,
    }),
    weapon: r.one.weapons({
      from: r.combatEvents.weaponId,
      to: r.weapons.id,
    }),
    damageType: r.one.damageTypes({
      from: r.combatEvents.damageTypeId,
      to: r.damageTypes.id,
    }),
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
}));
