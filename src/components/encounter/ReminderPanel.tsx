import * as ToggleGroup from '@radix-ui/react-toggle-group';
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

const REMINDER_KIND_CHIP_CLASS: Record<Reminder['kind'], string> = {
  concentration_save: 'chip chip-warning',
  condition_tick: 'chip chip-info',
  crit_damage_immunity: 'chip chip-success',
  damage_immunity: 'chip chip-success',
  damage_resistance: 'chip chip-info',
  damage_vulnerability: 'chip chip-warning',
  effect_expired: 'chip chip-default',
  info: 'chip chip-default',
  reaction_prompt: 'chip chip-error',
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
    <article className="card-outlined">
      <div className="card-content">
        <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 16 }}>
          <Bell color={activeCount > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)'} size={24} />
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Reminders</h2>
          <span className={activeCount > 0 ? 'chip chip-error' : 'chip chip-default'}>
            {`${String(activeCount)} active`}
          </span>
          <span className="flex-grow" />
          <ToggleGroup.Root
            aria-label="Reminder filter"
            className="radix-toggle-group"
            onValueChange={value => {
              if (value === 'active' || value === 'all') {
                setFilter(value);
              }
            }}
            type="single"
            value={filter}
          >
            <ToggleGroup.Item className="radix-toggle-item" value="active">
              Active
            </ToggleGroup.Item>
            <ToggleGroup.Item className="radix-toggle-item" value="all">
              All
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>

        {visibleReminders.length === 0 ? (
          <div className={activeCount === 0 ? 'alert alert-success' : 'alert alert-info'} role="status">
            {filter === 'active' ? 'No active reminders.' : 'No reminders yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {visibleReminders.map(reminder => {
              const combatant = reminder.combatantId == null ? null : state.combatants[reminder.combatantId];
              return (
                <div
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
                  <div style={{ flexGrow: 1 }}>
                    <div
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginBottom: 4,
                      }}
                    >
                      <span className={REMINDER_KIND_CHIP_CLASS[reminder.kind]}>
                        {REMINDER_KIND_LABEL[reminder.kind]}
                      </span>
                      {combatant != null ? <span className="chip chip-outlined">{combatant.name}</span> : null}
                    </div>
                    <p style={{ margin: 0 }}>{reminder.message}</p>
                  </div>
                  {!reminder.dismissed ? (
                    <button
                      aria-label="Dismiss reminder"
                      onClick={() => {
                        onDismissReminder(reminder.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      type="button"
                    >
                      <Check size={16} />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {filter === 'active' && activeCount > 0 ? (
          <div style={{ marginTop: 16 }}>
            <button
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
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};
