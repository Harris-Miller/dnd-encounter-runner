import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateEncounter, mutateDeleteEncounter, queryEncountersList } from '../../api/encounters';
import { queryClient } from '../../queryClient';

const formatTimestamp = (raw: string): string => {
  if (raw === '') return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
};

const EncountersPage: FC = () => {
  const navigate = useNavigate();
  const { data, isError, isLoading } = useQuery(queryEncountersList);
  const createMutation = useMutation({ ...mutateCreateEncounter, mutationKey: ['encounters', 'create'] });
  const deleteMutation = useMutation({ ...mutateDeleteEncounter, mutationKey: ['encounters', 'delete'] });

  const [createDraft, setCreateDraft] = useState<null | string>(null);
  const createOpen = createDraft !== null;

  const [pendingDeleteId, setPendingDeleteId] = useState<null | string>(null);

  const handleCreateOpen = () => {
    setCreateDraft('');
  };

  const handleCreateClose = () => {
    setCreateDraft(null);
  };

  const handleCreateConfirm = () => {
    const name = (createDraft ?? '').trim();
    const finalName = name === '' ? 'Untitled Encounter' : name;

    createMutation.mutate(
      { name: finalName },
      {
        onSuccess: created => {
          setCreateDraft(null);
          navigate({ params: { encounterId: created.id }, to: '/encounter/$encounterId' });
        },
      },
    );
  };

  const handleDeleteRequest = (encounterId: string) => {
    setPendingDeleteId(encounterId);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId == null) return;
    const idToDelete = pendingDeleteId;
    deleteMutation.mutate(idToDelete, {
      onSettled: () => {
        setPendingDeleteId(null);
      },
    });
  };

  const encounters = data ?? [];
  const pendingDeleteEncounter =
    pendingDeleteId == null ? null : (encounters.find(encounter => encounter.id === pendingDeleteId) ?? null);

  return (
    <Stack spacing={3}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
        <Typography variant="h4">Encounters</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleCreateOpen} startIcon={<AddIcon />} variant="contained">
          New encounter
        </Button>
      </Box>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton height={96} variant="rectangular" />
          <Skeleton height={96} variant="rectangular" />
        </Stack>
      ) : null}

      {isError ? <Alert severity="error">Failed to load encounters.</Alert> : null}

      {!isLoading && !isError && encounters.length === 0 && (
        <Alert severity="info">
          No encounters yet. Click <strong>New encounter</strong> to get started.
        </Alert>
      )}

      {!isLoading && !isError && encounters.length > 0 && (
        <Stack spacing={2}>
          {encounters.map(encounter => (
            <Card key={encounter.id} variant="outlined">
              <Box sx={{ alignItems: 'center', display: 'flex' }}>
                <CardActionArea
                  onClick={() => {
                    navigate({ params: { encounterId: encounter.id }, to: '/encounter/$encounterId' });
                  }}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6">{encounter.name}</Typography>
                      <Chip
                        color={encounter.active ? 'success' : 'default'}
                        label={encounter.active ? 'Active' : 'Inactive'}
                        size="small"
                      />
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }} variant="body2">
                      Round {String(encounter.round)} · {String(encounter.combatantCount)} combatant
                      {encounter.combatantCount === 1 ? '' : 's'} · Updated {formatTimestamp(encounter.updatedAt)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ pr: 1 }}>
                  <Tooltip title="Delete encounter">
                    <IconButton
                      aria-label="Delete encounter"
                      color="error"
                      onClick={() => {
                        handleDeleteRequest(encounter.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog fullWidth maxWidth="sm" onClose={handleCreateClose} open={createOpen}>
        <DialogTitle>New encounter</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Encounter name"
              onChange={event => {
                setCreateDraft(event.target.value);
              }}
              placeholder="Untitled Encounter"
              value={createDraft ?? ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button disabled={createMutation.isPending} onClick={handleCreateConfirm} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" onClose={handleDeleteCancel} open={pendingDeleteId !== null}>
        <DialogTitle>Delete encounter</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Delete <strong>{pendingDeleteEncounter?.name ?? 'this encounter'}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const Route = createFileRoute('/encounter/')({
  component: EncountersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryEncountersList);
  },
});
