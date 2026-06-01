import { Badge, Box, Card, Flex, Heading, Progress, Tooltip } from '@radix-ui/themes';
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

const typeBadgeColor = (type: Combatant['type']): 'blue' | 'red' => (type === 'monster' ? 'red' : 'blue');

const ActionEconomyDots: FC<{ combatant: Combatant }> = ({ combatant }) => {
  const dots: { label: string; used: boolean }[] = [
    { label: 'Action', used: combatant.actionEconomy.actionUsed },
    { label: 'Bonus', used: combatant.actionEconomy.bonusActionUsed },
    { label: 'Reaction', used: combatant.actionEconomy.reactionUsed },
  ];

  return (
    <Flex gap="2">
      {dots.map(dot => (
        <Tooltip content={`${dot.label}${dot.used ? ' (used)' : ''}`} key={dot.label}>
          <Box
            style={{
              backgroundColor: dot.used ? 'var(--gray-9)' : 'var(--green-9)',
              border: '1px solid var(--gray-a6)',
              borderRadius: '50%',
              display: 'inline-block',
              height: 8,
              width: 8,
            }}
          />
        </Tooltip>
      ))}
    </Flex>
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

  const borderColor = selected ? 'var(--red-9)' : isCurrentTurn ? 'var(--amber-9)' : undefined;

  return (
    <Card
      style={{
        borderColor,
        borderStyle: 'solid',
        borderWidth: isCurrentTurn || selected ? 2 : 1,
        cursor: onSelect != null ? 'pointer' : undefined,
      }}
      variant="surface"
    >
      <button
        onClick={() => {
          onSelect?.(combatant.id);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: onSelect != null ? 'pointer' : 'default',
          font: 'inherit',
          padding: 'var(--space-4)',
          textAlign: 'left',
          width: '100%',
        }}
        type="button"
      >
        <Flex direction="column" gap="2">
          <Flex align="center" gap="2">
            <Tooltip content={combatant.type === 'monster' ? 'Monster' : 'Player'}>
              <Badge color={typeBadgeColor(combatant.type)} variant="soft">
                {combatant.type === 'monster' ? 'M' : 'P'}
              </Badge>
            </Tooltip>
            <Heading size="4" style={{ flexGrow: 1, margin: 0 }}>
              {combatant.name}
            </Heading>
            <Badge color="gray" variant="outline">
              {String(combatant.initiative ?? '—')}
            </Badge>
          </Flex>
          <Flex align="center" gap="4">
            <Flex align="center" gap="2">
              <Shield size={16} />
              <span>{combatant.armorClass}</span>
            </Flex>
            <Flex align="center" flexGrow="1" gap="2" style={{ minWidth: 0 }}>
              <Heart color="var(--red-9)" size={16} />
              <Progress style={{ flexGrow: 1 }} value={hpPercent} />
              <span>
                {String(combatant.currentHp)} / {String(combatant.maxHp)}
              </span>
            </Flex>
            <ActionEconomyDots combatant={combatant} />
          </Flex>
          {combatant.effects.length > 0 ? (
            <Flex gap="2" wrap="wrap">
              {combatant.effects.map(effect => (
                <Tooltip content={effect.description} key={effect.id}>
                  <Badge color="gray" variant="outline">
                    {`${summarizeEffect(effect.provides, effect.name)}${
                      effect.remainingRounds != null ? ` · ${String(effect.remainingRounds)}` : ''
                    }`}
                  </Badge>
                </Tooltip>
              ))}
            </Flex>
          ) : null}
        </Flex>
      </button>
    </Card>
  );
};
