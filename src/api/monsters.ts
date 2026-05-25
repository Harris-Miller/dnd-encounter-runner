import { queryOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

export type MonsterRow = Database['public']['Tables']['monsters']['Row'];

export interface MonsterSummary {
  armorClass: number;
  challengeRating: string;
  creatureType: string;
  hitPoints: number;
  id: string;
  initiativeModifier: string;
  name: string;
  size: string;
}

export interface MonsterDetail extends MonsterSummary {
  actions: string[];
  alignment: string;
  bonusActions: string[];
  charisma: number;
  constitution: number;
  dexterity: number;
  hitPointDice: string;
  immunities: string[];
  intelligence: number;
  languages: string;
  legendaryActions: string[];
  reactions: string[];
  resistances: string[];
  senses: string[];
  skills: string[];
  speed: string;
  strength: number;
  traits: string[];
  vulnerabilities: string | null;
  wisdom: number;
}

const rowToSummary = (row: MonsterRow): MonsterSummary => ({
  armorClass: row.armor_class,
  challengeRating: row.challenge_rating,
  creatureType: row.creature_type,
  hitPoints: row.hit_points,
  id: row.id,
  initiativeModifier: row.initiative_modifier,
  name: row.name,
  size: row.size,
});

const rowToDetail = (row: MonsterRow): MonsterDetail => ({
  ...rowToSummary(row),
  actions: row.actions,
  alignment: row.alignment,
  bonusActions: row.bonus_actions,
  charisma: row.charisma,
  constitution: row.constitution,
  dexterity: row.dexterity,
  hitPointDice: row.hit_point_dice,
  immunities: row.immunities,
  intelligence: row.intelligence,
  languages: row.languages,
  legendaryActions: row.legendary_actions,
  reactions: row.reactions,
  resistances: row.resistances,
  senses: row.senses,
  skills: row.skills,
  speed: row.speed,
  strength: row.strength,
  traits: row.traits,
  vulnerabilities: row.vulnerabilities,
  wisdom: row.wisdom,
});

const PAGE_SIZE = 25;

const searchMonsters = async (search: string): Promise<MonsterSummary[]> => {
  const trimmed = search.trim();
  const query = supabase.from('monsters').select('*').order('name', { ascending: true }).limit(PAGE_SIZE);

  const { data, error } = trimmed === '' ? await query : await query.ilike('name', `%${trimmed}%`);

  if (error != null) {
    throw error;
  }

  return data.map(rowToSummary);
};

const fetchMonster = async (monsterId: string): Promise<MonsterDetail> => {
  const { data, error } = await supabase.from('monsters').select('*').eq('id', monsterId).single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const queryMonstersSearch = (search: string) =>
  queryOptions({
    queryFn: () => searchMonsters(search),
    queryKey: ['monsters', 'search', search] as const,
  });

export const queryMonster = (monsterId: string) =>
  queryOptions({
    queryFn: () => fetchMonster(monsterId),
    queryKey: ['monsters', 'detail', monsterId] as const,
    staleTime: 5 * 60 * 1000,
  });
