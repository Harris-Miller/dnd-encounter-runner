import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { getCachedProfile } from './profile';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

export type CharacterRow = Database['public']['Tables']['characters']['Row'];

export interface Character {
  armorClass: number;
  createdAt: string;
  id: string;
  level: number;
  maxHitPoints: number;
  name: string;
  notes: string | null;
  profileId: string;
  updatedAt: string;
}

const rowToCharacter = (row: CharacterRow): Character => ({
  armorClass: row.armor_class,
  createdAt: row.created_at ?? '',
  id: row.id,
  level: row.level,
  maxHitPoints: row.max_hit_points,
  name: row.name,
  notes: row.notes,
  profileId: row.profile_id,
  updatedAt: row.updated_at ?? '',
});

const fetchCharacters = async (): Promise<Character[]> => {
  const { data, error } = await supabase.from('characters').select('*').order('name', { ascending: true });

  if (error != null) {
    throw error;
  }

  return data.map(rowToCharacter);
};

export const queryCharactersList = queryOptions({
  queryFn: fetchCharacters,
  queryKey: ['characters', 'list'] as const,
});

export interface CreateCharacterInput {
  armorClass: number;
  level?: number;
  maxHitPoints: number;
  name: string;
  notes?: string | null;
}

const createCharacterFn = async (input: CreateCharacterInput): Promise<Character> => {
  const profile = getCachedProfile();

  if (profile == null) {
    throw new Error('No profile loaded; cannot create character');
  }

  const { data, error } = await supabase
    .from('characters')
    .insert({
      armor_class: input.armorClass,
      level: input.level ?? 1,
      max_hit_points: input.maxHitPoints,
      name: input.name,
      notes: input.notes ?? null,
      profile_id: profile.id,
    })
    .select()
    .single();

  if (error != null) {
    throw error;
  }

  return rowToCharacter(data);
};

export const mutateCreateCharacter = mutationOptions({
  mutationFn: createCharacterFn,
  onSuccess: (_created, _variables, _onMutateResult, { client }) => {
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
  },
});

export interface UpdateCharacterInput {
  armorClass?: number;
  id: string;
  level?: number;
  maxHitPoints?: number;
  name?: string;
  notes?: string | null;
}

const updateCharacterFn = async (input: UpdateCharacterInput): Promise<Character> => {
  const { armorClass, id, level, maxHitPoints, name, notes } = input;

  const update: Partial<CharacterRow> = {};

  if (armorClass !== undefined) update.armor_class = armorClass;
  if (level !== undefined) update.level = level;
  if (maxHitPoints !== undefined) update.max_hit_points = maxHitPoints;
  if (name !== undefined) update.name = name;
  if (notes !== undefined) update.notes = notes;

  const { data, error } = await supabase.from('characters').update(update).eq('id', id).select().single();

  if (error != null) {
    throw error;
  }

  return rowToCharacter(data);
};

export const mutateUpdateCharacter = mutationOptions({
  mutationFn: updateCharacterFn,
  onSuccess: (_updated, _variables, _onMutateResult, { client }) => {
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
  },
});

const deleteCharacterFn = async (characterId: string): Promise<{ id: string }> => {
  const { error } = await supabase.from('characters').delete().eq('id', characterId);

  if (error != null) {
    throw error;
  }

  return { id: characterId };
};

export const mutateDeleteCharacter = mutationOptions({
  mutationFn: deleteCharacterFn,
  onSuccess: (_deleted, _variables, _onMutateResult, { client }) => {
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
  },
});
