import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Tabs from '@radix-ui/react-tabs';
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
import { Autocomplete } from '../Autocomplete';

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

  const handleSourceChange = (nextSource: string) => {
    if (nextSource !== 'condition' && nextSource !== 'custom' && nextSource !== 'item' && nextSource !== 'spell') {
      return;
    }
    const sourceValue = nextSource;
    setSource(sourceValue);
    setRefId(null);
    setSelectedItem(null);
    setSelectedSpell(null);

    switch (sourceValue) {
      case 'condition': {
        const def = STANDARD_CONDITIONS[conditionId];
        setName(def.name);
        setDescription(def.description);
        setTickOn(def.defaultTickOn);
        setDescriptorForm(current => ({ ...current, conditionId, kind: 'condition' }));
        break;
      }
      case 'custom':
        setName('');
        setDescription('');
        setDescriptorForm(current => ({ ...current, kind: 'custom' }));
        break;
      case 'item':
        setName('');
        setDescription('');
        setDescriptorForm(current => ({ ...current, kind: 'damage_resistance' }));
        break;
      case 'spell':
        setName('');
        setDescription('');
        setDescriptorForm(current => ({ ...current, kind: 'damage_resistance' }));
        break;
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
    <Dialog.Root
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          handleClose();
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="radix-overlay" />
        <Dialog.Content className="radix-dialog-content">
          <Dialog.Title>Apply effect to {combatantName}</Dialog.Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: 8 }}>
            <Tabs.Root onValueChange={handleSourceChange} value={source}>
              <Tabs.List className="radix-tabs-list">
                <Tabs.Trigger className="radix-tabs-trigger" value="condition">
                  Condition
                </Tabs.Trigger>
                <Tabs.Trigger className="radix-tabs-trigger" value="item">
                  Item
                </Tabs.Trigger>
                <Tabs.Trigger className="radix-tabs-trigger" value="spell">
                  Spell
                </Tabs.Trigger>
                <Tabs.Trigger className="radix-tabs-trigger" value="custom">
                  Custom
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            {source === 'condition' ? (
              <div className="field">
                <Label.Root className="field-label" htmlFor="apply-effect-condition">
                  Standard condition
                </Label.Root>
                <select
                  className="field-input"
                  id="apply-effect-condition"
                  onChange={event => {
                    const next = event.target.value;
                    if (STANDARD_CONDITION_IDS.includes(next as StandardCondition)) {
                      handleConditionSelect(next as StandardCondition);
                    }
                  }}
                  value={conditionId}
                >
                  {conditions.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {source === 'item' ? (
              <Autocomplete
                filterOptions={candidates => candidates}
                getOptionLabel={option => option.name}
                loading={itemsQuery.isFetching}
                onChange={handleItemSelect}
                onInputChange={(_event, value) => {
                  setItemSearch(value);
                }}
                options={items}
                renderInput={({ id, onChange, onFocus, value }) => (
                  <div className="field">
                    <Label.Root className="field-label" htmlFor={id}>
                      Magic item
                    </Label.Root>
                    <input
                      className="field-input"
                      id={id}
                      onChange={event => {
                        onChange(event.target.value);
                      }}
                      onFocus={onFocus}
                      value={value}
                    />
                  </div>
                )}
                value={selectedItem}
              />
            ) : null}

            {source === 'spell' ? (
              <Autocomplete
                filterOptions={candidates => candidates}
                getOptionLabel={option => option.name}
                loading={spellsQuery.isFetching}
                onChange={handleSpellSelect}
                onInputChange={(_event, value) => {
                  setSpellSearch(value);
                }}
                options={spells}
                renderInput={({ id, onChange, onFocus, value }) => (
                  <div className="field">
                    <Label.Root className="field-label" htmlFor={id}>
                      Spell
                    </Label.Root>
                    <input
                      className="field-input"
                      id={id}
                      onChange={event => {
                        onChange(event.target.value);
                      }}
                      onFocus={onFocus}
                      value={value}
                    />
                  </div>
                )}
                value={selectedSpell}
              />
            ) : null}

            <div className="field">
              <Label.Root className="field-label" htmlFor="apply-effect-name">
                Effect name
              </Label.Root>
              <input
                className="field-input"
                id="apply-effect-name"
                onChange={event => {
                  setName(event.target.value);
                }}
                value={name}
              />
            </div>

            <div className="field">
              <Label.Root className="field-label" htmlFor="apply-effect-description">
                Description
              </Label.Root>
              <textarea
                className="field-input"
                id="apply-effect-description"
                onChange={event => {
                  setDescription(event.target.value);
                }}
                rows={2}
                value={description}
              />
            </div>

            <div className="field">
              <Label.Root className="field-label" htmlFor="apply-effect-kind">
                Effect type
              </Label.Root>
              <select
                className="field-input"
                id="apply-effect-kind"
                onChange={event => {
                  const next = event.target.value as DescriptorKind;
                  setDescriptorForm(current => ({ ...current, kind: next }));
                }}
                value={descriptorForm.kind}
              >
                {Object.entries(DESCRIPTOR_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {descriptorForm.kind === 'damage_resistance' ||
            descriptorForm.kind === 'damage_immunity' ||
            descriptorForm.kind === 'damage_vulnerability' ? (
              <div className="field">
                <Label.Root className="field-label" htmlFor="apply-effect-damage-type">
                  Damage type
                </Label.Root>
                <select
                  className="field-input"
                  id="apply-effect-damage-type"
                  onChange={event => {
                    setDescriptorForm(current => ({ ...current, damageType: event.target.value }));
                  }}
                  value={descriptorForm.damageType}
                >
                  {COMMON_DAMAGE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {descriptorForm.kind === 'condition' ? (
              <div className="field">
                <Label.Root className="field-label" htmlFor="apply-effect-descriptor-condition">
                  Standard condition
                </Label.Root>
                <select
                  className="field-input"
                  id="apply-effect-descriptor-condition"
                  onChange={event => {
                    const next = event.target.value as StandardCondition;
                    setDescriptorForm(current => ({ ...current, conditionId: next }));
                  }}
                  value={descriptorForm.conditionId}
                >
                  {conditions.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {descriptorForm.kind === 'concentration' ? (
              <div className="field">
                <Label.Root className="field-label" htmlFor="apply-effect-spell-name">
                  Concentrated spell
                </Label.Root>
                <input
                  className="field-input"
                  id="apply-effect-spell-name"
                  onChange={event => {
                    setDescriptorForm(current => ({ ...current, spellName: event.target.value }));
                  }}
                  value={descriptorForm.spellName}
                />
              </div>
            ) : null}

            {descriptorForm.kind === 'reaction_available' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="field">
                  <Label.Root className="field-label" htmlFor="apply-effect-reaction-name">
                    Reaction name
                  </Label.Root>
                  <input
                    className="field-input"
                    id="apply-effect-reaction-name"
                    onChange={event => {
                      setDescriptorForm(current => ({ ...current, reactionName: event.target.value }));
                    }}
                    value={descriptorForm.reactionName}
                  />
                </div>
                <div className="field">
                  <Label.Root className="field-label" htmlFor="apply-effect-reaction-prompt">
                    Prompt to DM
                  </Label.Root>
                  <input
                    className="field-input"
                    id="apply-effect-reaction-prompt"
                    onChange={event => {
                      setDescriptorForm(current => ({ ...current, reactionPrompt: event.target.value }));
                    }}
                    value={descriptorForm.reactionPrompt}
                  />
                </div>
                <div className="field">
                  <Label.Root className="field-label" htmlFor="reaction-triggers">
                    Triggers on
                  </Label.Root>
                  <select
                    className="field-input"
                    id="reaction-triggers"
                    multiple
                    onChange={event => {
                      const selected = [...event.target.selectedOptions].map(option => option.value as TriggerEvent);
                      setDescriptorForm(current => ({ ...current, reactionTriggers: selected }));
                    }}
                    value={descriptorForm.reactionTriggers}
                  >
                    {TRIGGER_EVENT_TYPES.map(trigger => (
                      <option key={trigger} value={trigger}>
                        {trigger}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {descriptorForm.kind === 'custom' ? (
              <div className="field">
                <Label.Root className="field-label" htmlFor="apply-effect-custom-descriptor">
                  Custom descriptor
                </Label.Root>
                <input
                  className="field-input"
                  id="apply-effect-custom-descriptor"
                  onChange={event => {
                    setDescriptorForm(current => ({ ...current, customDescriptor: event.target.value }));
                  }}
                  value={descriptorForm.customDescriptor}
                />
              </div>
            ) : null}

            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <Label.Root className="field-label" htmlFor="apply-effect-expiry">
                  Expires
                </Label.Root>
                <select
                  className="field-input"
                  id="apply-effect-expiry"
                  onChange={event => {
                    setExpiryKind(event.target.value as EffectExpiry['kind']);
                  }}
                  value={expiryKind}
                >
                  <option value="never">Never</option>
                  <option value="end_of_combat">End of combat</option>
                  <option value="after_rounds">After N rounds</option>
                </select>
              </div>
              {expiryKind === 'after_rounds' ? (
                <div className="field">
                  <Label.Root className="field-label" htmlFor="apply-effect-rounds">
                    Rounds
                  </Label.Root>
                  <input
                    className="field-input"
                    id="apply-effect-rounds"
                    onChange={event => {
                      setExpiryRounds(event.target.value);
                    }}
                    type="number"
                    value={expiryRounds}
                  />
                </div>
              ) : null}
            </div>

            <div className="field">
              <Label.Root className="field-label" htmlFor="apply-effect-tick-on">
                Tick on
              </Label.Root>
              <select
                className="field-input"
                id="apply-effect-tick-on"
                onChange={event => {
                  setTickOn(event.target.value as TickOn);
                }}
                value={tickOn}
              >
                {TICK_ON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <input aria-hidden checked={notifyOn.length > 0} disabled readOnly tabIndex={-1} type="checkbox" />
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                Will notify the DM on: {notifyOn.length === 0 ? 'no automatic triggers' : notifyOn.join(', ')}
              </span>
            </div>
          </div>
          <div className="dialog-actions">
            <button onClick={handleClose} type="button">
              Cancel
            </button>
            <button disabled={!canConfirm} onClick={handleConfirm} type="button">
              Apply
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
