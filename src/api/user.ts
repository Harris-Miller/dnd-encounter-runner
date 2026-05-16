import { queryOptions } from '@tanstack/react-query';

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
});
