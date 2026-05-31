import { Alert, Skeleton, Stack } from '@mui/material';
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
    <Stack spacing={2}>
      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton height={96} variant="rectangular" />
          <Skeleton height={96} variant="rectangular" />
        </Stack>
      ) : null}

      {isError ? <Alert severity="error">Failed to load encounters.</Alert> : null}

      {!isLoading && !isError && encounters.length === 0 && <Alert severity="info">{emptyMessage}</Alert>}

      {!isLoading && !isError && encounters.length > 0 && (
        <EncounterCards
          encounters={encounters}
          onSelectEncounter={encounterId => {
            navigate({ params: { encounterId }, to: '/encounter/$encounterId' });
          }}
        />
      )}
    </Stack>
  );
};
