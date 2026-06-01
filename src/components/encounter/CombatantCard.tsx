import * as Tooltip from '@radix-ui/react-tooltip';
import { Heart, Shield } from 'lucide-react';
import type { FC } from 'react';

import { STANDARD_CONDITIONS } from '../../data/conditions';
import type { Combatant, EffectDescriptor } from '../../types/encounterState';

const isStandardCondition = (provides: EffectDescriptor[]): null | string => {
  for (const descriptor of provides) {
    if (descriptor.kind === 'condition') {
      return STANDARD_CONDITIONS[descriptor.conditionId].name;
    }
  }
  return null;
};

const summarizeEffect = (provides: EffectDescriptor[], fallback: string): string => {
  const standard = isStandardCondition(provides);
  if (standard != null) {
    return standard;
  }
  return fallback;
};

const chipClassForType = (type: Combatant['type']): string =>
  type === 'monster' ? 'chip chip-error' : 'chip chip-info';

const ActionEconomyDots: FC<{ combatant: Combatant }> = ({ combatant }) => {
  const dots: { label: string; used: boolean }[] = [
    { label: 'Action', used: combatant.actionEconomy.actionUsed },
    { label: 'Bonus', used: combatant.actionEconomy.bonusActionUsed },
    { label: 'Reaction', used: combatant.actionEconomy.reactionUsed },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {dots.map(dot => (
        <Tooltip.Root key={dot.label}>
          <Tooltip.Trigger asChild>
            <span
              style={{
                backgroundColor: dot.used ? 'var(--color-text-secondary)' : 'var(--color-success)',
                border: '1px solid var(--color-divider)',
                borderRadius: '50%',
                display: 'inline-block',
                height: 8,
                width: 8,
              }}
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
              {`${dot.label}${dot.used ? ' (used)' : ''}`}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}
    </div>
  );
};

export interface CombatantCardProps {
  combatant: Combatant;
  isCurrentTurn: boolean;
  onSelect?: (combatantId: string) => void;
  selected?: boolean;
}

export const CombatantCard: FC<CombatantCardProps> = ({ combatant, isCurrentTurn, onSelect, selected = false }) => {
  const hpPercent = combatant.maxHp === 0 ? 0 : Math.min(100, (combatant.currentHp / combatant.maxHp) * 100);

  const borderColor = selected
    ? 'var(--color-primary)'
    : isCurrentTurn
      ? 'var(--color-warning)'
      : 'var(--color-divider)';

  return (
    <article
      className="card-outlined"
      style={{
        borderColor,
        borderStyle: 'solid',
        borderWidth: isCurrentTurn || selected ? 2 : 1,
      }}
    >
      <button
        className="card-action"
        onClick={() => {
          onSelect?.(combatant.id);
        }}
        style={{ padding: 16 }}
        type="button"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className={chipClassForType(combatant.type)}>{combatant.type === 'monster' ? 'M' : 'P'}</span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                  {combatant.type === 'monster' ? 'Monster' : 'Player'}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <h3 style={{ flexGrow: 1, fontSize: '1.125rem', margin: 0, textAlign: 'left' }}>{combatant.name}</h3>
            <span className="chip chip-outlined">{String(combatant.initiative ?? '—')}</span>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <Shield size={16} />
              <span>{combatant.armorClass}</span>
            </div>
            <div style={{ alignItems: 'center', display: 'flex', flexGrow: 1, gap: 8 }}>
              <Heart color="var(--color-error)" size={16} />
              <div className="progress-bar" style={{ flexGrow: 1 }}>
                <div className="progress-bar-fill" style={{ width: `${String(hpPercent)}%` }} />
              </div>
              <span>
                {String(combatant.currentHp)} / {String(combatant.maxHp)}
              </span>
            </div>
            <ActionEconomyDots combatant={combatant} />
          </div>
          {combatant.effects.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {combatant.effects.map(effect => (
                <Tooltip.Root key={effect.id}>
                  <Tooltip.Trigger asChild>
                    <span className="chip chip-outlined">
                      {`${summarizeEffect(effect.provides, effect.name)}${
                        effect.remainingRounds != null ? ` · ${String(effect.remainingRounds)}` : ''
                      }`}
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                      {effect.description}
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          ) : null}
        </div>
      </button>
    </article>
  );
};
