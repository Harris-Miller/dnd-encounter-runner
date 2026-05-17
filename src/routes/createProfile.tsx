import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { hasProfileName, mutateUpdateProfile, queryProfile } from '../api/profile';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { queryClient } from '../queryClient';
import { requireSession } from '../routing/routeGuards';

// CRITICAL: Generate the SHA256 hash correctly for all Gravatar operations
const getGravatarHash = async (email: string): Promise<string> => {
  const normalizedEmail = email.trim().toLowerCase();
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedEmail));

  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const CreateProfileComponent: FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const { profile } = Route.useRouteContext();
  const [draftName, setDraftName] = useState('');

  const gravatarQuery = useQuery({
    queryFn: async () => {
      const gravatarHash = await getGravatarHash(profile.email);
      const response = await fetch(`https://api.gravatar.com/v3/profiles/${gravatarHash}`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GRAVATAR_API_KEY}`,
        },
      });
      return response.json() as Promise<unknown>;
    },
    queryKey: ['gravatar', draftName],
  });

  const updateMutation = useMutation({
    ...mutateUpdateProfile,
    onSuccess: () => {
      navigate({ to: '/home' });
    },
  });

  const trimmedName = draftName.trim();
  const isNameValid = trimmedName !== '';

  const handleContinue = () => {
    if (!isNameValid) {
      return;
    }

    updateMutation.mutate({
      name: trimmedName,
    });
  };

  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ marginBottom: '24px' }} variant="h5">
            Choose a display name
          </Typography>
          {updateMutation.isError ? (
            <Typography color="error" sx={{ marginBottom: '16px' }}>
              {updateMutation.error.message}
            </Typography>
          ) : null}
          <TextField
            autoFocus
            fullWidth
            label="Name"
            margin="dense"
            onChange={event => {
              setDraftName(event.target.value);
            }}
            sx={{ marginBottom: '16px' }}
            value={draftName}
            variant="standard"
          />
          <Button
            disabled={!isNameValid || updateMutation.isPending}
            fullWidth
            onClick={handleContinue}
            variant="contained"
          >
            Continue
          </Button>
        </Paper>
      </Container>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/createProfile')({
  beforeLoad: async () => {
    await requireSession();

    const profile = await queryClient.ensureQueryData(queryProfile);

    if (hasProfileName(profile.name)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
      throw redirect({ to: '/home' });
    }

    return { profile };
  },
  component: CreateProfileComponent,
});
