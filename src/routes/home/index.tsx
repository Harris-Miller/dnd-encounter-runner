import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, Users } from 'lucide-react';
import type { FC } from 'react';

import { queryProfile } from '../../api/profile';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';

const HomePage: FC = () => {
  const { data: profile } = useQuery(queryProfile);
  const displayName = profile?.name ?? 'there';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Welcome, {displayName}</h1>
        <p className="text-secondary" style={{ margin: 0 }}>
          Organize campaigns and manage your party from here.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        }}
      >
        <article className="card-outlined">
          <RouterLink style={{ color: 'inherit', textDecoration: 'none' }} to="/campaigns">
            <div className="card-content" style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
              <BookOpen color="var(--color-primary)" size={32} />
              <div>
                <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.25rem' }}>Campaigns</h2>
                <p className="text-secondary" style={{ margin: 0 }}>
                  Organize characters and encounters by campaign
                </p>
              </div>
            </div>
          </RouterLink>
        </article>

        <article className="card-outlined">
          <RouterLink style={{ color: 'inherit', textDecoration: 'none' }} to="/characters">
            <div className="card-content" style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
              <Users color="var(--color-primary)" size={32} />
              <div>
                <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.25rem' }}>Characters</h2>
                <p className="text-secondary" style={{ margin: 0 }}>
                  Manage player characters and stats
                </p>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/home/')({
  component: HomePage,
  loader: async () => {
    await queryClient.ensureQueryData(queryProfile);
  },
});
