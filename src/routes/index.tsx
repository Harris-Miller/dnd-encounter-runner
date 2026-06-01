import { Container, Paper, styled, Typography } from '@mui/material';
import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryUser } from '../api/user';
import dndLogo from '../assets/dnd-logo.svg';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

const Img = styled('img')();

const IndexComponent: FC = () => {
  return (
    <FullScreenCenter>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', gap: 1.5, marginBottom: '24px' }} variant="h3">
            <Img
              alt="D&D Logo"
              src={dndLogo}
              sx={{
                display: 'block',
                flexShrink: 0,
                height: '1.75em',
                width: 'auto',
              }}
            />
            Encounter Runner
          </Typography>
          <RouterLink sx={{ marginBottom: '12px' }} to="/sign-in">
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
    } catch (_e) {
      // TODO: this should _never_ happen. need to display an error page
    }

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
    throw redirect({
      to: '/home',
    });
  },
  component: IndexComponent,
});
