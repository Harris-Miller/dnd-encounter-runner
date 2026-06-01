import * as Label from '@radix-ui/react-label';
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
    <button
      aria-label={showPasswords ? 'Hide password' : 'Show password'}
      onClick={() => {
        setShowPasswords(previousShowPasswords => !previousShowPasswords);
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
      type="button"
    >
      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );

  const passwordInputWrapperStyle = {
    alignItems: 'center',
    display: 'flex',
    gap: '0.25rem',
  } as const;

  return (
    <FullScreenCenter>
      <div className="auth-container">
        <div className="auth-paper">
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 1.5rem' }}>DnD Encounter Runner</h1>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem' }}>Create Account</h2>
          {signUpMutation.isError ? (
            <p style={{ color: 'var(--color-error)', marginBottom: 16 }}>{signUpMutation.error.message}</p>
          ) : null}
          <form
            onSubmit={event => {
              event.preventDefault();
              handleSignUp();
            }}
            style={{ width: '100%' }}
          >
            <div className="field" style={{ marginTop: 8 }}>
              <Label.Root className="field-label" htmlFor="sign-up-display-name">
                Display Name
              </Label.Root>
              <input
                className="field-input"
                id="sign-up-display-name"
                onChange={event => {
                  setDisplayName(event.target.value);
                }}
                type="text"
                value={displayName}
              />
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <Label.Root className="field-label" htmlFor="sign-up-email">
                Email
              </Label.Root>
              <input
                className="field-input"
                id="sign-up-email"
                onChange={event => {
                  setEmail(event.target.value);
                }}
                type="email"
                value={email}
              />
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <Label.Root className="field-label" htmlFor="sign-up-password">
                Password
              </Label.Root>
              <div style={passwordInputWrapperStyle}>
                <input
                  className="field-input"
                  id="sign-up-password"
                  onChange={event => {
                    setPassword(event.target.value);
                  }}
                  style={{ flex: 1 }}
                  type={passwordFieldType}
                  value={password}
                />
                {passwordToggleButton}
              </div>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                Must be at least {String(MINIMUM_PASSWORD_LENGTH)} characters
              </span>
            </div>
            <div className="field" style={{ marginBottom: 16, marginTop: 8 }}>
              <Label.Root className="field-label" htmlFor="sign-up-confirm-password">
                Confirm password
              </Label.Root>
              <div style={passwordInputWrapperStyle}>
                <input
                  aria-invalid={confirmPasswordError}
                  className="field-input"
                  id="sign-up-confirm-password"
                  onChange={event => {
                    setConfirmPassword(event.target.value);
                  }}
                  style={{
                    borderColor: confirmPasswordError ? 'var(--color-error)' : undefined,
                    flex: 1,
                  }}
                  type={passwordFieldType}
                  value={confirmPassword}
                />
                {passwordToggleButton}
              </div>
              {confirmPasswordError ? (
                <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>Passwords do not match</span>
              ) : (
                <span aria-hidden style={{ fontSize: '0.75rem', visibility: 'hidden' }}>
                  &nbsp;
                </span>
              )}
            </div>
            <button disabled={isSubmitDisabled} style={{ width: '100%' }} type="submit">
              Create account
            </button>
          </form>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: 16 }}>
            Already have an account? <RouterLink to="/sign-in">Sign in</RouterLink>
          </p>
        </div>
      </div>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/sign-up')({
  component: SignUpComponent,
});
