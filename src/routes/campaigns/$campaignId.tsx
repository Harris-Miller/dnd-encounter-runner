import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
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
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import {
  mutateRemoveCharacterFromCampaign,
  mutateUpdateCampaign,
  queryCampaign,
  queryCampaignCharacters,
} from '../../api/campaigns';
import { queryEncountersList } from '../../api/encounters';
import { EncounterListSection } from '../../components/encounter/encounterLists/EncounterListSection';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const routeApi = getRouteApi('/campaigns/$campaignId');

const CampaignDetailPage: FC = () => {
  const navigate = useNavigate();
  const { campaignId } = routeApi.useParams();
  const campaignQuery = useQuery(queryCampaign(campaignId));
  const charactersQuery = useQuery(queryCampaignCharacters(campaignId));
  const encountersQuery = useQuery(queryEncountersList({ campaignId }));

  const updateMutation = useMutation({
    ...mutateUpdateCampaign,
    mutationKey: ['campaigns', campaignId, 'update'],
  });
  const removeCharacterMutation = useMutation({
    ...mutateRemoveCharacterFromCampaign,
    mutationKey: ['campaigns', campaignId, 'remove-character'],
  });

  const [renameDraft, setRenameDraft] = useState<null | string>(null);
  const renameOpen = renameDraft !== null;

  const [pendingRemoveCharacterId, setPendingRemoveCharacterId] = useState<null | string>(null);

  if (campaignQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={48} variant="rectangular" />
        <Skeleton height={240} variant="rectangular" />
      </Stack>
    );
  }

  if (campaignQuery.isError || campaignQuery.data == null) {
    return <Alert severity="error">Campaign not found.</Alert>;
  }

  const campaign = campaignQuery.data;
  const characters = charactersQuery.data ?? [];
  const pendingRemoveCharacter =
    pendingRemoveCharacterId == null
      ? null
      : (characters.find(character => character.id === pendingRemoveCharacterId) ?? null);

  const handleRenameOpen = () => {
    setRenameDraft(campaign.name);
  };

  const handleRenameClose = () => {
    setRenameDraft(null);
  };

  const handleRenameConfirm = () => {
    if (renameDraft == null) {
      return;
    }
    const next = renameDraft.trim();

    if (next === '' || next === campaign.name) {
      setRenameDraft(null);
      return;
    }

    updateMutation.mutate({ id: campaignId, name: next });
    setRenameDraft(null);
  };

  const handleRemoveCharacterRequest = (characterId: string) => {
    setPendingRemoveCharacterId(characterId);
  };

  const handleRemoveCharacterCancel = () => {
    setPendingRemoveCharacterId(null);
  };

  const handleRemoveCharacterConfirm = () => {
    if (pendingRemoveCharacterId == null) return;
    const characterId = pendingRemoveCharacterId;
    removeCharacterMutation.mutate(
      { campaignId, characterId },
      {
        onSettled: () => {
          setPendingRemoveCharacterId(null);
        },
      },
    );
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography sx={{ mb: 1 }} variant="body2">
          <RouterLink to="/campaigns">Back to campaigns</RouterLink>
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">{campaign.name}</Typography>
          <IconButton aria-label="Rename campaign" onClick={handleRenameOpen} size="small">
            <EditIcon />
          </IconButton>
        </Box>
      </Box>

      <Stack spacing={2}>
        <Typography variant="h5">Characters</Typography>

        {charactersQuery.isLoading ? (
          <Stack spacing={2}>
            <Skeleton height={72} variant="rectangular" />
          </Stack>
        ) : null}

        {charactersQuery.isError ? <Alert severity="error">Failed to load characters.</Alert> : null}

        {!charactersQuery.isLoading && !charactersQuery.isError && characters.length === 0 && (
          <Alert severity="info">No characters in this campaign yet.</Alert>
        )}

        {!charactersQuery.isLoading && !charactersQuery.isError && characters.length > 0 && (
          <Stack spacing={2}>
            {characters.map(character => (
              <Card key={character.id} variant="outlined">
                <Box sx={{ alignItems: 'center', display: 'flex' }}>
                  <CardActionArea
                    onClick={() => {
                      navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                    }}
                    sx={{ flexGrow: 1 }}
                  >
                    <CardContent>
                      <Typography sx={{ mb: 0.5 }} variant="h6">
                        {character.name}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }} variant="body2">
                        Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                        {String(character.maxHitPoints)} HP
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ pr: 1 }}>
                    <Tooltip title="Remove from campaign">
                      <IconButton
                        aria-label="Remove from campaign"
                        color="warning"
                        onClick={() => {
                          handleRemoveCharacterRequest(character.id);
                        }}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <EncounterListSection
        campaignId={campaignId}
        encounters={encountersQuery.data ?? []}
        isError={encountersQuery.isError}
        isLoading={encountersQuery.isLoading}
      />

      <Dialog fullWidth maxWidth="sm" onClose={handleRenameClose} open={renameOpen}>
        <DialogTitle>Rename campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Campaign name"
              onChange={event => {
                setRenameDraft(event.target.value);
              }}
              value={renameDraft ?? ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button disabled={updateMutation.isPending} onClick={handleRenameConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" onClose={handleRemoveCharacterCancel} open={pendingRemoveCharacterId !== null}>
        <DialogTitle>Remove from campaign</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Remove <strong>{pendingRemoveCharacter?.name ?? 'this character'}</strong> from this campaign? The character
            will not be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveCharacterCancel}>Cancel</Button>
          <Button
            color="warning"
            disabled={removeCharacterMutation.isPending}
            onClick={handleRemoveCharacterConfirm}
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const Route = createFileRoute('/campaigns/$campaignId')({
  component: CampaignDetailPage,
  loader: async ({ params }) => {
    const { campaignId } = params;
    await Promise.all([
      queryClient.ensureQueryData(queryCampaign(campaignId)),
      queryClient.ensureQueryData(queryCampaignCharacters(campaignId)),
      queryClient.ensureQueryData(queryEncountersList({ campaignId })),
    ]);
  },
});
