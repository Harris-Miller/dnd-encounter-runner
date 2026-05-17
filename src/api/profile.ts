import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { hasProfileName } from '../routing/profileName';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

import { getCachedUser } from './user';

export type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'avatar_source' | 'id' | 'name' | 'uploaded_avatar_id' | 'user_id'
>;

export type ProfileAvatarSource = Profile['avatar_source'];

export type UpdateProfileNameInput = {
  name: string;
};

export type UpdateProfileAvatarSourceInput = {
  avatarSource: ProfileAvatarSource;
};

export type UpdateProfileAfterUploadInput = {
  avatarSource: 'uploaded';
  uploadedAvatarId: string;
};

export { hasProfileName } from '../routing/profileName';

const fetchProfileForCurrentUser = async (): Promise<Profile> => {
  const user = getCachedUser();

  if (user == null) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.from('profiles').select().eq('user_id', user.id).single();

  if (error != null) {
    throw error;
  }

  return data;
};

const updateProfileNameFn = async ({ name }: UpdateProfileNameInput): Promise<Profile> => {
  const trimmedName = name.trim();

  if (!hasProfileName(trimmedName)) {
    throw new Error('Profile name cannot be empty');
  }

  const user = getCachedUser();

  if (user == null) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.from('profiles').update({ name: trimmedName }).eq('user_id', user.id).single();

  if (error != null) {
    throw error;
  }

  return data;
};

const updateProfileAvatarSourceFn = async ({ avatarSource }: UpdateProfileAvatarSourceInput): Promise<Profile> => {
  const user = getCachedUser();

  if (user == null) {
    throw new Error('Not authenticated');
  }

  if (avatarSource === 'uploaded') {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('uploaded_avatar_id')
      .eq('user_id', user.id)
      .single();

    if (fetchError != null) {
      throw fetchError;
    }

    if (existingProfile.uploaded_avatar_id == null) {
      throw new Error('Cannot use uploaded avatar before uploading an image');
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_source: avatarSource })
    .eq('user_id', user.id)
    .single();

  if (error != null) {
    throw error;
  }

  return data;
};

const updateProfileAfterUploadFn = async ({
  avatarSource,
  uploadedAvatarId,
}: UpdateProfileAfterUploadInput): Promise<Profile> => {
  const user = getCachedUser();

  if (user == null) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_source: avatarSource, uploaded_avatar_id: uploadedAvatarId })
    .eq('user_id', user.id)
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
  mutationFn: updateProfileNameFn,
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryProfile.queryKey, updatedProfile);
  },
});

export const mutateUpdateProfileAvatarSource = mutationOptions({
  mutationFn: updateProfileAvatarSourceFn,
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryProfile.queryKey, updatedProfile);
  },
});

export const mutateUpdateProfileAfterUpload = mutationOptions({
  mutationFn: updateProfileAfterUploadFn,
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryProfile.queryKey, updatedProfile);
  },
});

export const clearProfileQuery = (client: QueryClient): void => {
  client.removeQueries({ queryKey: queryProfile.queryKey });
};
