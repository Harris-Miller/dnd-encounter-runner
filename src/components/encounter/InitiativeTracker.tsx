import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
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
    <Card size="3" variant="surface">
      <Flex align="center" gap="4" mb="4">
        <Heading size="4">Initiative</Heading>
        <Box flexGrow="1" />
        <Text color="gray" size="2">
          Round {String(state.round)}
        </Text>
        <Button disabled={isAdvancing === true || ordered.length === 0} onClick={onAdvanceTurn} type="button">
          <SkipForward size={18} />
          Next turn
        </Button>
      </Flex>
      {ordered.length === 0 ? (
        <Text color="gray" size="2">
          No combatants yet. Add players and monsters to start tracking initiative.
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {ordered.map((combatant, index) => (
            <CombatantCard
              combatant={combatant}
              isCurrentTurn={index === state.turnIndex}
              key={combatant.id}
              onSelect={onSelectCombatant}
              selected={combatant.id === selectedCombatantId}
            />
          ))}
        </Flex>
      )}
    </Card>
  );
};
