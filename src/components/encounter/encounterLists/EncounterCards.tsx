import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Card, CardActionArea, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
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
  <Stack spacing={2}>
    {encounters.map(encounter => (
      <Card key={encounter.id} variant="outlined">
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          <CardActionArea
            onClick={() => {
              onSelectEncounter(encounter.id);
            }}
            sx={{ flexGrow: 1 }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                <Typography variant="h6">{encounter.name}</Typography>
                <Chip
                  color={encounter.active ? 'success' : 'default'}
                  label={encounter.active ? 'Active' : 'Inactive'}
                  size="small"
                />
              </Stack>
              <Typography sx={{ color: 'text.secondary' }} variant="body2">
                Round {String(encounter.round)} · {String(encounter.combatantCount)} combatant
                {encounter.combatantCount === 1 ? '' : 's'} · Updated {formatTimestamp(encounter.updatedAt)}
              </Typography>
            </CardContent>
          </CardActionArea>
          {onDeleteRequest != null ? (
            <Box sx={{ pr: 1 }}>
              <Tooltip title="Delete encounter">
                <IconButton
                  aria-label="Delete encounter"
                  color="error"
                  onClick={() => {
                    onDeleteRequest(encounter.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
        </Box>
      </Card>
    ))}
  </Stack>
);
