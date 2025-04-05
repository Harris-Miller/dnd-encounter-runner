import { indexBy } from 'ramda';

import type { APIReference, Choice } from './common.types';
import racesRaw from './json/5e-SRD-Races.json';

export type RaceAbilityBonus = {
  ability_score: APIReference;
  bonus: number;
};

export type Race = {
  ability_bonus_options?: Choice;
  ability_bonuses: RaceAbilityBonus[];
  age: string;
  alignment: string;
  index: string;
  language_desc: string;
  language_options: Choice;
  languages: APIReference[];
  name: string;
  size: string;
  size_description: string;
  speed: number;
  starting_proficiencies?: APIReference[];
  starting_proficiency_options?: Choice;
  subraces?: APIReference[];
  traits?: APIReference[];
  url: string;
};

export const races = racesRaw as unknown as Race[];
export const raceByIndex = indexBy(r => r.index, races);
