import { Box, Button, Checkbox, Dialog, Flex, Grid, Select, Tabs, Text, TextArea, TextField } from '@radix-ui/themes';
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
      <Dialog.Content maxWidth="560px">
        <Dialog.Title>Apply effect to {combatantName}</Dialog.Title>
        <Flex direction="column" gap="4" pt="2">
          <Tabs.Root onValueChange={handleSourceChange} value={source}>
            <Tabs.List>
              <Tabs.Trigger value="condition">Condition</Tabs.Trigger>
              <Tabs.Trigger value="item">Item</Tabs.Trigger>
              <Tabs.Trigger value="spell">Spell</Tabs.Trigger>
              <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {source === 'condition' ? (
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Standard condition
              </Text>
              <Select.Root
                onValueChange={value => {
                  if (STANDARD_CONDITION_IDS.includes(value as StandardCondition)) {
                    handleConditionSelect(value as StandardCondition);
                  }
                }}
                value={conditionId}
              >
                <Select.Trigger />
                <Select.Content>
                  {conditions.map(condition => (
                    <Select.Item key={condition.id} value={condition.id}>
                      {condition.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
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
                <Flex direction="column" gap="1">
                  <Text as="label" htmlFor={id} size="2" weight="medium">
                    Magic item
                  </Text>
                  <TextField.Root
                    id={id}
                    onChange={event => {
                      onChange(event.target.value);
                    }}
                    onFocus={onFocus}
                    value={value}
                  />
                </Flex>
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
                <Flex direction="column" gap="1">
                  <Text as="label" htmlFor={id} size="2" weight="medium">
                    Spell
                  </Text>
                  <TextField.Root
                    id={id}
                    onChange={event => {
                      onChange(event.target.value);
                    }}
                    onFocus={onFocus}
                    value={value}
                  />
                </Flex>
              )}
              value={selectedSpell}
            />
          ) : null}

          <Flex direction="column" gap="1">
            <Text as="label" htmlFor="apply-effect-name" size="2" weight="medium">
              Effect name
            </Text>
            <TextField.Root
              id="apply-effect-name"
              onChange={event => {
                setName(event.target.value);
              }}
              value={name}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" htmlFor="apply-effect-description" size="2" weight="medium">
              Description
            </Text>
            <TextArea
              id="apply-effect-description"
              onChange={event => {
                setDescription(event.target.value);
              }}
              rows={2}
              value={description}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              Effect type
            </Text>
            <Select.Root
              onValueChange={value => {
                setDescriptorForm(current => ({ ...current, kind: value as DescriptorKind }));
              }}
              value={descriptorForm.kind}
            >
              <Select.Trigger />
              <Select.Content>
                {Object.entries(DESCRIPTOR_KIND_LABELS).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          {descriptorForm.kind === 'damage_resistance' ||
          descriptorForm.kind === 'damage_immunity' ||
          descriptorForm.kind === 'damage_vulnerability' ? (
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Damage type
              </Text>
              <Select.Root
                onValueChange={value => {
                  setDescriptorForm(current => ({ ...current, damageType: value }));
                }}
                value={descriptorForm.damageType}
              >
                <Select.Trigger />
                <Select.Content>
                  {COMMON_DAMAGE_TYPES.map(type => (
                    <Select.Item key={type} value={type}>
                      {type}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          ) : null}

          {descriptorForm.kind === 'condition' ? (
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Standard condition
              </Text>
              <Select.Root
                onValueChange={value => {
                  setDescriptorForm(current => ({ ...current, conditionId: value as StandardCondition }));
                }}
                value={descriptorForm.conditionId}
              >
                <Select.Trigger />
                <Select.Content>
                  {conditions.map(condition => (
                    <Select.Item key={condition.id} value={condition.id}>
                      {condition.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          ) : null}

          {descriptorForm.kind === 'concentration' ? (
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="apply-effect-spell-name" size="2" weight="medium">
                Concentrated spell
              </Text>
              <TextField.Root
                id="apply-effect-spell-name"
                onChange={event => {
                  setDescriptorForm(current => ({ ...current, spellName: event.target.value }));
                }}
                value={descriptorForm.spellName}
              />
            </Flex>
          ) : null}

          {descriptorForm.kind === 'reaction_available' ? (
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="apply-effect-reaction-name" size="2" weight="medium">
                  Reaction name
                </Text>
                <TextField.Root
                  id="apply-effect-reaction-name"
                  onChange={event => {
                    setDescriptorForm(current => ({ ...current, reactionName: event.target.value }));
                  }}
                  value={descriptorForm.reactionName}
                />
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="apply-effect-reaction-prompt" size="2" weight="medium">
                  Prompt to DM
                </Text>
                <TextField.Root
                  id="apply-effect-reaction-prompt"
                  onChange={event => {
                    setDescriptorForm(current => ({ ...current, reactionPrompt: event.target.value }));
                  }}
                  value={descriptorForm.reactionPrompt}
                />
              </Flex>
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="reaction-triggers" size="2" weight="medium">
                  Triggers on
                </Text>
                <Box asChild>
                  <select
                    id="reaction-triggers"
                    multiple
                    onChange={event => {
                      const selected = [...event.target.selectedOptions].map(option => option.value as TriggerEvent);
                      setDescriptorForm(current => ({ ...current, reactionTriggers: selected }));
                    }}
                    style={{ width: '100%' }}
                    value={descriptorForm.reactionTriggers}
                  >
                    {TRIGGER_EVENT_TYPES.map(trigger => (
                      <option key={trigger} value={trigger}>
                        {trigger}
                      </option>
                    ))}
                  </select>
                </Box>
              </Flex>
            </Flex>
          ) : null}

          {descriptorForm.kind === 'custom' ? (
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="apply-effect-custom-descriptor" size="2" weight="medium">
                Custom descriptor
              </Text>
              <TextField.Root
                id="apply-effect-custom-descriptor"
                onChange={event => {
                  setDescriptorForm(current => ({ ...current, customDescriptor: event.target.value }));
                }}
                value={descriptorForm.customDescriptor}
              />
            </Flex>
          ) : null}

          <Grid columns="2" gap="4">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Expires
              </Text>
              <Select.Root
                onValueChange={value => {
                  setExpiryKind(value as EffectExpiry['kind']);
                }}
                value={expiryKind}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="never">Never</Select.Item>
                  <Select.Item value="end_of_combat">End of combat</Select.Item>
                  <Select.Item value="after_rounds">After N rounds</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
            {expiryKind === 'after_rounds' ? (
              <Flex direction="column" gap="1">
                <Text as="label" htmlFor="apply-effect-rounds" size="2" weight="medium">
                  Rounds
                </Text>
                <TextField.Root
                  id="apply-effect-rounds"
                  onChange={event => {
                    setExpiryRounds(event.target.value);
                  }}
                  type="number"
                  value={expiryRounds}
                />
              </Flex>
            ) : null}
          </Grid>

          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              Tick on
            </Text>
            <Select.Root
              onValueChange={value => {
                setTickOn(value as TickOn);
              }}
              value={tickOn}
            >
              <Select.Trigger />
              <Select.Content>
                {TICK_ON_OPTIONS.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex align="center" gap="2">
            <Checkbox checked={notifyOn.length > 0} disabled />
            <Text color="gray" size="2">
              Will notify the DM on: {notifyOn.length === 0 ? 'no automatic triggers' : notifyOn.join(', ')}
            </Text>
          </Flex>
        </Flex>
        <Flex gap="3" justify="end" mt="4">
          <Dialog.Close>
            <Button color="gray" onClick={handleClose} type="button" variant="soft">
              Cancel
            </Button>
          </Dialog.Close>
          <Button disabled={!canConfirm} onClick={handleConfirm} type="button">
            Apply
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
