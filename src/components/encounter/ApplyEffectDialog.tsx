import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FC, SyntheticEvent } from 'react';

import { queryMagicItemsSearch } from '../../api/magicItems';
import type { MagicItemSummary } from '../../api/magicItems';
import { querySpellsSearch } from '../../api/spells';
import type { SpellSummary } from '../../api/spells';
import { getAllConditions, STANDARD_CONDITIONS } from '../../data/conditions';
import type {
  ActiveEffect,
  EffectDescriptor,
  EffectExpiry,
  EffectSource,
  StandardCondition,
  TickOn,
  TriggerEvent,
} from '../../types/encounterState';
import { STANDARD_CONDITION_IDS, TRIGGER_EVENT_TYPES } from '../../types/encounterState';

type Source = 'condition' | 'custom' | 'item' | 'spell';

type DescriptorKind = EffectDescriptor['kind'];

const DESCRIPTOR_KIND_LABELS: Record<DescriptorKind, string> = {
  concentration: 'Concentration',
  condition: 'Standard condition',
  crit_damage_immunity: 'Crit damage immunity',
  custom: 'Custom descriptor',
  damage_immunity: 'Damage immunity',
  damage_resistance: 'Damage resistance',
  damage_vulnerability: 'Damage vulnerability',
  reaction_available: 'Reaction available',
};

