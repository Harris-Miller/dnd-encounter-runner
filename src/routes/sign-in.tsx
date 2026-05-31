import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Container, Divider, Paper, TextField, Typography } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';
import type { Provider } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import type { ComponentProps, FC } from 'react';

import { mutateSignInWithOAuth, mutateSignInWithPassword } from '../api/auth';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { basepath } from '../router';

const DiscordIcon: FC<ComponentProps<typeof SvgIcon>> = props => {
  return (
    <SvgIcon {...props} viewBox="0 0 127.14 96.36">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c1-.73,2-1.51,3-2.31a74.12,74.12,0,0,0,91.59,0c1,.8,2,1.58,3,2.31a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,48.12,123.7,25.33,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
    </SvgIcon>
  );
};

const SignInComponent: FC = () => {
  const searchParams = useSearch({ from: '/sign-in' });
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

  const handleOAuthSignIn = (provider: Provider) => {
    oauthMutation.mutate({
      provider,
      redirectTo: `${window.location.origin}${basepath}${decodeURIComponent(redirectParam)}`,
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
            onClick={() => {
              handleOAuthSignIn('google');
            }}
            startIcon={<GoogleIcon />}
            sx={{ marginBottom: '12px', width: '100%' }}
            variant="outlined"
          >
            Google
          </Button>
          <Button
            onClick={() => {
              handleOAuthSignIn('discord');
            }}
            startIcon={<DiscordIcon />}
            sx={{ marginBottom: '12px', width: '100%' }}
            variant="outlined"
          >
            Discord
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

export const Route = createFileRoute('/sign-in')({
  component: SignInComponent,
});
