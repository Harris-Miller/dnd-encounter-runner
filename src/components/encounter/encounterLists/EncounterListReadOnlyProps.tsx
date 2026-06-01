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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 96 }} />
          <div className="skeleton" style={{ height: 96 }} />
        </div>
      ) : null}

      {isError ? (
        <div className="alert alert-error" role="alert">
          Failed to load encounters.
        </div>
      ) : null}

      {!isLoading && !isError && encounters.length === 0 ? (
        <div className="alert alert-info" role="status">
          {emptyMessage}
        </div>
      ) : null}

      {!isLoading && !isError && encounters.length > 0 ? (
        <EncounterCards
          encounters={encounters}
          onSelectEncounter={encounterId => {
            navigate({ params: { encounterId }, to: '/encounter/$encounterId' });
          }}
        />
      ) : null}
    </div>
  );
};
