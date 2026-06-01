import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Tooltip from '@radix-ui/react-tooltip';
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: 48 }} />
        <div className="skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  if (campaignQuery.isError || campaignQuery.data == null) {
    return (
      <div className="alert alert-error" role="alert">
        Campaign not found.
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem' }}>
          <RouterLink to="/campaigns">Back to campaigns</RouterLink>
        </p>
        <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{campaign.name}</h1>
          {isOwner ? (
            <button
              aria-label="Rename campaign"
              onClick={handleRenameOpen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              type="button"
            >
              <Pencil size={20} />
            </button>
          ) : null}
        </div>
      </div>

      {isOwner ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Invite link</h2>
          {campaign.inviteId == null ? (
            <div>
              <p className="text-secondary" style={{ margin: '0 0 1rem' }}>
                Generate a link to invite others to join this campaign with one of their characters.
              </p>
              <button
                disabled={inviteMutation.isPending}
                onClick={handleEnableInvite}
                style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
                type="button"
              >
                <LinkIcon size={18} />
                Enable invite link
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field">
                <Label.Root className="field-label" htmlFor="invite-link">
                  Invite link
                </Label.Root>
                <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
                  <input className="field-input" id="invite-link" readOnly value={buildInviteUrl(campaign.inviteId)} />
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button aria-label="Copy invite link" onClick={handleCopyInviteLink} type="button">
                        <Copy size={18} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                        {copySuccess ? 'Copied!' : 'Copy link'}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  disabled={inviteMutation.isPending}
                  onClick={handleRegenerateInvite}
                  style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
                  type="button"
                >
                  <RefreshCw size={18} />
                  Regenerate
                </button>
                <button disabled={inviteMutation.isPending} onClick={handleDisableInvite} type="button">
                  Disable
                </button>
              </div>
              <p className="text-secondary" style={{ margin: 0 }}>
                Regenerating creates a new link and invalidates the previous one.
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Characters</h2>

        {charactersQuery.isLoading ? <div className="skeleton" style={{ height: 72 }} /> : null}

        {charactersQuery.isError ? (
          <div className="alert alert-error" role="alert">
            Failed to load characters.
          </div>
        ) : null}

        {!charactersQuery.isLoading && !charactersQuery.isError && characters.length === 0 ? (
          <div className="alert alert-info" role="status">
            No characters in this campaign yet.
          </div>
        ) : null}

        {!charactersQuery.isLoading && !charactersQuery.isError && characters.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {characters.map(character => (
              <article className="card-outlined" key={character.id}>
                <div style={{ alignItems: 'center', display: 'flex' }}>
                  <button
                    className="card-action"
                    onClick={() => {
                      navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                    }}
                    style={{ flexGrow: 1 }}
                    type="button"
                  >
                    <div className="card-content">
                      <h3 style={{ fontSize: '1.125rem', margin: '0 0 0.5rem' }}>{character.name}</h3>
                      <p className="text-secondary" style={{ margin: 0 }}>
                        Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                        {String(character.maxHitPoints)} HP
                      </p>
                    </div>
                  </button>
                  {isOwner ? (
                    <div style={{ paddingRight: 8 }}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            aria-label="Remove from campaign"
                            onClick={() => {
                              handleRemoveCharacterRequest(character.id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                            type="button"
                          >
                            <UserMinus size={20} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                            Remove from campaign
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

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
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Rename campaign</Dialog.Title>
            <div className="field" style={{ paddingTop: 8 }}>
              <Label.Root className="field-label" htmlFor="campaign-rename">
                Campaign name
              </Label.Root>
              <input
                className="field-input"
                id="campaign-rename"
                onChange={event => {
                  setRenameDraft(event.target.value);
                }}
                value={renameDraft ?? ''}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={handleRenameClose} type="button">
                Cancel
              </button>
              <button disabled={updateMutation.isPending} onClick={handleRenameConfirm} type="button">
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleRemoveCharacterCancel();
          }
        }}
        open={pendingRemoveCharacterId !== null}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Remove from campaign</Dialog.Title>
            <p style={{ margin: '1rem 0' }}>
              Remove <strong>{pendingRemoveCharacter?.name ?? 'this character'}</strong> from this campaign? The
              character will not be deleted.
            </p>
            <div className="dialog-actions">
              <button onClick={handleRemoveCharacterCancel} type="button">
                Cancel
              </button>
              <button disabled={removeCharacterMutation.isPending} onClick={handleRemoveCharacterConfirm} type="button">
                Remove
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
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
