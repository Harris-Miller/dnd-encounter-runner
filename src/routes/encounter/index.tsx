import { Flex, Heading } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { queryEncountersList } from '../../api/encounters';
import { EncounterListReadOnly } from '../../components/encounter/encounterLists/EncounterListReadOnlyProps';
import { queryClient } from '../../queryClient';

const EncountersPage: FC = () => {
  const { data, isError, isLoading } = useQuery(queryEncountersList());

  return (
    <Flex direction="column" gap="4">
      <Heading size="5">Encounters</Heading>
      <EncounterListReadOnly encounters={data ?? []} isError={isError} isLoading={isLoading} />
    </Flex>
  );
};

export const Route = createFileRoute('/encounter/')({
  component: EncountersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryEncountersList());
  },
});
