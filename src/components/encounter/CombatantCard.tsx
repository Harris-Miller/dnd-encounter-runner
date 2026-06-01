import { Heart, Shield } from 'lucide-react';
import type { FC } from 'react';

import { STANDARD_CONDITIONS } from '../../data/conditions';
import type { Combatant, EffectDescriptor } from '../../types/encounterState';
import { Box } from '../ui/Box';
import { Card, CardActionArea } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { LinearProgress } from '../ui/LinearProgress';
import { Stack } from '../ui/Stack';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';

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

const ActionEconomyDots: FC<{ combatant: Combatant }> = ({ combatant }) => {
  const dots: { label: string; used: boolean }[] = [
    { label: 'Action', used: combatant.actionEconomy.actionUsed },
    { label: 'Bonus', used: combatant.actionEconomy.bonusActionUsed },
    { label: 'Reaction', used: combatant.actionEconomy.reactionUsed },
  ];

  return (
    <Stack direction="row" spacing={1}>
      {dots.map(dot => (
        <Tooltip key={dot.label} title={`${dot.label}${dot.used ? ' (used)' : ''}`}>
          <Box
            style={{
              backgroundColor: dot.used ? 'var(--color-text-secondary)' : 'var(--color-success)',
              border: `1px solid var(--color-divider)`,
              borderRadius: '50%',
              height: 8,
              width: 8,
            }}
          />
        </Tooltip>
      ))}
    </Stack>
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
    <Card
      style={{
        borderColor,
        borderStyle: 'solid',
        borderWidth: isCurrentTurn || selected ? 2 : 1,
      }}
      variant="outlined"
    >
      <CardActionArea
        component="div"
        onClick={() => {
          onSelect?.(combatant.id);
        }}
        style={{ padding: 16 }}
      >
        <Stack spacing={1}>
          <Box style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            <Tooltip title={combatant.type === 'monster' ? 'Monster' : 'Player'}>
              <Chip
                color={combatant.type === 'monster' ? 'error' : 'info'}
                label={combatant.type === 'monster' ? 'M' : 'P'}
                size="small"
              />
            </Tooltip>
            <Typography style={{ flexGrow: 1 }} variant="h6">
              {combatant.name}
            </Typography>
            <Tooltip title="Initiative">
              <Chip color="default" label={String(combatant.initiative ?? '—')} size="small" variant="outlined" />
            </Tooltip>
          </Box>
          <Box style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
            <Tooltip title="Armour Class">
              <Box style={{ alignItems: 'center', display: 'flex', gap: 32 }}>
                <Shield size={16} />
                <Typography variant="body2">{combatant.armorClass}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title={`HP ${String(combatant.currentHp)} / ${String(combatant.maxHp)}`}>
              <Box style={{ alignItems: 'center', display: 'flex', flexGrow: 1, gap: 32 }}>
                <Heart color="var(--color-error)" size={16} />
                <Box style={{ flexGrow: 1 }}>
                  <LinearProgress value={hpPercent} variant="determinate" />
                </Box>
                <Typography variant="body2">
                  {String(combatant.currentHp)} / {String(combatant.maxHp)}
                </Typography>
              </Box>
            </Tooltip>
            <ActionEconomyDots combatant={combatant} />
          </Box>
          {combatant.effects.length > 0 && (
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              {combatant.effects.map(effect => (
                <Tooltip key={effect.id} title={effect.description}>
                  <Chip
                    label={`${summarizeEffect(effect.provides, effect.name)}${
                      effect.remainingRounds != null ? ` · ${String(effect.remainingRounds)}` : ''
                    }`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              ))}
            </Box>
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
};
