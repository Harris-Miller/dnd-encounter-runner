import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

import type { Character } from './characters';
import { queryCharactersList, rowToCharacter } from './characters';

type CharacterWithCampaignRow = {
  campaigns: null | Pick<Database['public']['Tables']['campaigns']['Row'], 'id' | 'name'>;
} & Database['public']['Tables']['characters']['Row'];

export interface InviteCampaign {
  id: string;
  name: string;
}

export interface CharacterWithCampaignName extends Character {
  campaignName: null | string;
}

const rowToCharacterWithCampaign = (row: CharacterWithCampaignRow): CharacterWithCampaignName => ({
  ...rowToCharacter(row),
  campaignName: row.campaigns?.name ?? null,
});

export const queryInviteCampaign = (inviteId: string) =>
  queryOptions({
    queryFn: async (): Promise<InviteCampaign | null> => {
      const { data, error } = await supabase.rpc('get_campaign_by_invite', { p_invite_id: inviteId });

      if (error != null) {
        throw error;
      }

      const campaign = data.at(0);

      if (campaign == null) {
        return null;
      }

      return { id: campaign.id, name: campaign.name };
    },
    queryKey: ['invites', inviteId, 'campaign'] as const,
  });

export const queryMyCharactersWithCampaign = queryOptions({
  queryFn: async (): Promise<CharacterWithCampaignName[]> => {
    const { data, error } = await supabase
      .from('characters')
      .select('*, campaigns(id, name)')
      .order('name', { ascending: true });

    if (error != null) {
      throw error;
    }

    return data.map(rowToCharacterWithCampaign);
  },
  queryKey: ['characters', 'list-with-campaign'] as const,
});

export interface JoinCampaignViaInviteInput {
  characterId: string;
  inviteId: string;
}

export const mutateJoinCampaignViaInvite = mutationOptions({
  mutationFn: async ({ characterId, inviteId }: JoinCampaignViaInviteInput): Promise<{ campaignId: string }> => {
    const { data, error } = await supabase.rpc('join_campaign_via_invite', {
      p_character_id: characterId,
      p_invite_id: inviteId,
    });

    if (error != null) {
      throw error;
    }

    return { campaignId: data };
  },
  onSuccess: (_result, _variables, _onMutateResult, { client }) => {
    client.invalidateQueries({ queryKey: queryCharactersList.queryKey });
    client.invalidateQueries({ queryKey: queryMyCharactersWithCampaign.queryKey });
    client.invalidateQueries({ queryKey: ['campaigns'] });
    client.invalidateQueries({ queryKey: ['characters'] });
  },
});
