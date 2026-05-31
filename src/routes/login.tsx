import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Container, Divider, Paper, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateSignInWithOAuth, mutateSignInWithPassword } from '../api/auth';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';

const LoginComponent: FC = () => {
  const searchParams = useSearch({ from: '/login' });
  const redirectParam = (searchParams as { redirect?: string }).redirect ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const oauthMutation = useMutation(mutateSignInWithOAuth);

  const passwordMutation = useMutation({
    ...mutateSignInWithPassword,
    onSuccess: () => {
      window.location.assign(`${window.location.origin}${decodeURIComponent(redirectParam)}`);
    },
  });

  const handleGoogleOAuth = () => {
    oauthMutation.mutate({
      provider: 'google',
      redirectTo: `${window.location.origin}${decodeURIComponent(redirectParam)}`,
    });
  };

  const isPasswordSubmitDisabled = email.trim() === '' || password === '' || passwordMutation.isPending;

  const handlePasswordSignIn = () => {
    if (isPasswordSubmitDisabled) {
      return;
    }

    passwordMutation.mutate({ email: email.trim(), password });
  };

  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h3">
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
          <Divider sx={{ marginY: '16px', width: '100%' }}>or</Divider>
          {passwordMutation.isError ? (
            <Typography color="error" sx={{ marginBottom: '16px' }}>
              {passwordMutation.error.message}
            </Typography>
          ) : null}
          <Box
            component="form"
            onSubmit={event => {
              event.preventDefault();
              handlePasswordSignIn();
            }}
            sx={{ width: '100%' }}
          >
            <TextField
              autoComplete="email"
              fullWidth
              label="Email"
              margin="dense"
              onChange={event => {
                setEmail(event.target.value);
              }}
              type="email"
              value={email}
              variant="standard"
            />
            <TextField
              autoComplete="current-password"
              fullWidth
              label="Password"
              margin="dense"
              onChange={event => {
                setPassword(event.target.value);
              }}
              sx={{ marginBottom: '16px' }}
              type="password"
              value={password}
              variant="standard"
            />
            <Button disabled={isPasswordSubmitDisabled} fullWidth type="submit" variant="contained">
              Sign In
            </Button>
          </Box>
          <Typography sx={{ marginTop: '16px' }} variant="body2">
            Don&apos;t have an account? <RouterLink to="/sign-up">Sign up</RouterLink>
          </Typography>
        </Paper>
      </Container>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});
