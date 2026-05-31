import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

import { rowToCharacter } from './characters';
import type { Character } from './characters';
import { getCachedProfile } from './profile';

type CampaignRow = Database['public']['Tables']['campaigns']['Row'];

export interface Campaign {
  createdAt: string;
  id: string;
  name: string;
  profileId: string;
  updatedAt: string;
}

export type CampaignListItem = Campaign;

const rowToCampaign = (row: CampaignRow): Campaign => ({
  createdAt: row.created_at,
  id: row.id,
  name: row.name,
  profileId: row.profile_id,
  updatedAt: row.updated_at,
});

export const queryCampaignsList = queryOptions({
  queryFn: async (): Promise<CampaignListItem[]> => {
    const { data, error } = await supabase.from('campaigns').select('*').order('updated_at', { ascending: false });

    if (error != null) {
      throw error;
    }

    return data.map(rowToCampaign);
  },
  queryKey: ['campaigns', 'list'] as const,
});

export const queryCampaign = (campaignId: string) =>
  queryOptions({
    queryFn: async (): Promise<Campaign> => {
      const { data, error } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();

      if (error != null) {
        throw error;
      }

      return rowToCampaign(data);
    },
    queryKey: ['campaigns', 'detail', campaignId] as const,
  });

export const queryCampaignCharacters = (campaignId: string) =>
  queryOptions({
    queryFn: async (): Promise<Character[]> => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('name', { ascending: true });

      if (error != null) {
        throw error;
      }

      return data.map(rowToCharacter);
    },
    queryKey: ['campaigns', campaignId, 'characters'] as const,
  });

export interface CreateCampaignInput {
  name?: string;
}

export const mutateCreateCampaign = mutationOptions({
  mutationFn: async ({ name = 'Untitled Campaign' }: CreateCampaignInput = {}): Promise<Campaign> => {
    const profile = getCachedProfile();

    if (profile == null) {
      throw new Error('No profile loaded; cannot create campaign');
    }

    const { data, error } = await supabase.from('campaigns').insert({ name, profile_id: profile.id }).select().single();

    if (error != null) {
      throw error;
    }

    return rowToCampaign(data);
  },
  mutationKey: ['campaigns', 'create'],
  onSuccess: (created, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryCampaign(created.id).queryKey, created);
    client.invalidateQueries({ queryKey: queryCampaignsList.queryKey });
  },
});

export interface UpdateCampaignInput {
  id: string;
  name?: string;
}

export const mutateUpdateCampaign = mutationOptions({
  mutationFn: async ({ id, name }: UpdateCampaignInput): Promise<Campaign> => {
    if (name === undefined) {
      throw new Error('UpdateCampaignInput requires at least one field to update');
    }

    const { data, error } = await supabase.from('campaigns').update({ name }).eq('id', id).select().single();

    if (error != null) {
      throw error;
    }

    return rowToCampaign(data);
  },
  onSuccess: (updated, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryCampaign(updated.id).queryKey, updated);
    client.invalidateQueries({ queryKey: queryCampaignsList.queryKey });
  },
});

export const mutateDeleteCampaign = mutationOptions({
  mutationFn: async (campaignId: string): Promise<{ id: string }> => {
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);

    if (error != null) {
      throw error;
    }

    return { id: campaignId };
  },
  mutationKey: ['campaigns', 'delete'],
  onSuccess: ({ id }, _variables, _onMutateResult, { client }) => {
    client.removeQueries({ queryKey: queryCampaign(id).queryKey });
    client.removeQueries({ queryKey: ['campaigns', id, 'characters'] });
    client.invalidateQueries({ queryKey: queryCampaignsList.queryKey });
    client.invalidateQueries({ queryKey: ['encounters', 'list'] });
    client.invalidateQueries({ queryKey: ['characters', 'list'] });
  },
});

export interface RemoveCharacterFromCampaignInput {
  campaignId: string;
  characterId: string;
}

export const mutateRemoveCharacterFromCampaign = mutationOptions({
  mutationFn: async ({ characterId }: RemoveCharacterFromCampaignInput): Promise<{ id: string }> => {
    const { data, error } = await supabase
      .from('characters')
      .update({ campaign_id: null })
      .eq('id', characterId)
      .select()
      .single();

    if (error != null) {
      throw error;
    }

    return { id: data.id };
  },
  onSuccess: (_result, { campaignId, characterId }, _onMutateResult, { client }) => {
    client.invalidateQueries({ queryKey: queryCampaignCharacters(campaignId).queryKey });
    client.invalidateQueries({ queryKey: ['characters', 'detail', characterId] });
    client.invalidateQueries({ queryKey: ['characters', 'list'] });
  },
});
