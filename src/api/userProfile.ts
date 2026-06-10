import type { User } from '@supabase/supabase-js';
import { queryOptions } from '@tanstack/react-query';

import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

import type { Profile } from './profile';

export interface UserProfile extends Profile, User {}

export const queryUserProfile = queryOptions({
  queryFn: async (): Promise<UserProfile> => {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError != null) {
      throw authError;
    }

    const { user } = authData;

    const { data: profile, error: profileError } = await supabase.from('profiles').select().eq('id', user.id).single();

    if (profileError != null) {
      throw profileError;
    }

    return { ...user, ...profile };
  },
  queryKey: ['userProfile'],
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: false,
});

export const getCachedUserProfile = (): null | UserProfile =>
  queryClient.getQueryCache().find<unknown, Error, UserProfile>(queryUserProfile)?.state.data ?? null;
