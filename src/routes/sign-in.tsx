import { Button, Callout, Card, Flex, Heading, Separator, Text, TextField } from '@radix-ui/themes';
import type { Provider } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateSignInWithOAuth, mutateSignInWithPassword } from '../api/auth';
import discordIcon from '../assets/discord.svg';
import facebookIcon from '../assets/facebook.svg';
import googleIcon from '../assets/google.svg';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';
import { basepath } from '../router';

const oauthProviderIconStyle = {
  display: 'block',
  flexShrink: 0,
  height: 20,
  width: 20,
} as const;

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
      <Card size="4" style={{ maxWidth: '28rem', width: '100%' }}>
        <Flex align="center" direction="column" gap="4" p="5">
          <Heading align="center" size="7">
            DnD Encounter Runner
          </Heading>
          <Heading align="center" size="5">
            Sign In
          </Heading>
          <Button
            onClick={() => {
              handleOAuthSignIn('google');
            }}
            style={{ width: '100%' }}
            type="button"
            variant="outline"
          >
            <img alt="" src={googleIcon} style={oauthProviderIconStyle} />
            Google
          </Button>
          <Button
            onClick={() => {
              handleOAuthSignIn('discord');
            }}
            style={{ width: '100%' }}
            type="button"
            variant="outline"
          >
            <img alt="" src={discordIcon} style={oauthProviderIconStyle} />
            Discord
          </Button>
          <Button disabled style={{ width: '100%' }} type="button" variant="outline">
            <img alt="" src={facebookIcon} style={oauthProviderIconStyle} />
            Facebook
          </Button>
          <Flex align="center" gap="3" width="100%">
            <Separator size="4" style={{ flexGrow: 1 }} />
            <Text color="gray" size="2">
              or
            </Text>
            <Separator size="4" style={{ flexGrow: 1 }} />
          </Flex>
          {passwordMutation.isError ? (
            <Callout.Root color="red" role="alert" style={{ width: '100%' }}>
              <Callout.Text>{passwordMutation.error.message}</Callout.Text>
            </Callout.Root>
          ) : null}
          <form
            onSubmit={event => {
              event.preventDefault();
              handlePasswordSignIn();
            }}
            style={{ width: '100%' }}
          >
            <Flex direction="column" gap="3">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="sign-in-email" size="2" weight="medium">
                  Email
                </Text>
                <TextField.Root
                  autoComplete="email"
                  id="sign-in-email"
                  onChange={event => {
                    setEmail(event.target.value);
                  }}
                  type="email"
                  value={email}
                />
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="sign-in-password" size="2" weight="medium">
                  Password
                </Text>
                <TextField.Root
                  autoComplete="current-password"
                  id="sign-in-password"
                  onChange={event => {
                    setPassword(event.target.value);
                  }}
                  type="password"
                  value={password}
                />
              </Flex>
              <Button disabled={isPasswordSubmitDisabled} style={{ width: '100%' }} type="submit">
                Sign In
              </Button>
            </Flex>
          </form>
          <Text color="gray" size="2">
            Don&apos;t have an account? <RouterLink to="/sign-up">Sign up</RouterLink>
          </Text>
        </Flex>
      </Card>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/sign-in')({
  component: SignInComponent,
});
