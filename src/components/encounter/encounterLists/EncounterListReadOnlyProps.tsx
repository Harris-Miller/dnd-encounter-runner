import { Callout, Flex, Skeleton } from '@radix-ui/themes';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

import type { EncounterListItem } from '../../../api/encounters';

import { EncounterCards } from './EncounterCards';

export interface EncounterListReadOnlyProps {
  emptyMessage?: string;
  encounters: EncounterListItem[];
  isError: boolean;
  isLoading: boolean;
}

export const EncounterListReadOnly: FC<EncounterListReadOnlyProps> = ({
  emptyMessage = 'No encounters yet. Create encounters from a campaign.',
  encounters,
  isError,
  isLoading,
}) => {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="4">
      {isLoading ? (
        <Flex direction="column" gap="4">
          <Skeleton height="96px" />
          <Skeleton height="96px" />
        </Flex>
      ) : null}

      {isError ? (
        <Callout.Root color="red" role="alert">
          <Callout.Text>Failed to load encounters.</Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && encounters.length === 0 ? (
        <Callout.Root color="blue" role="status">
          <Callout.Text>{emptyMessage}</Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && encounters.length > 0 ? (
        <EncounterCards
          encounters={encounters}
          onSelectEncounter={encounterId => {
            navigate({ params: { encounterId }, to: '/encounter/$encounterId' });
          }}
        />
      ) : null}
    </Flex>
  );
};
