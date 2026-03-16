import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, Container, Paper, Typography } from '@mui/material';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';

import { FullScreenCenter } from '../components/FullScreenCenter';
import { supabase } from '../services/supabase';

const LoginComponent: FC = () => {
  const searchParams = useSearch({ from: '/login' });
  const redirectParam = (searchParams as Record<string, string | undefined>).redirect ?? '/';

  const handleGoogleOAuth = async () => {
    await supabase.auth.signInWithOAuth({
      options: {
        redirectTo: `${window.location.origin}${decodeURIComponent(redirectParam)}`,
      },
      provider: 'google',
    });
  };

  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h3">
            {/* <Img alt="D&D Logo" src={dndLogo} sx={{ color: 'red', height: '1.5em', marginX: '12px', width: '1.5em' }} />{' '} */}
            DnD Encounter Runner
          </Typography>
          <Typography sx={{ marginBottom: '24px' }} variant="h5">
            Sign In
          </Typography>
          <Button
            onClick={handleGoogleOAuth}
            startIcon={<GoogleIcon />}
            sx={{ marginBottom: '12px', width: '100%' }}
            variant="outlined"
          >
            Google
          </Button>
          <Button
            startIcon={<FacebookIcon />}
            sx={{ '&:hover': { cursor: 'not-allowed' }, marginBottom: '12px', width: '100%' }}
            variant="outlined"
          >
            Facebook
          </Button>
        </Paper>
      </Container>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});
