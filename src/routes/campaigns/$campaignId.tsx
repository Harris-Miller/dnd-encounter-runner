import {
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
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
      <Flex direction="column" gap="4">
        <Skeleton height="48px" />
        <Skeleton height="240px" />
      </Flex>
    );
  }

  if (campaignQuery.isError || campaignQuery.data == null) {
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Text>Campaign not found.</Callout.Text>
      </Callout.Root>
    );
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
    <Flex direction="column" gap="6">
      <Box>
        <Text as="p" mb="2">
          <RouterLink to="/campaigns">Back to campaigns</RouterLink>
        </Text>
        <Flex align="center" gap="4" wrap="wrap">
          <Heading size="6">{campaign.name}</Heading>
          {isOwner ? (
            <IconButton aria-label="Rename campaign" onClick={handleRenameOpen} type="button" variant="ghost">
              <Pencil size={20} />
            </IconButton>
          ) : null}
        </Flex>
      </Box>

      {isOwner ? (
        <Flex direction="column" gap="4">
          <Heading size="5">Invite link</Heading>
          {campaign.inviteId == null ? (
            <Box>
              <Text color="gray" mb="4" size="2">
                Generate a link to invite others to join this campaign with one of their characters.
              </Text>
              <Button disabled={inviteMutation.isPending} onClick={handleEnableInvite} type="button">
                <LinkIcon size={18} />
                Enable invite link
              </Button>
            </Box>
          ) : (
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="invite-link" size="2" weight="medium">
                  Invite link
                </Text>
                <Flex align="center" gap="2">
                  <TextField.Root id="invite-link" readOnly value={buildInviteUrl(campaign.inviteId)} />
                  <Tooltip content={copySuccess ? 'Copied!' : 'Copy link'}>
                    <IconButton
                      aria-label="Copy invite link"
                      onClick={handleCopyInviteLink}
                      type="button"
                      variant="soft"
                    >
                      <Copy size={18} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Flex>
              <Flex gap="2" wrap="wrap">
                <Button
                  disabled={inviteMutation.isPending}
                  onClick={handleRegenerateInvite}
                  type="button"
                  variant="soft"
                >
                  <RefreshCw size={18} />
                  Regenerate
                </Button>
                <Button
                  color="gray"
                  disabled={inviteMutation.isPending}
                  onClick={handleDisableInvite}
                  type="button"
                  variant="soft"
                >
                  Disable
                </Button>
              </Flex>
              <Text color="gray" size="2">
                Regenerating creates a new link and invalidates the previous one.
              </Text>
            </Flex>
          )}
        </Flex>
      ) : null}

      <Flex direction="column" gap="4">
        <Heading size="5">Characters</Heading>

        {charactersQuery.isLoading ? <Skeleton height="72px" /> : null}

        {charactersQuery.isError ? (
          <Callout.Root color="red" role="alert">
            <Callout.Text>Failed to load characters.</Callout.Text>
          </Callout.Root>
        ) : null}

        {!charactersQuery.isLoading && !charactersQuery.isError && characters.length === 0 ? (
          <Callout.Root color="blue" role="status">
            <Callout.Text>No characters in this campaign yet.</Callout.Text>
          </Callout.Root>
        ) : null}

        {!charactersQuery.isLoading && !charactersQuery.isError && characters.length > 0 ? (
          <Flex direction="column" gap="4">
            {characters.map(character => (
              <Card key={character.id} variant="surface">
                <Flex align="center">
                  <button
                    onClick={() => {
                      navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      flexGrow: 1,
                      font: 'inherit',
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                    }}
                    type="button"
                  >
                    <Heading mb="1" size="4">
                      {character.name}
                    </Heading>
                    <Text color="gray" size="2">
                      Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                      {String(character.maxHitPoints)} HP
                    </Text>
                  </button>
                  {isOwner ? (
                    <Box pr="2">
                      <Tooltip content="Remove from campaign">
                        <IconButton
                          aria-label="Remove from campaign"
                          color="red"
                          onClick={() => {
                            handleRemoveCharacterRequest(character.id);
                          }}
                          type="button"
                          variant="ghost"
                        >
                          <UserMinus size={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : null}
                </Flex>
              </Card>
            ))}
          </Flex>
        ) : null}
      </Flex>

      <EncounterListSection
        campaignId={campaignId}
        encounters={encountersQuery.data ?? []}
        isError={encountersQuery.isError}
        isLoading={encountersQuery.isLoading}
        isOwner={isOwner}
      />

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleRenameClose();
          }
        }}
        open={renameOpen}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Rename campaign</Dialog.Title>
          <Flex direction="column" gap="1" mt="4">
            <Text as="label" htmlFor="campaign-rename" size="2" weight="medium">
              Campaign name
            </Text>
            <TextField.Root
              id="campaign-rename"
              onChange={event => {
                setRenameDraft(event.target.value);
              }}
              value={renameDraft ?? ''}
            />
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleRenameClose} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={updateMutation.isPending} onClick={handleRenameConfirm} type="button">
              Save
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleRemoveCharacterCancel();
          }
        }}
        open={pendingRemoveCharacterId !== null}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Remove from campaign</Dialog.Title>
          <Text as="p" mt="4">
            Remove <strong>{pendingRemoveCharacter?.name ?? 'this character'}</strong> from this campaign? The character
            will not be deleted.
          </Text>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleRemoveCharacterCancel} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              color="red"
              disabled={removeCharacterMutation.isPending}
              onClick={handleRemoveCharacterConfirm}
              type="button"
            >
              Remove
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
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
