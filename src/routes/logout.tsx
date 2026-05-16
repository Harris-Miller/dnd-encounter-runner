import { createFileRoute, redirect } from '@tanstack/react-router';

import { clearProfileQuery } from '../api/profile';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

export const Route = createFileRoute('/logout')({
  // Set component to null or a simple fragment to ensure nothing is rendered while the redirect happens
  component: () => null,

  loader: async () => {
    // Perform the Supabase sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      // Handle error as needed, e.g., show a notification or redirect to an error page
    }

    clearProfileQuery(queryClient);

    // Throw a redirect to the home page ("/") immediately after the action
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/' });
  },
});
