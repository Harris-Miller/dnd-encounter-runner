import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

import { getCachedUserProfile } from './userProfile';

export type CharacterRow = Database['public']['Tables']['characters']['Row'];

export interface Character {
  armorClass: number;
  campaignId: null | string;
  createdAt: string;
  id: string;
  level: number;
  maxHitPoints: number;
  name: string;
  notes: null | string;
  profileId: string;
  updatedAt: string;
}

export const rowToCharacter = (row: CharacterRow): Character => ({
  armorClass: row.armor_class,
  campaignId: row.campaign_id,
  createdAt: row.created_at,
  id: row.id,
  level: row.level,
  maxHitPoints: row.max_hit_points,
  name: row.name,
  notes: row.notes,
  profileId: row.profile_id,
  updatedAt: row.updated_at,
});

export const queryCharactersList = queryOptions({
  queryFn: async (): Promise<Character[]> => {
    const { data, error } = await supabase.from('characters').select('*').order('name', { ascending: true });

    if (error != null) {
      throw error;
    }

    return data.map(rowToCharacter);
  },
  queryKey: ['characters', 'list'] as const,
});

export const queryCharacter = (characterId: string) =>
  queryOptions({
    queryFn: async (): Promise<Character> => {
      const { data, error } = await supabase.from('characters').select('*').eq('id', characterId).single();

      if (error != null) {
        throw error;
      }

      return rowToCharacter(data);
    },
    queryKey: ['characters', 'detail', characterId] as const,
  });

export interface CreateCharacterInput {
  armorClass: number;
  level?: number;
  maxHitPoints: number;
  name: string;
  notes?: null | string;
}

export const mutateCreateCharacter = mutationOptions({
  mutationFn: async (input: CreateCharacterInput): Promise<Character> => {
    const userProfile = getCachedUserProfile();

    if (userProfile == null) {
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
        profile_id: userProfile.id,
      })
      .select()
      .single();

    if (error != null) {
      throw error;
    }

    return rowToCharacter(data);
  },
  onSuccess: (created, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryCharacter(created.id).queryKey, created);
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
  },
});

export interface UpdateCharacterInput {
  armorClass?: number;
  id: string;
  level?: number;
  maxHitPoints?: number;
  name?: string;
  notes?: null | string;
}

export const mutateUpdateCharacter = mutationOptions({
  mutationFn: async (input: UpdateCharacterInput): Promise<Character> => {
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
  },
  onSuccess: (updated, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryCharacter(updated.id).queryKey, updated);
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
  },
});

export const mutateDeleteCharacter = mutationOptions({
  mutationFn: async (characterId: string): Promise<{ id: string }> => {
    const { error } = await supabase.from('characters').delete().eq('id', characterId);

    if (error != null) {
      throw error;
    }

    return { id: characterId };
  },
  onSuccess: ({ id }, _variables, _onMutateResult, { client }) => {
    client.removeQueries({ queryKey: queryCharacter(id).queryKey });
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
  },
});
