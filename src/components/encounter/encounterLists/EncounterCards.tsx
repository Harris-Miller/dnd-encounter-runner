import { Trash2 } from 'lucide-react';
import type { FC } from 'react';

import type { EncounterListItem } from '../../../api/encounters';
import { Box } from '../../compat/Box';
import { Card, CardActionArea, CardContent } from '../../compat/Card';
import { Chip } from '../../compat/Chip';
import { IconButton } from '../../compat/IconButton';
import { Stack } from '../../compat/Stack';
import { Tooltip } from '../../compat/Tooltip';
import { Typography } from '../../compat/Typography';

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
  <Stack spacing={2}>
    {encounters.map(encounter => (
      <Card key={encounter.id} variant="outlined">
        <Box style={{ alignItems: 'center', display: 'flex' }}>
          <CardActionArea
            onClick={() => {
              onSelectEncounter(encounter.id);
            }}
            style={{ flexGrow: 1 }}
          >
            <CardContent>
              <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                spacing={1}
                style={{ gap: 8, marginBottom: 32 }}
              >
                <Typography variant="h6">{encounter.name}</Typography>
                <Chip
                  color={encounter.active ? 'success' : 'default'}
                  label={encounter.active ? 'Active' : 'Inactive'}
                  size="small"
                />
              </Stack>
              <Typography className="text-secondary" variant="body2">
                Round {String(encounter.round)} · {String(encounter.combatantCount)} combatant
                {encounter.combatantCount === 1 ? '' : 's'} · Updated {formatTimestamp(encounter.updatedAt)}
              </Typography>
            </CardContent>
          </CardActionArea>
          {onDeleteRequest != null ? (
            <Box style={{ paddingRight: 8 }}>
              <Tooltip title="Delete encounter">
                <IconButton
                  aria-label="Delete encounter"
                  onClick={() => {
                    onDeleteRequest(encounter.id);
                  }}
                  type="button"
                >
                  <Trash2 color="var(--color-error)" size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
        </Box>
      </Card>
    ))}
  </Stack>
);
