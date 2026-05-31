import type { Session } from '@supabase/supabase-js';
import { redirect } from '@tanstack/react-router';

import { supabase } from '../services/supabase';

export const redirectToLogin = (): never => {
  const redirectPath = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);

  // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
  throw redirect({
    search: { redirect: redirectPath },
    to: '/login',
  });
};

export const requireSession = async (): Promise<Session> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session == null) {
    return redirectToLogin();
  }

  return session;
};
