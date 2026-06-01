import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateCampaign, mutateDeleteCampaign, queryCampaignsList } from '../../api/campaigns';
import { queryClient } from '../../queryClient';

const formatTimestamp = (raw: string): string => {
  if (raw === '') return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
};

const CampaignsPage: FC = () => {
  const navigate = useNavigate();
  const { data, isError, isLoading } = useQuery(queryCampaignsList);
  const createMutation = useMutation(mutateCreateCampaign);
  const deleteMutation = useMutation(mutateDeleteCampaign);

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
    const finalName = name === '' ? 'Untitled Campaign' : name;

    createMutation.mutate(
      { name: finalName },
      {
        onSuccess: created => {
          setCreateDraft(null);
          navigate({ params: { campaignId: created.id }, to: '/campaigns/$campaignId' });
        },
      },
    );
  };

  const handleDeleteRequest = (campaignId: string) => {
    setPendingDeleteId(campaignId);
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

  const campaigns = data ?? [];
  const pendingDeleteCampaign =
    pendingDeleteId == null ? null : (campaigns.find(campaign => campaign.id === pendingDeleteId) ?? null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Campaigns</h1>
        <span className="flex-grow" />
        <button
          onClick={handleCreateOpen}
          style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
          type="button"
        >
          <Plus size={18} />
          New campaign
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 96 }} />
          <div className="skeleton" style={{ height: 96 }} />
        </div>
      ) : null}

      {isError ? (
        <div className="alert alert-error" role="alert">
          Failed to load campaigns.
        </div>
      ) : null}

      {!isLoading && !isError && campaigns.length === 0 ? (
        <div className="alert alert-info" role="status">
          No campaigns yet. Click <strong>New campaign</strong> to get started.
        </div>
      ) : null}

      {!isLoading && !isError && campaigns.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map(campaign => (
            <article className="card-outlined" key={campaign.id}>
              <div style={{ alignItems: 'center', display: 'flex' }}>
                <button
                  className="card-action"
                  onClick={() => {
                    navigate({ params: { campaignId: campaign.id }, to: '/campaigns/$campaignId' });
                  }}
                  style={{ flexGrow: 1 }}
                  type="button"
                >
                  <div className="card-content">
                    <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.5rem' }}>{campaign.name}</h2>
                    <p className="text-secondary" style={{ margin: 0 }}>
                      Updated {formatTimestamp(campaign.updatedAt)}
                    </p>
                  </div>
                </button>
                <div style={{ paddingRight: 8 }}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        aria-label="Delete campaign"
                        onClick={() => {
                          handleDeleteRequest(campaign.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                        type="button"
                      >
                        <Trash2 size={20} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                        Delete campaign
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleCreateClose();
          }
        }}
        open={createOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>New campaign</Dialog.Title>
            <div className="field" style={{ paddingTop: 8 }}>
              <Label.Root className="field-label" htmlFor="campaign-create-name">
                Campaign name
              </Label.Root>
              <input
                className="field-input"
                id="campaign-create-name"
                onChange={event => {
                  setCreateDraft(event.target.value);
                }}
                placeholder="Untitled Campaign"
                value={createDraft ?? ''}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={handleCreateClose} type="button">
                Cancel
              </button>
              <button disabled={createMutation.isPending} onClick={handleCreateConfirm} type="button">
                Create
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleDeleteCancel();
          }
        }}
        open={pendingDeleteId !== null}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Delete campaign</Dialog.Title>
            <p style={{ margin: '1rem 0' }}>
              Delete <strong>{pendingDeleteCampaign?.name ?? 'this campaign'}</strong>? All encounters in this campaign
              will also be deleted. Characters will be unlinked but not deleted.
            </p>
            <div className="dialog-actions">
              <button onClick={handleDeleteCancel} type="button">
                Cancel
              </button>
              <button disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} type="button">
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export const Route = createFileRoute('/campaigns/')({
  component: CampaignsPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryCampaignsList);
  },
});
