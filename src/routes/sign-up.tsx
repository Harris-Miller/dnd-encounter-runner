import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
      navigate({ to: '/dashboard' });
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
        edge="end"
        onClick={() => {
          setShowPasswords(previousShowPasswords => !previousShowPasswords);
        }}
      >
        {showPasswords ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h3">
            DnD Encounter Runner
          </Typography>
          <Typography sx={{ marginBottom: '24px' }} variant="h5">
            Create Account
          </Typography>
          {signUpMutation.isError ? (
            <Typography color="error" sx={{ marginBottom: '16px' }}>
              {signUpMutation.error.message}
            </Typography>
          ) : null}
          <Box
            component="form"
            onSubmit={event => {
              event.preventDefault();
              handleSignUp();
            }}
            sx={{ width: '100%' }}
          >
            <TextField
              fullWidth
              label="Display Name"
              margin="dense"
              onChange={event => {
                setDisplayName(event.target.value);
              }}
              type="text"
              value={displayName}
              variant="standard"
            />
            <TextField
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
              fullWidth
              helperText={`Must be at least ${MINIMUM_PASSWORD_LENGTH} characters`}
              label="Password"
              margin="dense"
              onChange={event => {
                setPassword(event.target.value);
              }}
              slotProps={{ input: { endAdornment: passwordVisibilityAdornment } }}
              type={passwordFieldType}
              value={password}
              variant="standard"
            />
            <TextField
              error={confirmPasswordError}
              fullWidth
              helperText={confirmPasswordError ? 'Passwords do not match' : ' '}
              label="Confirm password"
              margin="dense"
              onChange={event => {
                setConfirmPassword(event.target.value);
              }}
              slotProps={{ input: { endAdornment: passwordVisibilityAdornment } }}
              sx={{ marginBottom: '16px' }}
              type={passwordFieldType}
              value={confirmPassword}
              variant="standard"
            />
            <Button disabled={isSubmitDisabled} fullWidth type="submit" variant="contained">
              Create account
            </Button>
          </Box>
          <Typography sx={{ marginTop: '16px' }} variant="body2">
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
