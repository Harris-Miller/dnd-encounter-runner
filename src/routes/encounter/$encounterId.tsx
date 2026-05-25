import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateSetEncounterActive, mutateSetEncounterName, queryEncounter } from '../../api/encounters';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const routeApi = getRouteApi('/encounter/$encounterId');

const EncounterPage: FC = () => {
  const { encounterId } = routeApi.useParams();
  const { data, isError, isLoading } = useQuery(queryEncounter(encounterId));
  const setNameMutation = useMutation({
    ...mutateSetEncounterName,
    mutationKey: ['encounter', encounterId, 'set-name'],
  });
  const setActiveMutation = useMutation({
    ...mutateSetEncounterActive,
    mutationKey: ['encounter', encounterId, 'set-active'],
  });
  const [renameDraft, setRenameDraft] = useState<string | null>(null);
  const renameOpen = renameDraft !== null;

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={48} variant="rectangular" />
        <Skeleton height={240} variant="rectangular" />
      </Stack>
    );
  }

  if (isError || data == null) {
    return <Alert severity="error">Encounter not found.</Alert>;
  }

  const handleRenameOpen = () => {
    setRenameDraft(data.name);
  };

  const handleRenameClose = () => {
    setRenameDraft(null);
  };

  const handleRenameConfirm = () => {
    if (renameDraft == null) {
      return;
    }
    const next = renameDraft.trim();

    if (next === '' || next === data.name) {
      setRenameDraft(null);
      return;
    }

    setNameMutation.mutate({ encounterId, name: next });
    setRenameDraft(null);
  };

  const handleToggleActive = () => {
    setActiveMutation.mutate({ active: !data.active, encounterId });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ mb: 1 }} variant="body2">
          <RouterLink to="/home">Back to encounters</RouterLink>
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">{data.name}</Typography>
          <IconButton onClick={handleRenameOpen} size="small">
            <EditIcon />
          </IconButton>
          <Chip
            color={data.active ? 'success' : 'default'}
            label={data.active ? 'Active' : 'Inactive'}
            onClick={handleToggleActive}
            size="small"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Typography sx={{ color: 'text.secondary' }} variant="body2">
            Round {String(data.state.round)} · Turn {String(data.state.turnIndex + 1)} of{' '}
            {String(data.state.initiativeOrder.length)}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info">
        Initiative tracker, record-event toolbar, combatant details, and reminder panel will surface here as the
        remaining iteration steps land.
      </Alert>

      <Dialog fullWidth maxWidth="sm" onClose={handleRenameClose} open={renameOpen}>
        <DialogTitle>Rename Encounter</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Encounter name"
              onChange={event => {
                setRenameDraft(event.target.value);
              }}
              value={renameDraft ?? ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const Route = createFileRoute('/encounter/$encounterId')({
  component: EncounterPage,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(queryEncounter(params.encounterId));
  },
});
