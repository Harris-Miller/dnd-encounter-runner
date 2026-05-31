import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateJoinCampaignViaInvite, queryInviteCampaign, queryMyCharactersWithCampaign } from '../../api/invites';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';
import { fetchQueryOrNotFound } from '../../utils/fetchQueryOrNotFound';

const routeApi = getRouteApi('/invite/$inviteId');

const InvitePage: FC = () => {
  const { inviteId } = routeApi.useParams();
  const inviteCampaignQuery = useQuery(queryInviteCampaign(inviteId));
  const charactersQuery = useQuery(queryMyCharactersWithCampaign);
  const joinMutation = useMutation({
    ...mutateJoinCampaignViaInvite,
    mutationKey: ['invites', inviteId, 'join'],
  });

  const [joinedCampaignId, setJoinedCampaignId] = useState<null | string>(null);

  if (inviteCampaignQuery.isLoading || charactersQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={48} variant="rectangular" />
        <Skeleton height={240} variant="rectangular" />
      </Stack>
    );
  }

  if (inviteCampaignQuery.isError) {
    return <Alert severity="error">Failed to load invite.</Alert>;
  }

  const inviteCampaign = inviteCampaignQuery.data;

  if (inviteCampaign == null) {
    return <Alert severity="error">This invite link is invalid or has expired.</Alert>;
  }

  if (joinedCampaignId != null) {
    return (
      <Stack spacing={3}>
        <Alert severity="success">
          You joined <strong>{inviteCampaign.name}</strong>!
        </Alert>
        <Box>
          <RouterLink params={{ campaignId: joinedCampaignId }} to="/campaigns/$campaignId">
            View campaign
          </RouterLink>
        </Box>
      </Stack>
    );
  }

  const characters = charactersQuery.data ?? [];

  const handleJoinWithCharacter = (characterId: string) => {
    joinMutation.mutate(
      { characterId, inviteId },
      {
        onSuccess: ({ campaignId }) => {
          setJoinedCampaignId(campaignId);
        },
      },
    );
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4">Join {inviteCampaign.name}</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }} variant="body2">
          Select a character to add to this campaign.
        </Typography>
      </Box>

      {joinMutation.isError ? <Alert severity="error">{joinMutation.error.message}</Alert> : null}

      {charactersQuery.isError ? <Alert severity="error">Failed to load characters.</Alert> : null}

      {characters.length === 0 ? (
        <Alert severity="info">You don&apos;t have any characters yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {characters.map(character => {
            const isInCampaign = character.campaignName != null;

            return (
              <Card key={character.id} sx={{ opacity: isInCampaign ? 0.7 : 1 }} variant="outlined">
                {isInCampaign ? (
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6">{character.name}</Typography>
                      <Chip label={`In campaign: ${character.campaignName}`} size="small" variant="outlined" />
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }} variant="body2">
                      Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                      {String(character.maxHitPoints)} HP
                    </Typography>
                  </CardContent>
                ) : (
                  <CardActionArea
                    disabled={joinMutation.isPending}
                    onClick={() => {
                      handleJoinWithCharacter(character.id);
                    }}
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
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      <Box>
        <Button disabled startIcon={<AddIcon />} variant="outlined">
          Create a new Character
        </Button>
      </Box>
    </Stack>
  );
};

export const Route = createFileRoute('/invite/$inviteId')({
  component: InvitePage,
  loader: async ({ params }) => {
    const { inviteId } = params;
    const [inviteCampaign] = await Promise.all([
      fetchQueryOrNotFound(queryClient, queryInviteCampaign(inviteId)),
      fetchQueryOrNotFound(queryClient, queryMyCharactersWithCampaign),
    ]);

    if (inviteCampaign == null) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router notFound API
      throw notFound();
    }
  },
});
