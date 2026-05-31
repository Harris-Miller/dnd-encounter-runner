import type { User } from '@supabase/supabase-js';
import { queryOptions } from '@tanstack/react-query';

import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

export const queryUser = queryOptions({
  queryFn: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error != null) {
      throw error;
    }
    return data.user;
  },
  queryKey: ['user'],
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

export const getCachedUser = () => queryClient.getQueryCache().find<unknown, Error, User>(queryUser)?.state.data;
