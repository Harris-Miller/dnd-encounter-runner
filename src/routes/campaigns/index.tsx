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
    <Flex direction="column" gap="5">
      <Flex align="center" gap="4">
        <Heading size="6">Campaigns</Heading>
        <Box flexGrow="1" />
        <Button onClick={handleCreateOpen} type="button">
          <Plus size={18} />
          New campaign
        </Button>
      </Flex>

      {isLoading ? (
        <Flex direction="column" gap="4">
          <Skeleton height="96px" />
          <Skeleton height="96px" />
        </Flex>
      ) : null}

      {isError ? (
        <Callout.Root color="red" role="alert">
          <Callout.Text>Failed to load campaigns.</Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && campaigns.length === 0 ? (
        <Callout.Root color="blue" role="status">
          <Callout.Text>
            No campaigns yet. Click <strong>New campaign</strong> to get started.
          </Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && campaigns.length > 0 ? (
        <Flex direction="column" gap="4">
          {campaigns.map(campaign => (
            <Card key={campaign.id} variant="surface">
              <Flex align="center">
                <button
                  onClick={() => {
                    navigate({ params: { campaignId: campaign.id }, to: '/campaigns/$campaignId' });
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
                    {campaign.name}
                  </Heading>
                  <Text color="gray" size="2">
                    Updated {formatTimestamp(campaign.updatedAt)}
                  </Text>
                </button>
                <Box pr="2">
                  <Tooltip content="Delete campaign">
                    <IconButton
                      aria-label="Delete campaign"
                      color="red"
                      onClick={() => {
                        handleDeleteRequest(campaign.id);
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Flex>
            </Card>
          ))}
        </Flex>
      ) : null}

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleCreateClose();
          }
        }}
        open={createOpen}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>New campaign</Dialog.Title>
          <Flex direction="column" gap="1" mt="4">
            <Text as="label" htmlFor="campaign-create-name" size="2" weight="medium">
              Campaign name
            </Text>
            <TextField.Root
              id="campaign-create-name"
              onChange={event => {
                setCreateDraft(event.target.value);
              }}
              placeholder="Untitled Campaign"
              value={createDraft ?? ''}
            />
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleCreateClose} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={createMutation.isPending} onClick={handleCreateConfirm} type="button">
              Create
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleDeleteCancel();
          }
        }}
        open={pendingDeleteId !== null}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Delete campaign</Dialog.Title>
          <Text as="p" mt="4">
            Delete <strong>{pendingDeleteCampaign?.name ?? 'this campaign'}</strong>? All encounters in this campaign
            will also be deleted. Characters will be unlinked but not deleted.
          </Text>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleDeleteCancel} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button color="red" disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} type="button">
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
};

export const Route = createFileRoute('/campaigns/')({
  component: CampaignsPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryCampaignsList);
  },
});
