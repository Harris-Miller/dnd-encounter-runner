import { Bell, Check } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import type { EncounterState, Reminder } from '../../types/encounterState';
import { Alert } from '../ui/Alert';
import { Box } from '../ui/Box';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { IconButton } from '../ui/IconButton';
import { Stack } from '../ui/Stack';
import { ToggleButton, ToggleButtonGroup } from '../ui/ToggleButtonGroup';
import { Typography } from '../ui/Typography';

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

  const handleFilterChange = (_event: unknown, next: null | string) => {
    if (next === 'active' || next === 'all') {
      setFilter(next);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 16 }}>
          <Bell color={activeCount > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)'} size={24} />
          <Typography variant="h6">Reminders</Typography>
          <Chip color={activeCount > 0 ? 'error' : 'default'} label={`${String(activeCount)} active`} size="small" />
          <span className="flex-grow" />
          <ToggleButtonGroup exclusive onChange={handleFilterChange} value={filter}>
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
                  style={{
                    alignItems: 'flex-start',
                    border: '1px solid var(--color-divider)',
                    borderRadius: 8,
                    display: 'flex',
                    gap: 8,
                    opacity: reminder.dismissed ? 0.5 : 1,
                    padding: 12,
                  }}
                >
                  <Box style={{ flexGrow: 1 }}>
                    <Stack
                      alignItems="center"
                      direction="row"
                      flexWrap="wrap"
                      spacing={1}
                      style={{ gap: 4, marginBottom: 4 }}
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
                    <IconButton
                      aria-label="Dismiss reminder"
                      onClick={() => {
                        onDismissReminder(reminder.id);
                      }}
                      type="button"
                    >
                      <Check size={16} />
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}

        {filter === 'active' && activeCount > 0 && (
          <Box style={{ marginTop: 16 }}>
            <Button
              onClick={() => {
                allReminders
                  .filter(reminder => !reminder.dismissed)
                  .forEach(reminder => {
                    onDismissReminder(reminder.id);
                  });
              }}
              type="button"
            >
              Dismiss all
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
