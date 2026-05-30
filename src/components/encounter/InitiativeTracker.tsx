import SkipNextIcon from '@mui/icons-material/SkipNext';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
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
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, mb: 2 }}>
          <Typography variant="h6">Initiative</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography sx={{ color: 'text.secondary' }} variant="body2">
            Round {String(state.round)}
          </Typography>
          <Button
            disabled={isAdvancing === true || ordered.length === 0}
            onClick={onAdvanceTurn}
            size="small"
            startIcon={<SkipNextIcon />}
            variant="contained"
          >
            Next turn
          </Button>
        </Box>
        {ordered.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }} variant="body2">
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
