import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { supabase } from '../services/supabase';

export const Route = createFileRoute('/home')({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session != null) {
      return;
    }

    const redirectPath = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
    throw redirect({
      search: { redirect: redirectPath },
      to: '/login',
    });
  },
  component: () => <Outlet />,
});
