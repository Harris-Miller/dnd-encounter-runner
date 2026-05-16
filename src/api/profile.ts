import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { hasProfileName } from '../routing/profileName';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

export type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'avatar_url' | 'id' | 'name' | 'user_id'>;

export type UpdateProfileInput = {
  avatarUrl: string;
  name: string;
};

export { hasProfileName } from '../routing/profileName';

const fetchProfileForCurrentUser = async (): Promise<Profile> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError != null) {
    throw userError;
  }

  if (user == null) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, user_id')
    .eq('user_id', user.id)
    .single();

  if (error != null) {
    throw error;
  }

  return data;
};

const updateProfileFn = async ({ avatarUrl, name }: UpdateProfileInput): Promise<Profile> => {
  const trimmedName = name.trim();

  if (!hasProfileName(trimmedName)) {
    throw new Error('Profile name cannot be empty');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError != null) {
    throw userError;
  }

  if (user == null) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, name: trimmedName })
    .eq('user_id', user.id)
    .select('id, name, avatar_url, user_id')
    .single();

  if (error != null) {
    throw error;
  }

  return data;
};

export const queryProfile = queryOptions({
  queryFn: fetchProfileForCurrentUser,
  queryKey: ['profile'],
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  staleTime: Infinity,
});

export const mutateUpdateProfile = mutationOptions({
  mutationFn: updateProfileFn,
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryProfile.queryKey, updatedProfile);
  },
});

export const clearProfileQuery = (client: QueryClient): void => {
  client.removeQueries({ queryKey: queryProfile.queryKey });
};
