import { Button, Callout, Card, Flex, Heading, IconButton, Text, TextField } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateSignUpWithPassword } from '../api/auth';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { RouterLink } from '../components/RouterLink';

const MINIMUM_DISPLAY_NAME_LENGTH = 3;
const MINIMUM_PASSWORD_LENGTH = 6;

const SignUpComponent: FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const signUpMutation = useMutation({
    ...mutateSignUpWithPassword,
    onSuccess: () => {
      navigate({ to: '/' });
    },
  });

  const trimmedEmail = email.trim();
  const trimmedDisplayName = displayName.trim();
  const isPasswordTooShort = password.length < MINIMUM_PASSWORD_LENGTH;
  const isDisplayNameTooShort = trimmedDisplayName.length < MINIMUM_DISPLAY_NAME_LENGTH;
  const doPasswordsMatch = password === confirmPassword;
  const isSubmitDisabled =
    trimmedEmail === '' || isPasswordTooShort || isDisplayNameTooShort || !doPasswordsMatch || signUpMutation.isPending;

  const handleSignUp = () => {
    if (isSubmitDisabled) {
      return;
    }

    signUpMutation.mutate({ displayName: trimmedDisplayName, email: trimmedEmail, password });
  };

  const confirmPasswordError = confirmPassword !== '' && !doPasswordsMatch;

  const passwordFieldType = showPasswords ? 'text' : 'password';

  const passwordToggleButton = (
    <IconButton
      aria-label={showPasswords ? 'Hide password' : 'Show password'}
      onClick={() => {
        setShowPasswords(previousShowPasswords => !previousShowPasswords);
      }}
      type="button"
      variant="ghost"
    >
      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
    </IconButton>
  );

  return (
    <FullScreenCenter>
      <Card size="4" style={{ maxWidth: '28rem', width: '100%' }}>
        <Flex align="center" direction="column" gap="4" p="5">
          <Heading align="center" size="7">
            DnD Encounter Runner
          </Heading>
          <Heading align="center" size="5">
            Create Account
          </Heading>
          {signUpMutation.isError ? (
            <Callout.Root color="red" role="alert" style={{ width: '100%' }}>
              <Callout.Text>{signUpMutation.error.message}</Callout.Text>
            </Callout.Root>
          ) : null}
          <form
            onSubmit={event => {
              event.preventDefault();
              handleSignUp();
            }}
            style={{ width: '100%' }}
          >
            <Flex direction="column" gap="3">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="sign-up-display-name" size="2" weight="medium">
                  Display Name
                </Text>
                <TextField.Root
                  id="sign-up-display-name"
                  onChange={event => {
                    setDisplayName(event.target.value);
                  }}
                  type="text"
                  value={displayName}
                />
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="sign-up-email" size="2" weight="medium">
                  Email
                </Text>
                <TextField.Root
                  id="sign-up-email"
                  onChange={event => {
                    setEmail(event.target.value);
                  }}
                  type="email"
                  value={email}
                />
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="sign-up-password" size="2" weight="medium">
                  Password
                </Text>
                <Flex align="center" gap="1">
                  <TextField.Root
                    id="sign-up-password"
                    onChange={event => {
                      setPassword(event.target.value);
                    }}
                    style={{ flex: 1 }}
                    type={passwordFieldType}
                    value={password}
                  />
                  {passwordToggleButton}
                </Flex>
                <Text color="gray" size="1">
                  Must be at least {String(MINIMUM_PASSWORD_LENGTH)} characters
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="sign-up-confirm-password" size="2" weight="medium">
                  Confirm password
                </Text>
                <Flex align="center" gap="1">
                  <TextField.Root
                    color={confirmPasswordError ? 'red' : undefined}
                    id="sign-up-confirm-password"
                    onChange={event => {
                      setConfirmPassword(event.target.value);
                    }}
                    style={{ flex: 1 }}
                    type={passwordFieldType}
                    value={confirmPassword}
                  />
                  {passwordToggleButton}
                </Flex>
                {confirmPasswordError ? (
                  <Text color="red" size="1">
                    Passwords do not match
                  </Text>
                ) : (
                  <Text aria-hidden color="gray" size="1" style={{ visibility: 'hidden' }}>
                    &nbsp;
                  </Text>
                )}
              </Flex>
              <Button disabled={isSubmitDisabled} style={{ width: '100%' }} type="submit">
                Create account
              </Button>
            </Flex>
          </form>
          <Text color="gray" size="2">
            Already have an account? <RouterLink to="/sign-in">Sign in</RouterLink>
          </Text>
        </Flex>
      </Card>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/sign-up')({
  component: SignUpComponent,
});
