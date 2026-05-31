import type { Provider, Session, User } from '@supabase/supabase-js';
import { mutationOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';

export type SignInWithPasswordInput = {
  email: string;
  password: string;
};

export type SignUpWithPasswordInput = {
  displayName: string;
  email: string;
  password: string;
};

export type SignInWithOAuthInput = {
  provider: Provider;
  redirectTo: string;
};

export const mutateSignInWithPassword = mutationOptions({
  mutationFn: async ({ email, password }: SignInWithPasswordInput): Promise<Session> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error != null) {
      throw error;
    }

    return data.session;
  },
});

export const mutateSignUpWithPassword = mutationOptions({
  mutationFn: async ({ displayName, email, password }: SignUpWithPasswordInput): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({ email, options: { data: { name: displayName } }, password });

    if (error != null) {
      throw error;
    }

    if (data.user == null) {
      throw new Error('Sign up did not return a user');
    }

    return data.user;
  },
});

export const mutateSignInWithOAuth = mutationOptions({
  mutationFn: async ({ provider, redirectTo }: SignInWithOAuthInput): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      options: { redirectTo },
      provider,
    });

    if (error != null) {
      throw error;
    }
  },
});
