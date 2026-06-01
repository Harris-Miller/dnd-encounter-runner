import { SkipForward } from 'lucide-react';
import type { FC } from 'react';

import type { EncounterState } from '../../types/encounterState';
import { Box } from '../ui/Box';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Stack } from '../ui/Stack';
import { Typography } from '../ui/Typography';

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
    <Card variant="outlined">
      <CardContent>
        <Box style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 16 }}>
          <Typography variant="h6">Initiative</Typography>
          <span className="flex-grow" />
          <Typography className="text-secondary" variant="body2">
            Round {String(state.round)}
          </Typography>
          <Button
            disabled={isAdvancing === true || ordered.length === 0}
            onClick={onAdvanceTurn}
            startIcon={<SkipForward size={18} />}
            type="button"
            variant="contained"
          >
            Next turn
          </Button>
        </Box>
        {ordered.length === 0 ? (
          <Typography className="text-secondary" variant="body2">
            No combatants yet. Add players and monsters to start tracking initiative.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {ordered.map((combatant, index) => (
              <CombatantCard
                combatant={combatant}
                isCurrentTurn={index === state.turnIndex}
                key={combatant.id}
                onSelect={onSelectCombatant}
                selected={combatant.id === selectedCombatantId}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
