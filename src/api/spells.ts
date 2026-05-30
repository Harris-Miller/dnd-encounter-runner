import { queryOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

export type SpellRow = Database['public']['Tables']['spells']['Row'];

export interface SpellSummary {
  id: string;
  isConcentration: boolean;
  isRitual: boolean;
  level: number;
  name: string;
  school: string;
}

export interface SpellDetail extends SpellSummary {
  castingTime: string;
  description: null | string;
  duration: string;
  isMaterial: boolean;
  isSomatic: boolean;
  isVerbal: boolean;
  materialDescription: null | string;
  range: string;
  upcastDescription: null | string;
}

const rowToSummary = (row: SpellRow): SpellSummary => ({
  id: row.id,
  isConcentration: row.is_concentration,
  isRitual: row.is_ritual,
  level: row.level,
  name: row.name,
  school: row.school,
});

const rowToDetail = (row: SpellRow): SpellDetail => ({
  ...rowToSummary(row),
  castingTime: row.casting_time,
  description: row.description,
  duration: row.duration,
  isMaterial: row.is_material,
  isSomatic: row.is_somatic,
  isVerbal: row.is_verbal,
  materialDescription: row.material_description,
  range: row.range,
  upcastDescription: row.upcast_description,
});

const PAGE_SIZE = 25;

const searchSpells = async (search: string): Promise<SpellSummary[]> => {
  const trimmed = search.trim();
  const query = supabase
    .from('spells')
    .select('*')
    .order('level', { ascending: true })
    .order('name', { ascending: true })
    .limit(PAGE_SIZE);

  const { data, error } = trimmed === '' ? await query : await query.ilike('name', `%${trimmed}%`);

  if (error != null) {
    throw error;
  }

  return data.map(rowToSummary);
};

const fetchSpell = async (spellId: string): Promise<SpellDetail> => {
  const { data, error } = await supabase.from('spells').select('*').eq('id', spellId).single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const querySpellsSearch = (search: string) =>
  queryOptions({
    queryFn: () => searchSpells(search),
    queryKey: ['spells', 'search', search] as const,
  });

export const querySpell = (spellId: string) =>
  queryOptions({
    queryFn: () => fetchSpell(spellId),
    queryKey: ['spells', 'detail', spellId] as const,
    staleTime: 5 * 60 * 1000,
  });
