import { Badge, Box, Card, Flex, Heading, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { FC } from 'react';

import type { EncounterListItem } from '../../../api/encounters';

const formatTimestamp = (raw: string): string => {
  if (raw === '') return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
};

interface EncounterCardsProps {
  encounters: EncounterListItem[];
  onDeleteRequest?: (encounterId: string) => void;
  onSelectEncounter: (encounterId: string) => void;
}

export const EncounterCards: FC<EncounterCardsProps> = ({ encounters, onDeleteRequest, onSelectEncounter }) => (
  <Flex direction="column" gap="4">
    {encounters.map(encounter => (
      <Card key={encounter.id} variant="surface">
        <Flex align="center">
          <button
            onClick={() => {
              onSelectEncounter(encounter.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              flexGrow: 1,
              font: 'inherit',
              padding: 'var(--space-4)',
              textAlign: 'left',
            }}
            type="button"
          >
            <Flex align="center" gap="2" mb="2" wrap="wrap">
              <Heading size="4">{encounter.name}</Heading>
              <Badge color={encounter.active ? 'green' : 'gray'} variant="soft">
                {encounter.active ? 'Active' : 'Inactive'}
              </Badge>
            </Flex>
            <Text color="gray" size="2">
              Round {String(encounter.round)} · {String(encounter.combatantCount)} combatant
              {encounter.combatantCount === 1 ? '' : 's'} · Updated {formatTimestamp(encounter.updatedAt)}
            </Text>
          </button>
          {onDeleteRequest != null ? (
            <Box pr="2">
              <Tooltip content="Delete encounter">
                <IconButton
                  aria-label="Delete encounter"
                  color="red"
                  onClick={() => {
                    onDeleteRequest(encounter.id);
                  }}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
        </Flex>
      </Card>
    ))}
  </Flex>
);
