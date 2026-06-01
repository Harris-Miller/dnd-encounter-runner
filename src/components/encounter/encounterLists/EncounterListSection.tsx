import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateEncounter, mutateDeleteEncounter } from '../../../api/encounters';
import type { EncounterListItem } from '../../../api/encounters';
import { Alert } from '../../compat/Alert';
import { Box } from '../../compat/Box';
import { Button } from '../../compat/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../../compat/Dialog';
import { Skeleton } from '../../compat/Skeleton';
import { Stack } from '../../compat/Stack';
import { TextField } from '../../compat/TextField';
import { Typography } from '../../compat/Typography';

import { EncounterCards } from './EncounterCards';

export interface EncounterListSectionProps {
  campaignId: string;
  encounters: EncounterListItem[];
  isError: boolean;
  isLoading: boolean;
  isOwner?: boolean;
  showHeading?: boolean;
}

export const EncounterListSection: FC<EncounterListSectionProps> = ({
  campaignId,
  encounters,
  isError,
  isLoading,
  isOwner = true,
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
        <Box style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
          <Typography variant="h5">Encounters</Typography>
          <span className="flex-grow" />
          {isOwner ? (
            <Button onClick={handleCreateOpen} startIcon={<Plus size={18} />} type="button" variant="contained">
              New encounter
            </Button>
          ) : null}
        </Box>
      ) : isOwner ? (
        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCreateOpen} startIcon={<Plus size={18} />} type="button" variant="contained">
            New encounter
          </Button>
        </Box>
      ) : null}

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton height={96} variant="rectangular" />
          <Skeleton height={96} variant="rectangular" />
        </Stack>
      ) : null}

      {isError ? <Alert severity="error">Failed to load encounters.</Alert> : null}

      {!isLoading && !isError && encounters.length === 0 && (
        <Alert severity="info">
          {isOwner ? (
            <>
              No encounters yet. Click <strong>New encounter</strong> to get started.
            </>
          ) : (
            'No encounters in this campaign yet.'
          )}
        </Alert>
      )}

      {!isLoading && !isError && encounters.length > 0 && (
        <EncounterCards
          encounters={encounters}
          onDeleteRequest={isOwner ? handleDeleteRequest : undefined}
          onSelectEncounter={encounterId => {
            navigate({ params: { encounterId }, to: '/encounter/$encounterId' });
          }}
        />
      )}

      <Dialog maxWidth="sm" onClose={handleCreateClose} open={createOpen}>
        <DialogTitle>New encounter</DialogTitle>
        <DialogContent>
          <Box style={{ paddingTop: 8 }}>
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
          <Button onClick={handleCreateClose} type="button">
            Cancel
          </Button>
          <Button disabled={createMutation.isPending} onClick={handleCreateConfirm} type="button" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth="sm" onClose={handleDeleteCancel} open={pendingDeleteId !== null}>
        <DialogTitle>Delete encounter</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Delete <strong>{pendingDeleteEncounter?.name ?? 'this encounter'}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} type="button">
            Cancel
          </Button>
          <Button disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} type="button" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
