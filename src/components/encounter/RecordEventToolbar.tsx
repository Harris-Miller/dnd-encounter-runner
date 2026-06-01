import { useMemo, useState } from 'react';
import type { FC } from 'react';

import type { Combatant, EncounterEvent, EncounterState, TriggerEvent } from '../../types/encounterState';
import { Box } from '../ui/Box';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../ui/Dialog';
import { Stack } from '../ui/Stack';
import { MenuItem, TextField } from '../ui/TextField';
import { Typography } from '../ui/Typography';

const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
];

const ATTACK_EVENT_TYPES: TriggerEvent[] = ['ON_ATTACK', 'ON_HIT', 'ON_MISS', 'ON_CRIT'];

type DialogKind = 'attack' | 'damage' | 'spell' | null;

interface AttackForm {
  attackerId: string;
  kind: 'ATTACK' | 'CRIT' | 'HIT' | 'MISS';
  targetId: string;
}

interface DamageForm {
  amount: number;
  damageType: string;
  sourceId: string;
  targetId: string;
}

interface SpellForm {
  casterId: string;
  isConcentration: boolean;
  spellName: string;
  targetIds: string[];
}

const buildAttackEvent = (form: AttackForm, factories: { id: string; ts: string }): EncounterEvent => {
  const payload = { attackerCombatantId: form.attackerId, targetCombatantId: form.targetId };

  switch (form.kind) {
    case 'ATTACK':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_ATTACK' };
    case 'CRIT':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_CRIT' };
    case 'HIT':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_HIT' };
    case 'MISS':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_MISS' };
    default:
      throw new Error(`Unknown attack kind "${String(form.kind)}"`);
  }
};

const buildDamageEvent = (form: DamageForm, factories: { id: string; ts: string }): EncounterEvent => ({
  id: factories.id,
  payload: {
    amount: form.amount,
    damageType: form.damageType,
    sourceCombatantId: form.sourceId === '' ? null : form.sourceId,
    targetCombatantId: form.targetId,
  },
  ts: factories.ts,
  type: 'ON_DAMAGE',
});

const buildSpellEvent = (form: SpellForm, factories: { id: string; ts: string }): EncounterEvent => ({
  id: factories.id,
  payload: {
    casterCombatantId: form.casterId,
    isConcentration: form.isConcentration,
    spellName: form.spellName,
    targetCombatantIds: form.targetIds,
  },
  ts: factories.ts,
  type: 'ON_SPELL_CAST',
});

export interface RecordEventToolbarProps {
  onAdvanceRound: () => void;
  onRecordEvent: (event: EncounterEvent) => void;
  state: EncounterState;
}

