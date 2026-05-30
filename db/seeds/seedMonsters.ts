import type { InferInsertModel } from 'drizzle-orm';

import { monsters } from '../schema/monsters.ts';

import type { createSeedClient } from './connection.ts';
import { drizzleSeedForMonsters } from './drizzleSeedNumbers.ts';
import { chunk, readJsonArray } from './json.ts';
import { resolveDataJsonPath } from './paths.ts';
import { resetAndDeterministicSeedPgTable } from './seedPgTableFromRows.ts';

type MonsterInsert = InferInsertModel<typeof monsters>;

interface MonsterJson {
  actions: string[];
  alignment: string;
  armorClass: number;
  bonusActions: string[];
  challengeRating: string;
  charisma: number;
  charismaSave: number;
  constitution: number;
  constitutionSave: number;
  creatureType: string;
  descriptiveTags: null | string;
  dexterity: number;
  dexteritySave: number;
  experiencePoints: null | number;
  experiencePointsAlt: null | string;
  gear: null | string;
  hitPointDice: string;
  hitPoints: number;
  immunities: string[];
  initiativeModifier: string;
  initiativeScore: number;
  intelligence: number;
  intelligenceSave: number;
  languages: string;
  legendaryActions: string[];
  name: string;
  proficiencyBonus: number;
  reactions: string[];
  resistances: string[];
  senses: string[];
  size: string;
  skills: null | string[];
  speed: string;
  speedBurrow: null | string;
  speedClimb: null | string;
  speedFly: null | string;
  speedSwim: null | string;
  strength: number;
  strengthSave: number;
  traits: string[];
  vulnerabilities: null | string;
  wisdom: number;
  wisdomSave: number;
}

const mapMonsterRow = (row: MonsterJson): MonsterInsert => ({
  actions: row.actions,
  alignment: row.alignment,
  armorClass: row.armorClass,
  bonusActions: row.bonusActions,
  challengeRating: row.challengeRating,
  charisma: row.charisma,
  charismaSave: row.charismaSave,
  constitution: row.constitution,
  constitutionSave: row.constitutionSave,
  creatureType: row.creatureType,
  descriptiveTags: row.descriptiveTags,
  dexterity: row.dexterity,
  dexteritySave: row.dexteritySave,
  experiencePoints: row.experiencePoints,
  experiencePointsAlt: row.experiencePointsAlt,
  gear: row.gear,
  hitPointDice: row.hitPointDice,
  hitPoints: row.hitPoints,
  immunities: row.immunities,
  initiativeModifier: row.initiativeModifier,
  initiativeScore: row.initiativeScore,
  intelligence: row.intelligence,
  intelligenceSave: row.intelligenceSave,
  languages: row.languages,
  legendaryActions: row.legendaryActions,
  name: row.name,
  proficiencyBonus: row.proficiencyBonus,
  reactions: row.reactions,
  resistances: row.resistances,
  senses: row.senses,
  size: row.size,
  skills: row.skills ?? [],
  speed: row.speed,
  speedBurrow: row.speedBurrow,
  speedClimb: row.speedClimb,
  speedFly: row.speedFly,
  speedSwim: row.speedSwim,
  strength: row.strength,
  strengthSave: row.strengthSave,
  traits: row.traits,
  vulnerabilities: row.vulnerabilities,
  wisdom: row.wisdom,
  wisdomSave: row.wisdomSave,
});

export const seedMonsters = async (params: {
  client: ReturnType<typeof createSeedClient>;
  replaceExisting: boolean;
}): Promise<number> => {
  const { client, replaceExisting } = params;
  const path = resolveDataJsonPath('monsters.json');
  const rows = readJsonArray<MonsterJson>(path, 'monsters.json').map(mapMonsterRow);

  if (replaceExisting) {
    await resetAndDeterministicSeedPgTable({
      columnsFalse: [],
      db: client.db,
      refineTableKey: 'monsters',
      rows,
      seedNumber: drizzleSeedForMonsters(),
      table: monsters,
    });
  } else {
    const batches = chunk(rows, 100);
    for (const batch of batches) {
      await client.db.insert(monsters).values(batch);
    }
  }

  return rows.length;
};
