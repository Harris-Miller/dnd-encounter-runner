import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateEncounter, mutateDeleteEncounter } from '../../../api/encounters';
import type { EncounterListItem } from '../../../api/encounters';

import { EncounterCards } from './EncounterCards';

export interface EncounterListSectionProps {
  campaignId: string;
  encounters: EncounterListItem[];
  isError: boolean;
  isLoading: boolean;
  showHeading?: boolean;
}

export const EncounterListSection: FC<EncounterListSectionProps> = ({
  campaignId,
  encounters,
  isError,
  isLoading,
  showHeading = true,
}) => {
  const navigate = useNavigate();
  const createMutation = useMutation({
    ...mutateCreateEncounter(campaignId),
    mutationKey: ['encounters', 'create', campaignId],
  });
  const deleteMutation = useMutation({ ...mutateDeleteEncounter, mutationKey: ['encounters', 'delete', campaignId] });

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

  const pendingDeleteEncounter =
    pendingDeleteId == null ? null : (encounters.find(encounter => encounter.id === pendingDeleteId) ?? null);

  return (
    <Stack spacing={2}>
      {showHeading ? (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
          <Typography variant="h5">Encounters</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleCreateOpen} startIcon={<AddIcon />} variant="contained">
            New encounter
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCreateOpen} startIcon={<AddIcon />} variant="contained">
            New encounter
          </Button>
        </Box>
      )}

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
        <EncounterCards
          encounters={encounters}
          onDeleteRequest={handleDeleteRequest}
          onSelectEncounter={encounterId => {
            navigate({ params: { encounterId }, to: '/encounter/$encounterId' });
          }}
        />
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
