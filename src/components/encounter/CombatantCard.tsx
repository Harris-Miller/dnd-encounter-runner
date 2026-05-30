import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import { Box, Card, CardActionArea, Chip, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
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

const ActionEconomyDots: FC<{ combatant: Combatant }> = ({ combatant }) => {
  const dots: { color: 'default' | 'primary'; label: string; used: boolean }[] = [
    { color: 'primary', label: 'Action', used: combatant.actionEconomy.actionUsed },
    { color: 'primary', label: 'Bonus', used: combatant.actionEconomy.bonusActionUsed },
    { color: 'primary', label: 'Reaction', used: combatant.actionEconomy.reactionUsed },
  ];

  return (
    <Stack direction="row" spacing={0.5}>
      {dots.map(dot => (
        <Tooltip key={dot.label} title={`${dot.label}${dot.used ? ' (used)' : ''}`}>
          <Box
            sx={{
              backgroundColor: theme => (dot.used ? theme.palette.action.disabled : theme.palette.success.main),
              border: theme => `1px solid ${theme.palette.divider}`,
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

  return (
    <Card
      sx={theme => ({
        borderColor: selected
          ? theme.palette.primary.main
          : isCurrentTurn
            ? theme.palette.warning.main
            : theme.palette.divider,
        borderStyle: 'solid',
        borderWidth: isCurrentTurn || selected ? 2 : 1,
      })}
      variant="outlined"
    >
      <CardActionArea
        component="div"
        onClick={() => {
          onSelect?.(combatant.id);
        }}
        sx={{ p: 2 }}
      >
        <Stack spacing={1}>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
            <Tooltip title={combatant.type === 'monster' ? 'Monster' : 'Player'}>
              <Chip
                color={combatant.type === 'monster' ? 'error' : 'info'}
                label={combatant.type === 'monster' ? 'M' : 'P'}
                size="small"
              />
            </Tooltip>
            <Typography sx={{ flexGrow: 1 }} variant="subtitle1">
              {combatant.name}
            </Typography>
            <Tooltip title="Initiative">
              <Chip color="default" label={combatant.initiative ?? '—'} size="small" variant="outlined" />
            </Tooltip>
          </Box>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
            <Tooltip title="Armour Class">
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
                <ShieldIcon fontSize="small" />
                <Typography variant="body2">{combatant.armorClass}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title={`HP ${String(combatant.currentHp)} / ${String(combatant.maxHp)}`}>
              <Box sx={{ alignItems: 'center', display: 'flex', flexGrow: 1, gap: 0.5 }}>
                <FavoriteIcon color="error" fontSize="small" />
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    color={hpPercent < 25 ? 'error' : hpPercent < 50 ? 'warning' : 'success'}
                    sx={{ borderRadius: 1, height: 8 }}
                    value={hpPercent}
                    variant="determinate"
                  />
                </Box>
                <Typography variant="body2">
                  {String(combatant.currentHp)} / {String(combatant.maxHp)}
                </Typography>
              </Box>
            </Tooltip>
            <ActionEconomyDots combatant={combatant} />
          </Box>
          {combatant.effects.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
