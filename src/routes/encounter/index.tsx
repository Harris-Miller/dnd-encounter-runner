import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryEncountersList } from '../../api/encounters';
import { EncounterListReadOnly } from '../../components/encounter/encounterLists/EncounterListReadOnlyProps';
import { queryClient } from '../../queryClient';

const EncountersPage: FC = () => {
  const { data, isError, isLoading } = useQuery(queryEncountersList());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Encounters</h1>
      <EncounterListReadOnly encounters={data ?? []} isError={isError} isLoading={isLoading} />
    </div>
  );
};

export const Route = createFileRoute('/encounter/')({
  component: EncountersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryEncountersList());
  },
});
