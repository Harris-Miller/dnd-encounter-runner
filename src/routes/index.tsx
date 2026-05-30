import { Container, Paper, Typography } from '@mui/material';
import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';

// import dndLogo from '../assets/dnd-logo.svg';
import { hasProfileName, queryProfile } from '../api/profile';
import { queryUser } from '../api/user';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { queryClient } from '../queryClient';
import { supabase } from '../services/supabase';

const IndexComponent: FC = () => {
  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h3">
            {/* <Img alt="D&D Logo" src={dndLogo} sx={{ color: 'red', height: '1.5em', marginX: '12px', width: '1.5em' }} />{' '} */}
            DnD Encounter Runner
          </Typography>
          <RouterLink sx={{ marginBottom: '12px' }} to="/login">
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
      // do nothing, this is expected if the user is not authenticated
    }

    const profile = await queryClient.fetchQuery(queryProfile);

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
    throw redirect({
      to: hasProfileName(profile.name) ? '/home' : '/createProfile',
    });
  },
  component: IndexComponent,
});
