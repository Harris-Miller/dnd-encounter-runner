import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryEncountersList } from '../../api/encounters';
import { EncounterListReadOnly } from '../../components/encounter/encounterLists/EncounterListReadOnlyProps';
import { Stack } from '../../components/ui/Stack';
import { Typography } from '../../components/ui/Typography';
import { queryClient } from '../../queryClient';

const EncountersPage: FC = () => {
  const { data, isError, isLoading } = useQuery(queryEncountersList());

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Encounters</Typography>
      <EncounterListReadOnly encounters={data ?? []} isError={isError} isLoading={isLoading} />
    </Stack>
  );
};

export const Route = createFileRoute('/encounter/')({
  component: EncountersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryEncountersList());
  },
});
