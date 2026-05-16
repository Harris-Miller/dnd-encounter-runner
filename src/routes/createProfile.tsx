import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { hasProfileName, mutateUpdateProfile, queryProfile } from '../api/profile';
import { FullScreenCenter } from '../components/FullScreenCenter';
import { queryClient } from '../queryClient';
import { requireSession } from '../routing/routeGuards';

const CreateProfileComponent: FC = () => {
  const navigate = useNavigate();
  const profile = useQuery(queryProfile);
  const [draftName, setDraftName] = useState('');

  const updateMutation = useMutation({
    ...mutateUpdateProfile,
    onSuccess: () => {
      navigate({ to: '/home' });
    },
  });

  const trimmedName = draftName.trim();
  const isNameValid = trimmedName !== '';

  const handleContinue = () => {
    if (!isNameValid || profile.data == null) {
      return;
    }

    updateMutation.mutate({
      avatarUrl: profile.data.avatar_url ?? '',
      name: trimmedName,
    });
  };

  if (profile.isError) {
    return (
      <FullScreenCenter>
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <Typography color="error">{profile.error.message}</Typography>
          </Paper>
        </Container>
      </FullScreenCenter>
    );
  }

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
            disabled={!isNameValid || updateMutation.isPending || profile.isPending}
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

    const profile = await queryClient.fetchQuery(queryProfile);

    if (hasProfileName(profile.name)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirect API
      throw redirect({ to: '/home' });
    }
  },
  component: CreateProfileComponent,
});
