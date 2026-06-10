import { mutationOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';
import { hasProfileName } from '../utils/profileName';

import { getCachedUserProfile, queryUserProfile } from './userProfile';
import type { UserProfile } from './userProfile';

export type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'avatar_source' | 'gravatar_id' | 'id' | 'name' | 'uploaded_avatar_id'
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

export type UpdateProfileGravatarIdInput = {
  gravatarId: string;
};

const mergeUpdatedProfileIntoUserProfile = (
  previousUserProfile: undefined | UserProfile,
  updatedProfile: Profile,
): undefined | UserProfile =>
  previousUserProfile == null ? previousUserProfile : { ...previousUserProfile, ...updatedProfile };

export const mutateUpdateProfile = mutationOptions({
  mutationFn: async ({ name }: UpdateProfileNameInput): Promise<Profile> => {
    const trimmedName = name.trim();

    if (!hasProfileName(trimmedName)) {
      throw new Error('Profile name cannot be empty');
    }

    const userProfile = getCachedUserProfile();

    if (userProfile == null) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ name: trimmedName })
      .eq('id', userProfile.id)
      .select()
      .single();

    if (error != null) {
      throw error;
    }

    return data;
  },
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryUserProfile.queryKey, previousUserProfile =>
      mergeUpdatedProfileIntoUserProfile(previousUserProfile, updatedProfile),
    );
  },
});

export const mutateUpdateProfileAvatarSource = mutationOptions({
  mutationFn: async ({ avatarSource }: UpdateProfileAvatarSourceInput): Promise<Profile> => {
    const userProfile = getCachedUserProfile();

    if (userProfile == null) {
      throw new Error('Not authenticated');
    }

    if (avatarSource === 'uploaded') {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('uploaded_avatar_id')
        .eq('id', userProfile.id)
        .select()
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
      .eq('id', userProfile.id)
      .select()
      .single();

    if (error != null) {
      throw error;
    }

    return data;
  },
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryUserProfile.queryKey, previousUserProfile =>
      mergeUpdatedProfileIntoUserProfile(previousUserProfile, updatedProfile),
    );
  },
});

export const mutateUpdateProfileAfterUpload = mutationOptions({
  mutationFn: async ({ avatarSource, uploadedAvatarId }: UpdateProfileAfterUploadInput): Promise<Profile> => {
    const userProfile = getCachedUserProfile();

    if (userProfile == null) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_source: avatarSource, uploaded_avatar_id: uploadedAvatarId })
      .eq('id', userProfile.id)
      .select()
      .single();

    if (error != null) {
      throw error;
    }

    return data;
  },
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryUserProfile.queryKey, previousUserProfile =>
      mergeUpdatedProfileIntoUserProfile(previousUserProfile, updatedProfile),
    );
  },
});

export const mutateUpdateProfileGravatarId = mutationOptions({
  mutationFn: async ({ gravatarId }: UpdateProfileGravatarIdInput): Promise<Profile> => {
    const trimmedGravatarId = gravatarId.trim();

    if (trimmedGravatarId.length !== 64) {
      throw new Error('Gravatar ID must be 64 characters');
    }

    const userProfile = getCachedUserProfile();

    if (userProfile == null) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ gravatar_id: trimmedGravatarId })
      .eq('id', userProfile.id)
      .select()
      .single();

    if (error != null) {
      throw error;
    }

    return data;
  },
  onSuccess: (updatedProfile, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryUserProfile.queryKey, previousUserProfile =>
      mergeUpdatedProfileIntoUserProfile(previousUserProfile, updatedProfile),
    );
  },
});
