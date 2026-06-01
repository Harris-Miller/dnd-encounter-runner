import { Box, Button, Card, Dialog, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import type { FC } from 'react';

import type { Combatant, EncounterEvent, EncounterState, TriggerEvent } from '../../types/encounterState';

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

  const combatantSelectItems = combatants.map(combatant => (
    <Select.Item key={combatant.id} value={combatant.id}>
      {combatant.name}
    </Select.Item>
  ));

  return (
    <Card size="3" variant="surface">
      <Flex direction="column" gap="4" p="4">
        <Heading size="4">Record Event</Heading>
        <Flex gap="2" wrap="wrap">
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
                type="button"
                variant="soft"
              >
                {label}
              </Button>
            );
          })}
          <Button
            onClick={() => {
              setOpenDialog('damage');
            }}
            type="button"
            variant="soft"
          >
            Damage
          </Button>
          <Button
            onClick={() => {
              setOpenDialog('spell');
            }}
            type="button"
            variant="soft"
          >
            Spell cast
          </Button>
          <Box flexGrow="1" />
          <Button onClick={onAdvanceRound} type="button">
            Advance round
          </Button>
        </Flex>
      </Flex>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={openDialog === 'attack'}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Record {attackForm.kind.charAt(0) + attackForm.kind.slice(1).toLowerCase()}</Dialog.Title>
          <Flex direction="column" gap="4" pt="2">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Attacker
              </Text>
              <Select.Root
                onValueChange={value => {
                  setAttackForm(prev => ({ ...prev, attackerId: value }));
                }}
                value={attackForm.attackerId || undefined}
              >
                <Select.Trigger placeholder="Select attacker" />
                <Select.Content>{combatantSelectItems}</Select.Content>
              </Select.Root>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Target
              </Text>
              <Select.Root
                onValueChange={value => {
                  setAttackForm(prev => ({ ...prev, targetId: value }));
                }}
                value={attackForm.targetId || undefined}
              >
                <Select.Trigger placeholder="Select target" />
                <Select.Content>{combatantSelectItems}</Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={closeDialog} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleAttackSubmit} type="button">
              Record
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={openDialog === 'damage'}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Record Damage</Dialog.Title>
          <Flex direction="column" gap="4" pt="2">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Target
              </Text>
              <Select.Root
                onValueChange={value => {
                  setDamageForm(prev => ({ ...prev, targetId: value }));
                }}
                value={damageForm.targetId || undefined}
              >
                <Select.Trigger placeholder="Select target" />
                <Select.Content>{combatantSelectItems}</Select.Content>
              </Select.Root>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Source (optional)
              </Text>
              <Select.Root
                onValueChange={value => {
                  setDamageForm(prev => ({ ...prev, sourceId: value === '__none__' ? '' : value }));
                }}
                value={damageForm.sourceId === '' ? '__none__' : damageForm.sourceId}
              >
                <Select.Trigger placeholder="None" />
                <Select.Content>
                  <Select.Item value="__none__">None</Select.Item>
                  {combatantSelectItems}
                </Select.Content>
              </Select.Root>
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="damage-amount" size="2" weight="medium">
                Amount
              </Text>
              <TextField.Root
                id="damage-amount"
                min={0}
                onChange={event => {
                  setDamageForm(prev => ({ ...prev, amount: Number(event.target.value) || 0 }));
                }}
                type="number"
                value={damageForm.amount}
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Damage type
              </Text>
              <Select.Root
                onValueChange={value => {
                  setDamageForm(prev => ({ ...prev, damageType: value }));
                }}
                value={damageForm.damageType}
              >
                <Select.Trigger />
                <Select.Content>
                  {DAMAGE_TYPES.map(damageType => (
                    <Select.Item key={damageType} value={damageType}>
                      {damageType}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={closeDialog} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleDamageSubmit} type="button">
              Record
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={openDialog === 'spell'}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Record Spell Cast</Dialog.Title>
          <Flex direction="column" gap="4" pt="2">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Caster
              </Text>
              <Select.Root
                onValueChange={value => {
                  setSpellForm(prev => ({ ...prev, casterId: value }));
                }}
                value={spellForm.casterId || undefined}
              >
                <Select.Trigger placeholder="Select caster" />
                <Select.Content>{combatantSelectItems}</Select.Content>
              </Select.Root>
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="spell-name" size="2" weight="medium">
                Spell name
              </Text>
              <TextField.Root
                id="spell-name"
                onChange={event => {
                  setSpellForm(prev => ({ ...prev, spellName: event.target.value }));
                }}
                value={spellForm.spellName}
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="spell-targets" size="2" weight="medium">
                Targets
              </Text>
              <Box asChild>
                <select
                  id="spell-targets"
                  multiple
                  onChange={event => {
                    const selected = [...event.target.selectedOptions].map(option => option.value);
                    setSpellForm(prev => ({ ...prev, targetIds: selected }));
                  }}
                  style={{ width: '100%' }}
                  value={spellForm.targetIds}
                >
                  {combatants.map(combatant => (
                    <option key={combatant.id} value={combatant.id}>
                      {combatant.name}
                    </option>
                  ))}
                </select>
              </Box>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                Concentration
              </Text>
              <Select.Root
                onValueChange={value => {
                  setSpellForm(prev => ({ ...prev, isConcentration: value === 'true' }));
                }}
                value={String(spellForm.isConcentration)}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="false">No</Select.Item>
                  <Select.Item value="true">Yes (caster will be marked concentrating)</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={closeDialog} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSpellSubmit} type="button">
              Record
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};
