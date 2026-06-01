import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryUser } from '../api/user';
import dndLogo from '../assets/dnd-logo.svg';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

const IndexComponent: FC = () => {
  return (
    <FullScreenCenter>
      <div className="auth-container" style={{ maxWidth: '48rem' }}>
        <div className="auth-paper">
          <h1 style={{ alignItems: 'center', display: 'flex', fontSize: '1.75rem', gap: 12, margin: '0 0 1.5rem' }}>
            <img
              alt="D&D Logo"
              src={dndLogo}
              style={{
                display: 'block',
                flexShrink: 0,
                height: '1.75em',
                width: 'auto',
              }}
            />
            Encounter Runner
          </h1>
          <RouterLink style={{ marginBottom: 12 }} to="/sign-in">
            Login
          </RouterLink>
        </div>
      </div>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session == null) {
      return;
    }

    try {
      await queryClient.prefetchQuery(queryUser);
    } catch {
      // TODO: this should _never_ happen. need to display an error page
    }

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
    throw redirect({
      to: '/home',
    });
  },
  component: IndexComponent,
});
