import type { Session } from '@supabase/supabase-js';
import { redirect } from '@tanstack/react-router';
import { t } from 'try';

import type { Profile } from '../api/profile';
import { queryProfile } from '../api/profile';
import { queryUser } from '../api/user';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

import { hasProfileName } from './profileName';

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

export const requireProfileName = async (): Promise<Profile> => {
  await requireSession();

  const userResult = await t(queryClient.prefetchQuery(queryUser));

  if (!userResult.ok) {
    return redirectToLogin();
  }

  const profile = await queryClient.fetchQuery(queryProfile);

  if (!hasProfileName(profile.name)) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
    throw redirect({ to: '/createProfile' });
  }

  return profile;
};
