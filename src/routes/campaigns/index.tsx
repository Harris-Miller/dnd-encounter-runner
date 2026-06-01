import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateCampaign, mutateDeleteCampaign, queryCampaignsList } from '../../api/campaigns';
import { Alert } from '../../components/ui/Alert';
import { Box } from '../../components/ui/Box';
import { Button } from '../../components/ui/Button';
import { Card, CardActionArea, CardContent } from '../../components/ui/Card';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../../components/ui/Dialog';
import { IconButton } from '../../components/ui/IconButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { Stack } from '../../components/ui/Stack';
import { TextField } from '../../components/ui/TextField';
import { Tooltip } from '../../components/ui/Tooltip';
import { Typography } from '../../components/ui/Typography';
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
    <Stack spacing={3}>
      <Box style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Box style={{ flexGrow: 1 }} />
        <Button onClick={handleCreateOpen} startIcon={<Plus />} variant="contained">
          New campaign
        </Button>
      </Box>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton height={96} variant="rectangular" />
          <Skeleton height={96} variant="rectangular" />
        </Stack>
      ) : null}

      {isError ? <Alert severity="error">Failed to load campaigns.</Alert> : null}

      {!isLoading && !isError && campaigns.length === 0 && (
        <Alert severity="info">
          No campaigns yet. Click <strong>New campaign</strong> to get started.
        </Alert>
      )}

      {!isLoading && !isError && campaigns.length > 0 && (
        <Stack spacing={2}>
          {campaigns.map(campaign => (
            <Card key={campaign.id} variant="outlined">
              <Box style={{ alignItems: 'center', display: 'flex' }}>
                <CardActionArea
                  onClick={() => {
                    navigate({ params: { campaignId: campaign.id }, to: '/campaigns/$campaignId' });
                  }}
                  style={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Typography style={{ marginBottom: 32 }} variant="h6">
                      {campaign.name}
                    </Typography>
                    <Typography style={{ color: 'var(--color-text-secondary)' }} variant="body2">
                      Updated {formatTimestamp(campaign.updatedAt)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Box style={{ paddingRight: 8 }}>
                  <Tooltip title="Delete campaign">
                    <IconButton
                      aria-label="Delete campaign"
                      onClick={() => {
                        handleDeleteRequest(campaign.id);
                      }}
                    >
                      <Trash2 />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog maxWidth="sm" onClose={handleCreateClose} open={createOpen}>
        <DialogTitle>New campaign</DialogTitle>
        <DialogContent>
          <Box style={{ paddingTop: 8 }}>
            <TextField
              label="Campaign name"
              onChange={event => {
                setCreateDraft(event.target.value);
              }}
              placeholder="Untitled Campaign"
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

      <Dialog maxWidth="sm" onClose={handleDeleteCancel} open={pendingDeleteId !== null}>
        <DialogTitle>Delete campaign</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Delete <strong>{pendingDeleteCampaign?.name ?? 'this campaign'}</strong>? All encounters in this campaign
            will also be deleted. Characters will be unlinked but not deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const Route = createFileRoute('/campaigns/')({
  component: CampaignsPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryCampaignsList);
  },
});
