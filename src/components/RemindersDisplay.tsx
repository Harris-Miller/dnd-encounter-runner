import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { FC } from 'react';

import { useEncounter } from '../contexts/EncounterContext';

export const RemindersDisplay: FC = () => {
  const { encounter, clearReminderLog } = useEncounter();

  const sortedReminders = useMemo(() => {
    if (!encounter) {
      return [];
    }
    return [...encounter.reminderLog].sort((a, b) => b.timestamp - a.timestamp);
  }, [encounter]);

  if (!encounter) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h5">Reminder Log</Typography>
          {sortedReminders.length > 0 && (
            <Button onClick={clearReminderLog} size="small" startIcon={<ClearIcon />}>
              Clear Log
            </Button>
          )}
        </Box>

        {sortedReminders.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No reminders yet. Record actions to generate reminders.
          </Typography>
        ) : (
          <List>
            {sortedReminders.map(reminder => (
              <ListItem
                key={reminder.id}
                sx={{
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                  borderLeft: '3px solid',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={reminder.message}
                  secondary={`${new Date(reminder.timestamp).toLocaleTimeString()} - ${reminder.triggerEvent}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