export const RecordEventToolbar: FC<RecordEventToolbarProps> = ({ onAdvanceRound, onRecordEvent, state }) => {
  const combatants = useMemo<Combatant[]>(() => Object.values(state.combatants), [state.combatants]);
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [attackForm, setAttackForm] = useState<AttackForm>({
    attackerId: '',
    kind: 'HIT',
    targetId: '',
  });
  const [damageForm, setDamageForm] = useState<DamageForm>({
    amount: 0,
    damageType: 'slashing',
    sourceId: '',
    targetId: '',
  });
  const [spellForm, setSpellForm] = useState<SpellForm>({
    casterId: '',
    isConcentration: false,
    spellName: '',
    targetIds: [],
  });

  const closeDialog = () => {
    setOpenDialog(null);
  };

  const buildFactories = () => ({ id: crypto.randomUUID(), ts: new Date().toISOString() });

  const handleAttackSubmit = () => {
    if (attackForm.attackerId === '' || attackForm.targetId === '') return;
    onRecordEvent(buildAttackEvent(attackForm, buildFactories()));
    closeDialog();
  };

  const handleDamageSubmit = () => {
    if (damageForm.targetId === '' || damageForm.amount <= 0) return;
    onRecordEvent(buildDamageEvent(damageForm, buildFactories()));
    closeDialog();
  };

  const handleSpellSubmit = () => {
    if (spellForm.casterId === '' || spellForm.spellName.trim() === '') return;
    onRecordEvent(buildSpellEvent({ ...spellForm, spellName: spellForm.spellName.trim() }, buildFactories()));
    closeDialog();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography style={{ marginBottom: 16 }} variant="h6">
          Record Event
        </Typography>
        <Stack direction="row" spacing={1} style={{ flexWrap: 'wrap' }}>
          {ATTACK_EVENT_TYPES.map(eventType => {
            const kind = eventType.replace('ON_', '') as AttackForm['kind'];
            const label = kind.charAt(0) + kind.slice(1).toLowerCase();
            return (
              <Button
                key={eventType}
                onClick={() => {
                  setAttackForm(prev => ({ ...prev, kind }));
                  setOpenDialog('attack');
                }}
                variant="outlined"
              >
                {label}
              </Button>
            );
          })}
          <Button
            onClick={() => {
              setOpenDialog('damage');
            }}
            variant="outlined"
          >
            Damage
          </Button>
          <Button
            onClick={() => {
              setOpenDialog('spell');
            }}
            variant="outlined"
          >
            Spell cast
          </Button>
          <Box style={{ flexGrow: 1 }} />
          <Button onClick={onAdvanceRound} variant="outlined">
            Advance round
          </Button>
        </Stack>
      </CardContent>

      <Dialog maxWidth="sm" onClose={closeDialog} open={openDialog === 'attack'}>
        <DialogTitle>Record {attackForm.kind.charAt(0) + attackForm.kind.slice(1).toLowerCase()}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} style={{ paddingTop: 8 }}>
            <TextField
              label="Attacker"
              onChange={event => {
                setAttackForm(prev => ({ ...prev, attackerId: event.target.value }));
              }}
              select
              value={attackForm.attackerId}
            >
              {combatants.map(combatant => (
                <MenuItem key={combatant.id} value={combatant.id}>
                  {combatant.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Target"
              onChange={event => {
                setAttackForm(prev => ({ ...prev, targetId: event.target.value }));
              }}
              select
              value={attackForm.targetId}
            >
              {combatants.map(combatant => (
                <MenuItem key={combatant.id} value={combatant.id}>
                  {combatant.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleAttackSubmit} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth="sm" onClose={closeDialog} open={openDialog === 'damage'}>
        <DialogTitle>Record Damage</DialogTitle>
        <DialogContent>
          <Stack spacing={2} style={{ paddingTop: 8 }}>
            <TextField
              label="Target"
              onChange={event => {
                setDamageForm(prev => ({ ...prev, targetId: event.target.value }));
              }}
              select
              value={damageForm.targetId}
            >
              {combatants.map(combatant => (
                <MenuItem key={combatant.id} value={combatant.id}>
                  {combatant.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Source (optional)"
              onChange={event => {
                setDamageForm(prev => ({ ...prev, sourceId: event.target.value }));
              }}
              select
              value={damageForm.sourceId}
            >
              <MenuItem value="">None</MenuItem>
              {combatants.map(combatant => (
                <MenuItem key={combatant.id} value={combatant.id}>
                  {combatant.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              min={0}
              onChange={event => {
                setDamageForm(prev => ({ ...prev, amount: Number(event.target.value) || 0 }));
              }}
              type="number"
              value={damageForm.amount}
            />
            <TextField
              label="Damage type"
              onChange={event => {
                setDamageForm(prev => ({ ...prev, damageType: event.target.value }));
              }}
              select
              value={damageForm.damageType}
            >
              {DAMAGE_TYPES.map(damageType => (
                <MenuItem key={damageType} value={damageType}>
                  {damageType}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleDamageSubmit} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth="sm" onClose={closeDialog} open={openDialog === 'spell'}>
        <DialogTitle>Record Spell Cast</DialogTitle>
        <DialogContent>
          <Stack spacing={2} style={{ paddingTop: 8 }}>
            <TextField
              label="Caster"
              onChange={event => {
                setSpellForm(prev => ({ ...prev, casterId: event.target.value }));
              }}
              select
              value={spellForm.casterId}
            >
              {combatants.map(combatant => (
                <MenuItem key={combatant.id} value={combatant.id}>
                  {combatant.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Spell name"
              onChange={event => {
                setSpellForm(prev => ({ ...prev, spellName: event.target.value }));
              }}
              value={spellForm.spellName}
            />
            <TextField
              label="Targets"
              multiple
              onChange={event => {
                const { value } = event.target;
                setSpellForm(prev => ({
                  ...prev,
                  targetIds: typeof value === 'string' ? value.split(',') : value,
                }));
              }}
              select
              value={spellForm.targetIds}
            >
              {combatants.map(combatant => (
                <MenuItem key={combatant.id} value={combatant.id}>
                  {combatant.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Concentration"
              onChange={event => {
                setSpellForm(prev => ({ ...prev, isConcentration: event.target.value === 'true' }));
              }}
              select
              value={String(spellForm.isConcentration)}
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes (caster will be marked concentrating)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSpellSubmit} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
