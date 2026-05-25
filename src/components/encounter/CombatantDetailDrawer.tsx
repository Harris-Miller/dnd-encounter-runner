import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HealingIcon from '@mui/icons-material/Healing';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { FC } from 'react';

import type { Combatant } from '../../types/encounterState';

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
    <Drawer
      anchor="right"
      ModalProps={{ keepMounted: true }}
      onClose={onClose}
      open={isOpen}
      slotProps={{ paper: { sx: { width: { sm: 480, xs: '100%' } } } }}
    >
      {combatant != null && (
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 1 }}>
                <Chip
                  color={combatant.type === 'monster' ? 'error' : 'info'}
                  label={combatant.type === 'monster' ? 'Monster' : 'Player'}
                  size="small"
                />
                <Typography sx={{ flexGrow: 1 }} variant="h5">
                  {combatant.name}
                </Typography>
                <Tooltip title="Remove combatant">
                  <IconButton
                    color="error"
                    onClick={() => {
                      onRemoveCombatant(combatant.id);
                      onClose();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2">AC {combatant.armorClass}</Typography>
                <Typography variant="body2">Initiative {combatant.initiative ?? '—'}</Typography>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ mb: 1 }} variant="subtitle2">
                Hit points
              </Typography>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 1 }}>
                <LocalHospitalIcon color="error" fontSize="small" />
                <Typography variant="body2">
                  {String(combatant.currentHp)} / {String(combatant.maxHp)}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    color={hpPercent < 25 ? 'error' : hpPercent < 50 ? 'warning' : 'success'}
                    sx={{ borderRadius: 1, height: 8 }}
                    value={hpPercent}
                    variant="determinate"
                  />
                </Box>
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Amount"
                  onChange={event => {
                    setHpAdjust(event.target.value);
                  }}
                  size="small"
                  sx={{ width: 100 }}
                  type="number"
                  value={hpAdjust}
                />
                <Button
                  color="error"
                  onClick={() => {
                    onAdjustHp(combatant.id, -Math.abs(Number(hpAdjust) || 0));
                  }}
                  startIcon={<RemoveIcon />}
                  variant="contained"
                >
                  Damage
                </Button>
                <Button
                  color="success"
                  onClick={() => {
                    onAdjustHp(combatant.id, Math.abs(Number(hpAdjust) || 0));
                  }}
                  startIcon={<HealingIcon />}
                  variant="contained"
                >
                  Heal
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ mb: 1 }} variant="subtitle2">
                Initiative
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Roll"
                  onChange={event => {
                    setInitiativeDraft(event.target.value);
                  }}
                  size="small"
                  sx={{ width: 120 }}
                  type="number"
                  value={initiativeDraft}
                />
                <Button onClick={handleSetInitiative} variant="outlined">
                  Set
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ mb: 1 }} variant="subtitle2">
                Reaction
              </Typography>
              <ToggleButtonGroup
                exclusive
                onChange={(_event, value: 'available' | 'used' | null) => {
                  if (value !== null) {
                    onMarkReactionUsed(combatant.id, value === 'used');
                  }
                }}
                size="small"
                value={combatant.actionEconomy.reactionUsed ? 'used' : 'available'}
              >
                <ToggleButton value="available">Available</ToggleButton>
                <ToggleButton value="used">Used</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">Active effects</Typography>
                <Button
                  onClick={() => {
                    onApplyEffect(combatant.id);
                  }}
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                >
                  Apply
                </Button>
              </Box>
              {combatant.effects.length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }} variant="body2">
                  No active effects.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {combatant.effects.map(effect => (
                    <Box
                      key={effect.id}
                      sx={{
                        alignItems: 'center',
                        border: theme => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        display: 'flex',
                        gap: 1,
                        p: 1,
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{effect.name}</Typography>
                        <Typography sx={{ color: 'text.secondary' }} variant="caption">
                          {effect.description}
                          {effect.remainingRounds != null ? ` · ${String(effect.remainingRounds)} round(s) left` : ''}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => {
                          onRemoveEffect(combatant.id, effect.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ mb: 1 }} variant="subtitle2">
                Damage modifiers
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }} useFlexGap>
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
                    <Typography sx={{ color: 'text.secondary' }} variant="body2">
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
