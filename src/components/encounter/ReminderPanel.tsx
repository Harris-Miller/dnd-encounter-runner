import { Badge, Box, Button, Callout, Card, Flex, Heading, IconButton, SegmentedControl, Text } from '@radix-ui/themes';
import { Bell, Check } from 'lucide-react';
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

const REMINDER_KIND_COLOR: Record<Reminder['kind'], 'blue' | 'gray' | 'green' | 'orange' | 'red' | 'yellow'> = {
  concentration_save: 'yellow',
  condition_tick: 'blue',
  crit_damage_immunity: 'green',
  damage_immunity: 'green',
  damage_resistance: 'blue',
  damage_vulnerability: 'orange',
  effect_expired: 'gray',
  info: 'gray',
  reaction_prompt: 'red',
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

  return (
    <Card size="3" variant="surface">
      <Flex align="center" gap="4" mb="4">
        <Bell color={activeCount > 0 ? 'var(--red-9)' : 'var(--gray-9)'} size={24} />
        <Heading size="4">Reminders</Heading>
        <Badge color={activeCount > 0 ? 'red' : 'gray'} variant="soft">
          {`${String(activeCount)} active`}
        </Badge>
        <Box flexGrow="1" />
        <SegmentedControl.Root
          onValueChange={value => {
            if (value === 'active' || value === 'all') {
              setFilter(value);
            }
          }}
          value={filter}
        >
          <SegmentedControl.Item value="active">Active</SegmentedControl.Item>
          <SegmentedControl.Item value="all">All</SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      {visibleReminders.length === 0 ? (
        <Callout.Root color={activeCount === 0 ? 'green' : 'blue'} role="status">
          <Callout.Text>{filter === 'active' ? 'No active reminders.' : 'No reminders yet.'}</Callout.Text>
        </Callout.Root>
      ) : (
        <Flex direction="column" gap="2">
          {visibleReminders.map(reminder => {
            const combatant = reminder.combatantId == null ? null : state.combatants[reminder.combatantId];
            return (
              <Card
                key={reminder.id}
                style={{ opacity: reminder.dismissed ? 0.5 : 1 }}
                variant={reminder.dismissed ? 'ghost' : 'surface'}
              >
                <Flex align="start" gap="2" p="3">
                  <Flex direction="column" flexGrow="1" gap="1">
                    <Flex align="center" gap="1" wrap="wrap">
                      <Badge color={REMINDER_KIND_COLOR[reminder.kind]} variant="soft">
                        {REMINDER_KIND_LABEL[reminder.kind]}
                      </Badge>
                      {combatant != null ? (
                        <Badge color="gray" variant="outline">
                          {combatant.name}
                        </Badge>
                      ) : null}
                    </Flex>
                    <Text size="2">{reminder.message}</Text>
                  </Flex>
                  {!reminder.dismissed ? (
                    <IconButton
                      aria-label="Dismiss reminder"
                      color="gray"
                      onClick={() => {
                        onDismissReminder(reminder.id);
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Check size={16} />
                    </IconButton>
                  ) : null}
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}

      {filter === 'active' && activeCount > 0 ? (
        <Flex mt="4">
          <Button
            color="gray"
            onClick={() => {
              allReminders
                .filter(reminder => !reminder.dismissed)
                .forEach(reminder => {
                  onDismissReminder(reminder.id);
                });
            }}
            type="button"
            variant="soft"
          >
            Dismiss all
          </Button>
        </Flex>
      ) : null}
    </Card>
  );
};
