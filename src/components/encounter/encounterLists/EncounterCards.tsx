import * as Tooltip from '@radix-ui/react-tooltip';
import { Trash2 } from 'lucide-react';
import type { FC } from 'react';

import type { EncounterListItem } from '../../../api/encounters';

const formatTimestamp = (raw: string): string => {
  if (raw === '') return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
};

const chipClassForActive = (active: boolean): string => (active ? 'chip chip-success' : 'chip chip-default');

interface EncounterCardsProps {
  encounters: EncounterListItem[];
  onDeleteRequest?: (encounterId: string) => void;
  onSelectEncounter: (encounterId: string) => void;
}

export const EncounterCards: FC<EncounterCardsProps> = ({ encounters, onDeleteRequest, onSelectEncounter }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {encounters.map(encounter => (
      <article className="card-outlined" key={encounter.id}>
        <div style={{ alignItems: 'center', display: 'flex' }}>
          <button
            className="card-action"
            onClick={() => {
              onSelectEncounter(encounter.id);
            }}
            style={{ flexGrow: 1 }}
            type="button"
          >
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
                <h2 style={{ fontSize: '1.125rem', margin: 0 }}>{encounter.name}</h2>
                <span className={chipClassForActive(encounter.active)}>{encounter.active ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-secondary" style={{ margin: 0 }}>
                Round {String(encounter.round)} · {String(encounter.combatantCount)} combatant
                {encounter.combatantCount === 1 ? '' : 's'} · Updated {formatTimestamp(encounter.updatedAt)}
              </p>
            </div>
          </button>
          {onDeleteRequest != null ? (
            <div style={{ paddingRight: 8 }}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    aria-label="Delete encounter"
                    onClick={() => {
                      onDeleteRequest(encounter.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                    type="button"
                  >
                    <Trash2 color="var(--color-error)" size={20} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                    Delete encounter
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          ) : null}
        </div>
      </article>
    ))}
  </div>
);
