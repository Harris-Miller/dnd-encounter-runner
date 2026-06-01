import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryUser } from '../api/user';
import dndLogo from '../assets/dnd-logo.svg';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { Container } from '../components/ui/Container';
import { Paper } from '../components/ui/Paper';
import { Typography } from '../components/ui/Typography';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

const IndexComponent: FC = () => {
  return (
    <FullScreenCenter>
      <Container maxWidth="md">
        <Paper elevation={6} style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: 24 }}>
          <Typography style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 24 }} variant="h3">
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
          </Typography>
          <RouterLink style={{ marginBottom: 12 }} to="/sign-in">
            Login
          </RouterLink>
        </Paper>
      </Container>
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
