import { Badge, Box, Button, Callout, Card, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi, notFound } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
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
      <Flex direction="column" gap="4">
        <Skeleton height="48px" />
        <Skeleton height="240px" />
      </Flex>
    );
  }

  if (inviteCampaignQuery.isError) {
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Text>Failed to load invite.</Callout.Text>
      </Callout.Root>
    );
  }

  const inviteCampaign = inviteCampaignQuery.data;

  if (inviteCampaign == null) {
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Text>This invite link is invalid or has expired.</Callout.Text>
      </Callout.Root>
    );
  }

  if (joinedCampaignId != null) {
    return (
      <Flex direction="column" gap="5">
        <Callout.Root color="green" role="status">
          <Callout.Text>
            You joined <strong>{inviteCampaign.name}</strong>!
          </Callout.Text>
        </Callout.Root>
        <Box>
          <RouterLink params={{ campaignId: joinedCampaignId }} to="/campaigns/$campaignId">
            View campaign
          </RouterLink>
        </Box>
      </Flex>
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
    <Flex direction="column" gap="6">
      <Box>
        <Heading mb="2" size="6">
          Join {inviteCampaign.name}
        </Heading>
        <Text color="gray" size="3">
          Select a character to add to this campaign.
        </Text>
      </Box>

      {joinMutation.isError ? (
        <Callout.Root color="red" role="alert">
          <Callout.Text>{joinMutation.error.message}</Callout.Text>
        </Callout.Root>
      ) : null}

      {charactersQuery.isError ? (
        <Callout.Root color="red" role="alert">
          <Callout.Text>Failed to load characters.</Callout.Text>
        </Callout.Root>
      ) : null}

      {characters.length === 0 ? (
        <Callout.Root color="blue" role="status">
          <Callout.Text>You don&apos;t have any characters yet.</Callout.Text>
        </Callout.Root>
      ) : (
        <Flex direction="column" gap="4">
          {characters.map(character => {
            const isInCampaign = character.campaignName != null;

            return (
              <Card key={character.id} style={{ opacity: isInCampaign ? 0.7 : 1 }} variant="surface">
                {isInCampaign ? (
                  <Box p="4">
                    <Flex align="center" gap="2" mb="2" wrap="wrap">
                      <Heading size="4">{character.name}</Heading>
                      <Badge color="gray" variant="outline">
                        {`In campaign: ${character.campaignName}`}
                      </Badge>
                    </Flex>
                    <Text color="gray" size="2">
                      Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                      {String(character.maxHitPoints)} HP
                    </Text>
                  </Box>
                ) : (
                  <button
                    disabled={joinMutation.isPending}
                    onClick={() => {
                      handleJoinWithCharacter(character.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: joinMutation.isPending ? 'not-allowed' : 'pointer',
                      font: 'inherit',
                      padding: 'var(--space-4)',
                      textAlign: 'left',
                      width: '100%',
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
                )}
              </Card>
            );
          })}
        </Flex>
      )}

      <Box>
        <Button disabled type="button" variant="soft">
          <Plus size={18} />
          Create a new Character
        </Button>
      </Box>
    </Flex>
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
