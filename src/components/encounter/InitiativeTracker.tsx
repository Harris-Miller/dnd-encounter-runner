import { SkipForward } from 'lucide-react';
import type { FC } from 'react';

import type { EncounterState } from '../../types/encounterState';

import { CombatantCard } from './CombatantCard';

export interface InitiativeTrackerProps {
  isAdvancing?: boolean;
  onAdvanceTurn: () => void;
  onSelectCombatant?: (combatantId: string) => void;
  selectedCombatantId?: null | string;
  state: EncounterState;
}

export const InitiativeTracker: FC<InitiativeTrackerProps> = ({
  isAdvancing,
  onAdvanceTurn,
  onSelectCombatant,
  selectedCombatantId,
  state,
}) => {
  const ordered = state.initiativeOrder.map(id => state.combatants[id]).filter(combatant => combatant != null);

  return (
    <article className="card-outlined">
      <div className="card-content">
        <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Initiative</h2>
          <span className="flex-grow" />
          <p className="text-secondary" style={{ margin: 0 }}>
            Round {String(state.round)}
          </p>
          <button
            disabled={isAdvancing === true || ordered.length === 0}
            onClick={onAdvanceTurn}
            style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
            type="button"
          >
            <SkipForward size={18} />
            Next turn
          </button>
        </div>
        {ordered.length === 0 ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            No combatants yet. Add players and monsters to start tracking initiative.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ordered.map((combatant, index) => (
              <CombatantCard
                combatant={combatant}
                isCurrentTurn={index === state.turnIndex}
                key={combatant.id}
                onSelect={onSelectCombatant}
                selected={combatant.id === selectedCombatantId}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
