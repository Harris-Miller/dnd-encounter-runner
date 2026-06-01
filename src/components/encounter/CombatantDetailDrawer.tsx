import { Cross, Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import type { Combatant } from '../../types/encounterState';
import { Box } from '../ui/Box';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Divider } from '../ui/Divider';
import { Drawer } from '../ui/Drawer';
import { IconButton } from '../ui/IconButton';
import { LinearProgress } from '../ui/LinearProgress';
import { Stack } from '../ui/Stack';
import { TextField } from '../ui/TextField';
import { ToggleButton, ToggleButtonGroup } from '../ui/ToggleButtonGroup';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';

export interface CombatantDetailDrawerProps {
  combatant: Combatant | null;
  onAdjustHp: (combatantId: string, delta: number) => void;
  onApplyEffect: (combatantId: string) => void;
  onClose: () => void;
  onMarkReactionUsed: (combatantId: string, used: boolean) => void;
  onRemoveCombatant: (combatantId: string) => void;
  onRemoveEffect: (combatantId: string, effectId: string) => void;
  onSetInitiative: (combatantId: string, initiative: number) => void;
}

export const CombatantDetailDrawer: FC<CombatantDetailDrawerProps> = ({
  combatant,
  onAdjustHp,
  onApplyEffect,
  onClose,
  onMarkReactionUsed,
  onRemoveCombatant,
  onRemoveEffect,
  onSetInitiative,
}) => {
  const [hpAdjust, setHpAdjust] = useState('5');
  const [initiativeDraft, setInitiativeDraft] = useState<string>('');

  const isOpen = combatant !== null;
  const hpPercent =
    combatant != null && combatant.maxHp > 0 ? Math.min(100, (combatant.currentHp / combatant.maxHp) * 100) : 0;

  const handleSetInitiative = () => {
    if (combatant == null) return;
    const parsed = Number(initiativeDraft);
    if (Number.isFinite(parsed)) {
      onSetInitiative(combatant.id, parsed);
      setInitiativeDraft('');
    }
  };

  return (
    <Drawer onClose={onClose} open={isOpen}>
      {combatant != null && (
        <Box style={{ padding: 24 }}>
          <Stack spacing={3}>
            <Box>
              <Box style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
                <Chip
                  color={combatant.type === 'monster' ? 'error' : 'info'}
                  label={combatant.type === 'monster' ? 'Monster' : 'Player'}
                  size="small"
                />
                <Typography style={{ flexGrow: 1 }} variant="h5">
                  {combatant.name}
                </Typography>
                <Tooltip title="Remove combatant">
                  <IconButton
                    onClick={() => {
                      onRemoveCombatant(combatant.id);
                      onClose();
                    }}
                    type="button"
                  >
                    <Trash2 color="var(--color-error)" size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2">AC {combatant.armorClass}</Typography>
                <Typography variant="body2">Initiative {combatant.initiative ?? '—'}</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography style={{ marginBottom: 8 }} variant="subtitle2">
                Hit points
              </Typography>
              <Box style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
                <Cross color="var(--color-error)" size={16} />
                <Typography variant="body2">
                  {String(combatant.currentHp)} / {String(combatant.maxHp)}
                </Typography>
                <Box style={{ flexGrow: 1 }}>
                  <LinearProgress value={hpPercent} variant="determinate" />
                </Box>
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Amount"
                  onChange={event => {
                    setHpAdjust(event.target.value);
                  }}
                  style={{ width: 100 }}
                  type="number"
                  value={hpAdjust}
                />
                <Button
                  onClick={() => {
                    onAdjustHp(combatant.id, -Math.abs(Number(hpAdjust) || 0));
                  }}
                  startIcon={<Minus size={18} />}
                  type="button"
                  variant="contained"
                >
                  Damage
                </Button>
                <Button
                  onClick={() => {
                    onAdjustHp(combatant.id, Math.abs(Number(hpAdjust) || 0));
                  }}
                  startIcon={<Heart size={18} />}
                  type="button"
                  variant="contained"
                >
                  Heal
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography style={{ marginBottom: 8 }} variant="subtitle2">
                Initiative
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Roll"
                  onChange={event => {
                    setInitiativeDraft(event.target.value);
                  }}
                  style={{ width: 120 }}
                  type="number"
                  value={initiativeDraft}
                />
                <Button onClick={handleSetInitiative} type="button" variant="outlined">
                  Set
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography style={{ marginBottom: 8 }} variant="subtitle2">
                Reaction
              </Typography>
              <ToggleButtonGroup
                exclusive
                onChange={(_event, value) => {
                  if (value === 'available' || value === 'used') {
                    onMarkReactionUsed(combatant.id, value === 'used');
                  }
                }}
                value={combatant.actionEconomy.reactionUsed ? 'used' : 'available'}
              >
                <ToggleButton value="available">Available</ToggleButton>
                <ToggleButton value="used">Used</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Divider />

            <Box>
              <Box style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography variant="subtitle2">Active effects</Typography>
                <Button
                  onClick={() => {
                    onApplyEffect(combatant.id);
                  }}
                  startIcon={<Plus size={18} />}
                  type="button"
                  variant="outlined"
                >
                  Apply
                </Button>
              </Box>
              {combatant.effects.length === 0 ? (
                <Typography className="text-secondary" variant="body2">
                  No active effects.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {combatant.effects.map(effect => (
                    <Box
                      key={effect.id}
                      style={{
                        alignItems: 'center',
                        border: '1px solid var(--color-divider)',
                        borderRadius: 8,
                        display: 'flex',
                        gap: 8,
                        padding: 8,
                      }}
                    >
                      <Box style={{ flexGrow: 1 }}>
                        <Typography variant="body2">{effect.name}</Typography>
                        <Typography className="text-secondary" variant="caption">
                          {effect.description}
                          {effect.remainingRounds != null ? ` · ${String(effect.remainingRounds)} round(s) left` : ''}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => {
                          onRemoveEffect(combatant.id, effect.id);
                        }}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography style={{ marginBottom: 8 }} variant="subtitle2">
                Damage modifiers
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} style={{ gap: 4 }}>
                {combatant.damageImmunities.map(immunity => (
                  <Chip color="success" key={`immune-${immunity}`} label={`Immune: ${immunity}`} size="small" />
                ))}
                {combatant.damageResistances.map(resistance => (
                  <Chip color="info" key={`resist-${resistance}`} label={`Resist: ${resistance}`} size="small" />
                ))}
                {combatant.damageVulnerabilities.map(vulnerability => (
                  <Chip
                    color="warning"
                    key={`vuln-${vulnerability}`}
                    label={`Vulnerable: ${vulnerability}`}
                    size="small"
                  />
                ))}
                {combatant.damageImmunities.length === 0 &&
                  combatant.damageResistances.length === 0 &&
                  combatant.damageVulnerabilities.length === 0 && (
                    <Typography className="text-secondary" variant="body2">
                      No baseline modifiers.
                    </Typography>
                  )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};