const COMMON_DAMAGE_TYPES = [
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

const TICK_ON_OPTIONS: { label: string; value: TickOn }[] = [
  { label: 'Manual', value: 'manual' },
  { label: 'Start of owner turn', value: 'start_of_owner_turn' },
  { label: 'End of owner turn', value: 'end_of_owner_turn' },
  { label: 'Start of round', value: 'start_of_round' },
  { label: 'End of round', value: 'end_of_round' },
];

const sourceToSourceType = (source: Source): EffectSource =>
  source === 'item' ? 'item' : source === 'spell' ? 'spell' : source === 'condition' ? 'condition' : 'manual';

interface DescriptorFormState {
  conditionId: StandardCondition;
  customDescriptor: string;
  damageType: string;
  kind: DescriptorKind;
  reactionName: string;
  reactionPrompt: string;
  reactionTriggers: TriggerEvent[];
  spellName: string;
}

const initialDescriptorState = (): DescriptorFormState => ({
  conditionId: 'poisoned',
  customDescriptor: '',
  damageType: 'fire',
  kind: 'condition',
  reactionName: '',
  reactionPrompt: '',
  reactionTriggers: ['ON_SPELL_CAST'],
  spellName: '',
});

const buildDescriptor = (form: DescriptorFormState): EffectDescriptor | null => {
  switch (form.kind) {
    case 'concentration': {
      if (form.spellName.trim() === '') return null;
      return { kind: 'concentration', spellName: form.spellName.trim() };
    }
    case 'condition':
      return { conditionId: form.conditionId, kind: 'condition' };
    case 'crit_damage_immunity':
      return { kind: 'crit_damage_immunity' };
    case 'custom': {
      if (form.customDescriptor.trim() === '') return null;
      return { descriptor: form.customDescriptor.trim(), kind: 'custom' };
    }
    case 'damage_immunity':
    case 'damage_resistance':
    case 'damage_vulnerability': {
      if (form.damageType.trim() === '') return null;
      return { damageType: form.damageType.trim().toLowerCase(), kind: form.kind };
    }
    case 'reaction_available': {
      if (form.reactionName.trim() === '' || form.reactionTriggers.length === 0) return null;
      return {
        kind: 'reaction_available',
        promptMessage:
          form.reactionPrompt.trim() === '' ? `Use ${form.reactionName.trim()}` : form.reactionPrompt.trim(),
        reactionName: form.reactionName.trim(),
        triggerEvents: form.reactionTriggers,
      };
    }
    default:
      return null;
  }
};

export interface ApplyEffectDialogProps {
  buildId: () => string;
  combatantName: string;
  onClose: () => void;
  onConfirm: (effect: ActiveEffect) => void;
  open: boolean;
}

export const ApplyEffectDialog: FC<ApplyEffectDialogProps> = ({ buildId, combatantName, onClose, onConfirm, open }) => {
  const [source, setSource] = useState<Source>('condition');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [refId, setRefId] = useState<null | string>(null);
  const [tickOn, setTickOn] = useState<TickOn>('manual');
  const [expiryKind, setExpiryKind] = useState<EffectExpiry['kind']>('end_of_combat');
  const [expiryRounds, setExpiryRounds] = useState('10');
  const [descriptorForm, setDescriptorForm] = useState<DescriptorFormState>(initialDescriptorState);
  const [conditionId, setConditionId] = useState<StandardCondition>('poisoned');
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MagicItemSummary | null>(null);
  const [spellSearch, setSpellSearch] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<null | SpellSummary>(null);

  const itemsQuery = useQuery({ ...queryMagicItemsSearch(itemSearch), enabled: open && source === 'item' });
  const spellsQuery = useQuery({ ...querySpellsSearch(spellSearch), enabled: open && source === 'spell' });
  const items = itemsQuery.data ?? [];
  const spells = spellsQuery.data ?? [];
  const conditions = useMemo(() => getAllConditions(), []);

  const resetForm = () => {
    setSource('condition');
    setName('');
    setDescription('');
    setRefId(null);
    setTickOn('manual');
    setExpiryKind('end_of_combat');
    setExpiryRounds('10');
    setDescriptorForm(initialDescriptorState());
    setConditionId('poisoned');
    setItemSearch('');
    setSelectedItem(null);
    setSpellSearch('');
    setSelectedSpell(null);
  };

  const handleSourceChange = (_event: SyntheticEvent, nextSource: Source) => {
    setSource(nextSource);
    setRefId(null);
    setSelectedItem(null);
    setSelectedSpell(null);

    if (nextSource === 'condition') {
      const def = STANDARD_CONDITIONS[conditionId];
      setName(def.name);
      setDescription(def.description);
      setTickOn(def.defaultTickOn);
      setDescriptorForm(current => ({ ...current, conditionId, kind: 'condition' }));
    } else if (nextSource === 'item') {
      setName('');
      setDescription('');
      setDescriptorForm(current => ({ ...current, kind: 'damage_resistance' }));
    } else if (nextSource === 'spell') {
      setName('');
      setDescription('');
      setDescriptorForm(current => ({ ...current, kind: 'damage_resistance' }));
    } else {
      setName('');
      setDescription('');
      setDescriptorForm(current => ({ ...current, kind: 'custom' }));
    }
  };

  const handleConditionSelect = (next: StandardCondition) => {
    setConditionId(next);
    const def = STANDARD_CONDITIONS[next];
    setName(def.name);
    setDescription(def.description);
    setTickOn(def.defaultTickOn);
    setDescriptorForm(current => ({ ...current, conditionId: next, kind: 'condition' }));
  };

  const handleItemSelect = (_event: SyntheticEvent, item: MagicItemSummary | null) => {
    setSelectedItem(item);
    if (item == null) {
      setRefId(null);
      return;
    }
    setName(item.name);
    setRefId(item.id);
  };

  const handleSpellSelect = (_event: SyntheticEvent, spell: null | SpellSummary) => {
    setSelectedSpell(spell);
    if (spell == null) {
      setRefId(null);
      return;
    }
    setName(spell.name);
    setRefId(spell.id);
    if (spell.isConcentration) {
      setDescriptorForm(current => ({ ...current, kind: 'concentration', spellName: spell.name }));
    }
  };

  const descriptor = buildDescriptor(descriptorForm);
  const trimmedName = name.trim();

  const expiry: EffectExpiry = useMemo(() => {
    if (expiryKind === 'never') return { kind: 'never' };
    if (expiryKind === 'end_of_combat') return { kind: 'end_of_combat' };
    const rounds = Math.max(0, Math.trunc(Number(expiryRounds) || 0));
    return { kind: 'after_rounds', rounds };
  }, [expiryKind, expiryRounds]);

  const remainingRounds: null | number = expiry.kind === 'after_rounds' ? expiry.rounds : null;

  const notifyOn: TriggerEvent[] = useMemo(() => {
    if (descriptorForm.kind === 'condition') {
      return STANDARD_CONDITIONS[descriptorForm.conditionId].defaultNotifyOn;
    }
    if (descriptorForm.kind === 'reaction_available') {
      return descriptorForm.reactionTriggers;
    }
    return [];
  }, [descriptorForm]);

  const canConfirm = trimmedName !== '' && descriptor !== null;

  const handleConfirm = () => {
    if (trimmedName === '' || descriptor === null) return;

    const effect: ActiveEffect = {
      description: description.trim() === '' ? trimmedName : description.trim(),
      expiresAt: expiry,
      id: buildId(),
      name: trimmedName,
      notifyOn,
      provides: [descriptor],
      refId,
      remainingRounds,
      source:
        source === 'custom'
          ? trimmedName
          : source === 'condition'
            ? STANDARD_CONDITIONS[conditionId].name
            : trimmedName,
      sourceType: sourceToSourceType(source),
      tickOn,
    };

    onConfirm(effect);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
      <DialogTitle>Apply effect to {combatantName}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Tabs onChange={handleSourceChange} value={source} variant="fullWidth">
            <Tab label="Condition" value="condition" />
            <Tab label="Item" value="item" />
            <Tab label="Spell" value="spell" />
            <Tab label="Custom" value="custom" />
          </Tabs>

          {source === 'condition' && (
            <TextField
              label="Standard condition"
              onChange={event => {
                const next = event.target.value;
                if (STANDARD_CONDITION_IDS.includes(next as StandardCondition)) {
                  handleConditionSelect(next as StandardCondition);
                }
              }}
              select
              value={conditionId}
            >
              {conditions.map(condition => (
                <MenuItem key={condition.id} value={condition.id}>
                  {condition.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {source === 'item' && (
            <Autocomplete
              filterOptions={candidates => candidates}
              getOptionLabel={option => option.name}
              loading={itemsQuery.isFetching}
              onChange={handleItemSelect}
              onInputChange={(_event, value) => {
                setItemSearch(value);
              }}
              options={items}
              renderInput={params => <TextField {...params} label="Magic item" />}
              value={selectedItem}
            />
          )}

          {source === 'spell' && (
            <Autocomplete
              filterOptions={candidates => candidates}
              getOptionLabel={option => option.name}
              loading={spellsQuery.isFetching}
              onChange={handleSpellSelect}
              onInputChange={(_event, value) => {
                setSpellSearch(value);
              }}
              options={spells}
              renderInput={params => <TextField {...params} label="Spell" />}
              value={selectedSpell}
            />
          )}

          <TextField
            label="Effect name"
            onChange={event => {
              setName(event.target.value);
            }}
            value={name}
          />

          <TextField
            label="Description"
            multiline
            onChange={event => {
              setDescription(event.target.value);
            }}
            rows={2}
            value={description}
          />

          <TextField
            label="Effect type"
            onChange={event => {
              const next = event.target.value as DescriptorKind;
              setDescriptorForm(current => ({ ...current, kind: next }));
            }}
            select
            value={descriptorForm.kind}
          >
            {Object.entries(DESCRIPTOR_KIND_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          {(descriptorForm.kind === 'damage_resistance' ||
            descriptorForm.kind === 'damage_immunity' ||
            descriptorForm.kind === 'damage_vulnerability') && (
            <TextField
              label="Damage type"
              onChange={event => {
                setDescriptorForm(current => ({ ...current, damageType: event.target.value }));
              }}
              select
              value={descriptorForm.damageType}
            >
              {COMMON_DAMAGE_TYPES.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )}

          {descriptorForm.kind === 'condition' && (
            <TextField
              label="Standard condition"
              onChange={event => {
                const next = event.target.value as StandardCondition;
                setDescriptorForm(current => ({ ...current, conditionId: next }));
              }}
              select
              value={descriptorForm.conditionId}
            >
              {conditions.map(condition => (
                <MenuItem key={condition.id} value={condition.id}>
                  {condition.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {descriptorForm.kind === 'concentration' && (
            <TextField
              label="Concentrated spell"
              onChange={event => {
                setDescriptorForm(current => ({ ...current, spellName: event.target.value }));
              }}
              value={descriptorForm.spellName}
            />
          )}

          {descriptorForm.kind === 'reaction_available' && (
            <Stack spacing={2}>
              <TextField
                label="Reaction name"
                onChange={event => {
                  setDescriptorForm(current => ({ ...current, reactionName: event.target.value }));
                }}
                value={descriptorForm.reactionName}
              />
              <TextField
                label="Prompt to DM"
                onChange={event => {
                  setDescriptorForm(current => ({ ...current, reactionPrompt: event.target.value }));
                }}
                value={descriptorForm.reactionPrompt}
              />
              <Autocomplete
                getOptionLabel={option => option}
                multiple
                onChange={(_event, value) => {
                  setDescriptorForm(current => ({ ...current, reactionTriggers: value }));
                }}
                options={[...TRIGGER_EVENT_TYPES]}
                renderInput={params => <TextField {...params} label="Triggers on" />}
                value={descriptorForm.reactionTriggers}
              />
            </Stack>
          )}

          {descriptorForm.kind === 'custom' && (
            <TextField
              label="Custom descriptor"
              onChange={event => {
                setDescriptorForm(current => ({ ...current, customDescriptor: event.target.value }));
              }}
              value={descriptorForm.customDescriptor}
            />
          )}

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            <TextField
              label="Expires"
              onChange={event => {
                setExpiryKind(event.target.value as EffectExpiry['kind']);
              }}
              select
              value={expiryKind}
            >
              <MenuItem value="never">Never</MenuItem>
              <MenuItem value="end_of_combat">End of combat</MenuItem>
              <MenuItem value="after_rounds">After N rounds</MenuItem>
            </TextField>
            {expiryKind === 'after_rounds' && (
              <TextField
                label="Rounds"
                onChange={event => {
                  setExpiryRounds(event.target.value);
                }}
                type="number"
                value={expiryRounds}
              />
            )}
          </Box>

          <TextField
            label="Tick on"
            onChange={event => {
              setTickOn(event.target.value as TickOn);
            }}
            select
            value={tickOn}
          >
            {TICK_ON_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={notifyOn.length > 0}
                disabled
                onChange={() => {
                  /* derived from descriptor */
                }}
              />
            }
            label={
              <Typography sx={{ color: 'text.secondary' }} variant="body2">
                Will notify the DM on: {notifyOn.length === 0 ? 'no automatic triggers' : notifyOn.join(', ')}
              </Typography>
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button disabled={!canConfirm} onClick={handleConfirm} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};
