import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router';
import { Copy, Link as LinkIcon, Pencil, RefreshCw, UserMinus } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import {
  mutateRemoveCharacterFromCampaign,
  mutateSetCampaignInvite,
  mutateUpdateCampaign,
  queryCampaign,
  queryCampaignCharacters,
} from '../../api/campaigns';
import { queryEncountersList } from '../../api/encounters';
import { queryProfile } from '../../api/profile';
import { Alert } from '../../components/compat/Alert';
import { Box } from '../../components/compat/Box';
import { Button } from '../../components/compat/Button';
import { Card, CardActionArea, CardContent } from '../../components/compat/Card';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../../components/compat/Dialog';
import { IconButton } from '../../components/compat/IconButton';
import { InputAdornment } from '../../components/compat/InputAdornment';
import { Skeleton } from '../../components/compat/Skeleton';
import { Stack } from '../../components/compat/Stack';
import { TextField } from '../../components/compat/TextField';
import { Tooltip } from '../../components/compat/Tooltip';
import { Typography } from '../../components/compat/Typography';
import { EncounterListSection } from '../../components/encounter/encounterLists/EncounterListSection';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';
import { fetchQueryOrNotFound } from '../../utils/fetchQueryOrNotFound';

const routeApi = getRouteApi('/campaigns/$campaignId');

const buildInviteUrl = (inviteId: string): string => `${window.location.origin}/invite/${inviteId}`;

const CampaignDetailPage: FC = () => {
  const navigate = useNavigate();
  const { campaignId } = routeApi.useParams();
  const campaignQuery = useQuery(queryCampaign(campaignId));
  const profileQuery = useQuery(queryProfile);
  const charactersQuery = useQuery(queryCampaignCharacters(campaignId));
  const encountersQuery = useQuery(queryEncountersList({ campaignId }));

  const updateMutation = useMutation({
    ...mutateUpdateCampaign,
    mutationKey: ['campaigns', campaignId, 'update'],
  });
  const inviteMutation = useMutation({
    ...mutateSetCampaignInvite,
    mutationKey: ['campaigns', campaignId, 'invite'],
  });
  const removeCharacterMutation = useMutation({
    ...mutateRemoveCharacterFromCampaign,
    mutationKey: ['campaigns', campaignId, 'remove-character'],
  });

  const [renameDraft, setRenameDraft] = useState<null | string>(null);
  const renameOpen = renameDraft !== null;

  const [pendingRemoveCharacterId, setPendingRemoveCharacterId] = useState<null | string>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (campaignQuery.isLoading || profileQuery.isLoading) {
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
  const profile = profileQuery.data;
  const isOwner = campaign.profileId === profile?.id;
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

  const handleEnableInvite = () => {
    inviteMutation.mutate({ id: campaignId, inviteId: crypto.randomUUID() });
  };

  const handleRegenerateInvite = () => {
    inviteMutation.mutate({ id: campaignId, inviteId: crypto.randomUUID() });
  };

  const handleDisableInvite = () => {
    inviteMutation.mutate({ id: campaignId, inviteId: null });
  };

  const handleCopyInviteLink = async () => {
    if (campaign.inviteId == null) {
      return;
    }

    await navigator.clipboard.writeText(buildInviteUrl(campaign.inviteId));
    setCopySuccess(true);
    window.setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography style={{ marginBottom: 8 }} variant="body2">
          <RouterLink to="/campaigns">Back to campaigns</RouterLink>
        </Typography>
        <Box style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <Typography variant="h4">{campaign.name}</Typography>
          {isOwner ? (
            <IconButton aria-label="Rename campaign" onClick={handleRenameOpen}>
              <Pencil />
            </IconButton>
          ) : null}
        </Box>
      </Box>

      {isOwner ? (
        <Stack spacing={2}>
          <Typography variant="h5">Invite link</Typography>
          {campaign.inviteId == null ? (
            <Box>
              <Typography style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }} variant="body2">
                Generate a link to invite others to join this campaign with one of their characters.
              </Typography>
              <Button
                disabled={inviteMutation.isPending}
                onClick={handleEnableInvite}
                startIcon={<LinkIcon size={18} />}
                variant="contained"
              >
                Enable invite link
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={copySuccess ? 'Copied!' : 'Copy link'}>
                        <IconButton aria-label="Copy invite link" onClick={handleCopyInviteLink} type="button">
                          <Copy size={18} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                label="Invite link"
                readOnly
                value={buildInviteUrl(campaign.inviteId)}
              />
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  disabled={inviteMutation.isPending}
                  onClick={handleRegenerateInvite}
                  startIcon={<RefreshCw />}
                  variant="outlined"
                >
                  Regenerate
                </Button>
                <Button disabled={inviteMutation.isPending} onClick={handleDisableInvite} variant="outlined">
                  Disable
                </Button>
              </Box>
              <Typography style={{ color: 'var(--color-text-secondary)' }} variant="body2">
                Regenerating creates a new link and invalidates the previous one.
              </Typography>
            </Stack>
          )}
        </Stack>
      ) : null}

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
                <Box style={{ alignItems: 'center', display: 'flex' }}>
                  <CardActionArea
                    onClick={() => {
                      navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                    }}
                    style={{ flexGrow: 1 }}
                  >
                    <CardContent>
                      <Typography style={{ marginBottom: 32 }} variant="h6">
                        {character.name}
                      </Typography>
                      <Typography style={{ color: 'var(--color-text-secondary)' }} variant="body2">
                        Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                        {String(character.maxHitPoints)} HP
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  {isOwner ? (
                    <Box style={{ paddingRight: 8 }}>
                      <Tooltip title="Remove from campaign">
                        <IconButton
                          aria-label="Remove from campaign"
                          onClick={() => {
                            handleRemoveCharacterRequest(character.id);
                          }}
                        >
                          <UserMinus />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : null}
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
        isOwner={isOwner}
      />

      <Dialog maxWidth="sm" onClose={handleRenameClose} open={renameOpen}>
        <DialogTitle>Rename campaign</DialogTitle>
        <DialogContent>
          <Box style={{ paddingTop: 8 }}>
            <TextField
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

      <Dialog maxWidth="sm" onClose={handleRemoveCharacterCancel} open={pendingRemoveCharacterId !== null}>
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
    await fetchQueryOrNotFound(queryClient, queryCampaign(campaignId));
    await Promise.all([
      queryClient.ensureQueryData(queryProfile),
      queryClient.ensureQueryData(queryCampaignCharacters(campaignId)),
      queryClient.ensureQueryData(queryEncountersList({ campaignId })),
    ]);
  },
});
