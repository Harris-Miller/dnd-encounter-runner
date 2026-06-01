import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateSignUpWithPassword } from '../api/auth';
import { Button } from '../components/compat/Button';
import { Container } from '../components/compat/Container';
import { IconButton } from '../components/compat/IconButton';
import { InputAdornment } from '../components/compat/InputAdornment';
import { Paper } from '../components/compat/Paper';
import { TextField } from '../components/compat/TextField';
import { Typography } from '../components/compat/Typography';
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
  const passwordVisibilityAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label={showPasswords ? 'Hide password' : 'Show password'}
        onClick={() => {
          setShowPasswords(previousShowPasswords => !previousShowPasswords);
        }}
        type="button"
      >
        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: 24 }}>
          <Typography style={{ marginBottom: 24 }} variant="h3">
            DnD Encounter Runner
          </Typography>
          <Typography style={{ marginBottom: 24 }} variant="h5">
            Create Account
          </Typography>
          {signUpMutation.isError ? (
            <Typography color="error" style={{ marginBottom: 16 }}>
              {signUpMutation.error.message}
            </Typography>
          ) : null}
          <form
            onSubmit={event => {
              event.preventDefault();
              handleSignUp();
            }}
            style={{ width: '100%' }}
          >
            <TextField
              fullWidth
              label="Display Name"
              onChange={event => {
                setDisplayName(event.target.value);
              }}
              style={{ marginTop: 8 }}
              type="text"
              value={displayName}
            />
            <TextField
              fullWidth
              label="Email"
              onChange={event => {
                setEmail(event.target.value);
              }}
              style={{ marginTop: 8 }}
              type="email"
              value={email}
            />
            <TextField
              fullWidth
              helperText={`Must be at least ${String(MINIMUM_PASSWORD_LENGTH)} characters`}
              InputProps={{ endAdornment: passwordVisibilityAdornment }}
              label="Password"
              onChange={event => {
                setPassword(event.target.value);
              }}
              style={{ marginTop: 8 }}
              type={passwordFieldType}
              value={password}
            />
            <TextField
              error={confirmPasswordError}
              fullWidth
              helperText={confirmPasswordError ? 'Passwords do not match' : ' '}
              InputProps={{ endAdornment: passwordVisibilityAdornment }}
              label="Confirm password"
              onChange={event => {
                setConfirmPassword(event.target.value);
              }}
              style={{ marginBottom: 16, marginTop: 8 }}
              type={passwordFieldType}
              value={confirmPassword}
            />
            <Button disabled={isSubmitDisabled} fullWidth type="submit" variant="contained">
              Create account
            </Button>
          </form>
          <Typography style={{ marginTop: 16 }} variant="body2">
            Already have an account? <RouterLink to="/sign-in">Sign in</RouterLink>
          </Typography>
        </Paper>
      </Container>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/sign-up')({
  component: SignUpComponent,
});
