import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { queryUser } from '../api/user';
import { supabase } from '../services/supabase';

export const useOptionalUser = (): undefined | User => {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(data.session != null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(session != null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const userQuery = useQuery({
    ...queryUser,
    enabled: hasSession === true,
  });

  if (hasSession !== true || !userQuery.isSuccess) {
    return undefined;
  }

  return userQuery.data;
};
