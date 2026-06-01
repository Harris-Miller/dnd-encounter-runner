import type { Provider } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC, SVGProps } from 'react';

import { mutateSignInWithOAuth, mutateSignInWithPassword } from '../api/auth';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Divider } from '../components/ui/Divider';
import { Paper } from '../components/ui/Paper';
import { TextField } from '../components/ui/TextField';
import { Typography } from '../components/ui/Typography';
import { basepath } from '../router';

const GoogleIcon: FC<SVGProps<SVGSVGElement>> = props => (
  <svg height={20} viewBox="0 0 24 24" width={20} {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const DiscordIcon: FC<SVGProps<SVGSVGElement>> = props => (
  <svg height={20} viewBox="0 0 127.14 96.36" width={20} {...props}>
    <path
      d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c1-.73,2-1.51,3-2.31a74.12,74.12,0,0,0,91.59,0c1,.8,2,1.58,3,2.31a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,48.12,123.7,25.33,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"
      fill="currentColor"
    />
  </svg>
);

const FacebookIcon: FC<SVGProps<SVGSVGElement>> = props => (
  <svg fill="currentColor" height={20} viewBox="0 0 24 24" width={20} {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

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
        <Paper elevation={6} style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: 24 }}>
          <Typography style={{ marginBottom: 24 }} variant="h3">
            DnD Encounter Runner
          </Typography>
          <Typography style={{ marginBottom: 24 }} variant="h5">
            Sign In
          </Typography>
          <Button
            fullWidth
            onClick={() => {
              handleOAuthSignIn('google');
            }}
            startIcon={<GoogleIcon />}
            style={{ marginBottom: 12 }}
            variant="outlined"
          >
            Google
          </Button>
          <Button
            fullWidth
            onClick={() => {
              handleOAuthSignIn('discord');
            }}
            startIcon={<DiscordIcon />}
            style={{ marginBottom: 12 }}
            variant="outlined"
          >
            Discord
          </Button>
          <Button
            fullWidth
            startIcon={<FacebookIcon />}
            style={{ cursor: 'not-allowed', marginBottom: 12 }}
            variant="outlined"
          >
            Facebook
          </Button>
          <Divider style={{ margin: '16px 0', width: '100%' }}>or</Divider>
          {passwordMutation.isError ? (
            <Typography color="error" style={{ marginBottom: 16 }}>
              {passwordMutation.error.message}
            </Typography>
          ) : null}
          <form
            onSubmit={event => {
              event.preventDefault();
              handlePasswordSignIn();
            }}
            style={{ width: '100%' }}
          >
            <TextField
              autoComplete="email"
              fullWidth
              label="Email"
              onChange={event => {
                setEmail(event.target.value);
              }}
              type="email"
              value={email}
            />
            <TextField
              autoComplete="current-password"
              fullWidth
              label="Password"
              onChange={event => {
                setPassword(event.target.value);
              }}
              style={{ marginBottom: 16, marginTop: 8 }}
              type="password"
              value={password}
            />
            <Button disabled={isPasswordSubmitDisabled} fullWidth type="submit" variant="contained">
              Sign In
            </Button>
          </form>
          <Typography style={{ marginTop: 16 }} variant="body2">
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
