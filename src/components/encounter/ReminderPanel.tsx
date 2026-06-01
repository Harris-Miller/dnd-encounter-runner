import CheckIcon from '@mui/icons-material/Check';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { FC } from 'react';

import type { EncounterState, Reminder } from '../../types/encounterState';

const REMINDER_KIND_LABEL: Record<Reminder['kind'], string> = {
  concentration_save: 'Concentration save',
  condition_tick: 'Condition tick',
  crit_damage_immunity: 'Crit immunity',
  damage_immunity: 'Damage immunity',
  damage_resistance: 'Damage resistance',
  damage_vulnerability: 'Damage vulnerability',
  effect_expired: 'Effect ended',
  info: 'Info',
  reaction_prompt: 'Reaction prompt',
};

const REMINDER_KIND_COLOR: Record<Reminder['kind'], 'default' | 'error' | 'info' | 'success' | 'warning'> = {
  concentration_save: 'warning',
  condition_tick: 'info',
  crit_damage_immunity: 'success',
  damage_immunity: 'success',
  damage_resistance: 'info',
  damage_vulnerability: 'warning',
  effect_expired: 'default',
  info: 'default',
  reaction_prompt: 'error',
};

type FilterMode = 'active' | 'all';

export interface ReminderPanelProps {
  onDismissReminder: (reminderId: string) => void;
  state: EncounterState;
}

export const ReminderPanel: FC<ReminderPanelProps> = ({ onDismissReminder, state }) => {
  const [filter, setFilter] = useState<FilterMode>('active');

  const allReminders = state.reminders.toSorted((left, right) => right.ts.localeCompare(left.ts));
  const visibleReminders = filter === 'active' ? allReminders.filter(reminder => !reminder.dismissed) : allReminders;
  const activeCount = allReminders.filter(reminder => !reminder.dismissed).length;

  const handleFilterChange = (_event: unknown, next: FilterMode | null) => {
    if (next !== null) {
      setFilter(next);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, mb: 2 }}>
          <NotificationsActiveIcon color={activeCount > 0 ? 'error' : 'disabled'} />
          <Typography variant="h6">Reminders</Typography>
          <Chip color={activeCount > 0 ? 'error' : 'default'} label={`${String(activeCount)} active`} size="small" />
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup exclusive onChange={handleFilterChange} size="small" value={filter}>
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {visibleReminders.length === 0 ? (
          <Alert severity={activeCount === 0 ? 'success' : 'info'}>
            {filter === 'active' ? 'No active reminders.' : 'No reminders yet.'}
          </Alert>
        ) : (
          <Stack spacing={1}>
            {visibleReminders.map(reminder => {
              const combatant = reminder.combatantId == null ? null : state.combatants[reminder.combatantId];
              return (
                <Box
                  key={reminder.id}
                  sx={{
                    alignItems: 'flex-start',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    display: 'flex',
                    gap: 1,
                    opacity: reminder.dismissed ? 0.5 : 1,
                    p: 1.5,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}
                    >
                      <Chip
                        color={REMINDER_KIND_COLOR[reminder.kind]}
                        label={REMINDER_KIND_LABEL[reminder.kind]}
                        size="small"
                      />
                      {combatant != null && <Chip label={combatant.name} size="small" variant="outlined" />}
                    </Stack>
                    <Typography variant="body2">{reminder.message}</Typography>
                  </Box>
                  {!reminder.dismissed && (
                    <Tooltip title="Dismiss">
                      <IconButton
                        aria-label="Dismiss reminder"
                        onClick={() => {
                          onDismissReminder(reminder.id);
                        }}
                        size="small"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}

        {filter === 'active' && activeCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Button
              onClick={() => {
                allReminders
                  .filter(reminder => !reminder.dismissed)
                  .forEach(reminder => {
                    onDismissReminder(reminder.id);
                  });
              }}
              size="small"
            >
              Dismiss all
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
