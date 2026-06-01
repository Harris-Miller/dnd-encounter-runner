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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: 48 }} />
        <div className="skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  if (inviteCampaignQuery.isError) {
    return (
      <div className="alert alert-error" role="alert">
        Failed to load invite.
      </div>
    );
  }

  const inviteCampaign = inviteCampaignQuery.data;

  if (inviteCampaign == null) {
    return (
      <div className="alert alert-error" role="alert">
        This invite link is invalid or has expired.
      </div>
    );
  }

  if (joinedCampaignId != null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="alert alert-success" role="status">
          You joined <strong>{inviteCampaign.name}</strong>!
        </div>
        <div>
          <RouterLink params={{ campaignId: joinedCampaignId }} to="/campaigns/$campaignId">
            View campaign
          </RouterLink>
        </div>
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Join {inviteCampaign.name}</h1>
        <p className="text-secondary" style={{ margin: 0 }}>
          Select a character to add to this campaign.
        </p>
      </div>

      {joinMutation.isError ? (
        <div className="alert alert-error" role="alert">
          {joinMutation.error.message}
        </div>
      ) : null}

      {charactersQuery.isError ? (
        <div className="alert alert-error" role="alert">
          Failed to load characters.
        </div>
      ) : null}

      {characters.length === 0 ? (
        <div className="alert alert-info" role="status">
          You don&apos;t have any characters yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {characters.map(character => {
            const isInCampaign = character.campaignName != null;

            return (
              <article className="card-outlined" key={character.id} style={{ opacity: isInCampaign ? 0.7 : 1 }}>
                {isInCampaign ? (
                  <div className="card-content">
                    <div
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <h2 style={{ fontSize: '1.125rem', margin: 0 }}>{character.name}</h2>
                      <span className="chip chip-outlined">{`In campaign: ${character.campaignName}`}</span>
                    </div>
                    <p className="text-secondary" style={{ margin: 0 }}>
                      Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                      {String(character.maxHitPoints)} HP
                    </p>
                  </div>
                ) : (
                  <button
                    className="card-action"
                    disabled={joinMutation.isPending}
                    onClick={() => {
                      handleJoinWithCharacter(character.id);
                    }}
                    type="button"
                  >
                    <div className="card-content">
                      <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.5rem' }}>{character.name}</h2>
                      <p className="text-secondary" style={{ margin: 0 }}>
                        Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                        {String(character.maxHitPoints)} HP
                      </p>
                    </div>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div>
        <button
          disabled
          style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem', opacity: 0.6 }}
          type="button"
        >
          <Plus size={18} />
          Create a new Character
        </button>
      </div>
    </div>
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
