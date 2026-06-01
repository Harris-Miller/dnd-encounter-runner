import { Button, Dialog, Flex, Grid, Select, Tabs, Text, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FC, SyntheticEvent } from 'react';

import { queryCharactersList } from '../../api/characters';
import { queryMonster, queryMonstersSearch } from '../../api/monsters';
import type { MonsterSummary } from '../../api/monsters';
import type { Combatant, CombatantType } from '../../types/encounterState';
import { DEFAULT_ACTION_ECONOMY } from '../../types/encounterState';
import { Autocomplete } from '../Autocomplete';

type Mode = 'character-roster' | 'custom' | 'monster-index';

const parseIntOrNull = (raw: string): null | number => {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const parseIntOrZero = (raw: string): number => parseIntOrNull(raw) ?? 0;

export interface AddCombatantDialogProps {
  buildId: () => string;
  existingCombatantIds: Set<string>;
  onClose: () => void;
  onConfirm: (combatant: Combatant) => void;
  open: boolean;
}

export const AddCombatantDialog: FC<AddCombatantDialogProps> = ({
  buildId,
  existingCombatantIds,
  onClose,
  onConfirm,
  open,
}) => {
  const [mode, setMode] = useState<Mode>('character-roster');
  const [combatantType, setCombatantType] = useState<CombatantType>('character');
  const [name, setName] = useState('');
  const [armorClass, setArmorClass] = useState('10');
  const [maxHp, setMaxHp] = useState('10');
  const [initiative, setInitiative] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<null | string>(null);
  const [monsterSearch, setMonsterSearch] = useState('');
  const [selectedMonsterId, setSelectedMonsterId] = useState<null | string>(null);
  const [refId, setRefId] = useState<null | string>(null);

  const charactersQuery = useQuery({ ...queryCharactersList, enabled: open });
  const monstersQuery = useQuery({ ...queryMonstersSearch(monsterSearch), enabled: open && mode === 'monster-index' });
  const monsterDetailQuery = useQuery({
    ...queryMonster(selectedMonsterId ?? ''),
    enabled: open && selectedMonsterId !== null,
  });

  const characters = charactersQuery.data ?? [];
  const monsters: MonsterSummary[] = monstersQuery.data ?? [];

  const handleModeChange = (nextMode: string) => {
    if (nextMode !== 'character-roster' && nextMode !== 'custom' && nextMode !== 'monster-index') return;
    const modeValue = nextMode;
    setMode(modeValue);
    setSelectedCharacterId(null);
    setSelectedMonsterId(null);
    setRefId(null);
    if (modeValue === 'monster-index') {
      setCombatantType('monster');
    } else {
      setCombatantType('character');
    }
  };

  const handleCharacterSelect = (characterId: string) => {
    const character = characters.find(candidate => candidate.id === characterId);
    if (character == null) return;
    setSelectedCharacterId(character.id);
    setName(character.name);
    setArmorClass(String(character.armorClass));
    setMaxHp(String(character.maxHitPoints));
    setRefId(character.id);
    setCombatantType('character');
  };

  const handleMonsterSelect = (_event: SyntheticEvent, monster: MonsterSummary | null) => {
    if (monster == null) {
      setSelectedMonsterId(null);
      setRefId(null);
      return;
    }

    setSelectedMonsterId(monster.id);
    setName(monster.name);
    setArmorClass(String(monster.armorClass));
    setMaxHp(String(monster.hitPoints));
    setRefId(monster.id);
    setCombatantType('monster');
  };

  const handleClose = () => {
    onClose();
  };

  const trimmedName = name.trim();
  const parsedAc = parseIntOrNull(armorClass);
  const parsedMaxHp = parseIntOrNull(maxHp);
  const parsedInitiative = parseIntOrNull(initiative);

  const detail = monsterDetailQuery.data;

  const baselineDamageMods = useMemo(() => {
    if (combatantType !== 'monster' || detail == null) {
      return { immunities: [] as string[], resistances: [] as string[], vulnerabilities: [] as string[] };
    }

    return {
      immunities: detail.immunities,
      resistances: detail.resistances,
      vulnerabilities: detail.vulnerabilities == null ? [] : [detail.vulnerabilities],
    };
  }, [combatantType, detail]);

  const canConfirm = trimmedName !== '' && parsedAc != null && parsedAc >= 0 && parsedMaxHp != null && parsedMaxHp > 0;

  const handleConfirm = () => {
    if (parsedAc == null || parsedMaxHp == null) return;
    if (trimmedName === '' || parsedAc < 0 || parsedMaxHp <= 0) return;

    let candidateId = refId ?? buildId();
    while (existingCombatantIds.has(candidateId)) {
      candidateId = buildId();
    }

    const combatant: Combatant = {
      actionEconomy: { ...DEFAULT_ACTION_ECONOMY },
      armorClass: parsedAc,
      currentHp: parsedMaxHp,
      damageImmunities: baselineDamageMods.immunities,
      damageResistances: baselineDamageMods.resistances,
      damageVulnerabilities: baselineDamageMods.vulnerabilities,
      effects: [],
      equippedItems: [],
      id: candidateId,
      initiative: parsedInitiative,
      knownSpells: [],
      maxHp: parsedMaxHp,
      name: trimmedName,
      refId,
      tempHp: 0,
      type: combatantType,
    };

    onConfirm(combatant);
    setName('');
    setArmorClass('10');
    setMaxHp('10');
    setInitiative('');
    setSelectedCharacterId(null);
    setSelectedMonsterId(null);
    setRefId(null);
    setMonsterSearch('');
    setMode('character-roster');
    setCombatantType('character');
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
        <Dialog.Title>Add combatant</Dialog.Title>
        <Flex direction="column" gap="4" pt="2">
          <Tabs.Root onValueChange={handleModeChange} value={mode}>
            <Tabs.List>
              <Tabs.Trigger value="character-roster">From roster</Tabs.Trigger>
              <Tabs.Trigger value="monster-index">From monster index</Tabs.Trigger>
              <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {mode === 'character-roster' ? (
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                Character
              </Text>
              <Select.Root
                disabled={characters.length === 0}
                onValueChange={handleCharacterSelect}
                value={selectedCharacterId ?? undefined}
              >
                <Select.Trigger placeholder={characters.length === 0 ? 'No saved characters' : 'Select character'} />
                <Select.Content>
                  {characters.map(character => (
                    <Select.Item key={character.id} value={character.id}>
                      {character.name} · AC {String(character.armorClass)} · {String(character.maxHitPoints)} HP
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          ) : null}

          {mode === 'monster-index' ? (
            <Autocomplete
              filterOptions={candidates => candidates}
              getOptionLabel={option => option.name}
              loading={monstersQuery.isFetching}
              onChange={handleMonsterSelect}
              onInputChange={(_event, value) => {
                setMonsterSearch(value);
              }}
              options={monsters}
              renderInput={({ id, onChange, onFocus, value }) => (
                <Flex direction="column" gap="1">
                  <Text as="label" htmlFor={id} size="2" weight="medium">
                    Monster
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
              value={monsters.find(option => option.id === selectedMonsterId) ?? null}
            />
          ) : null}

          <Flex direction="column" gap="1">
            <Text as="label" htmlFor="add-combatant-name" size="2" weight="medium">
              Name
            </Text>
            <TextField.Root
              id="add-combatant-name"
              onChange={event => {
                setName(event.target.value);
              }}
              value={name}
            />
          </Flex>

          <Grid columns="3" gap="4">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="add-combatant-ac" size="2" weight="medium">
                AC
              </Text>
              <TextField.Root
                id="add-combatant-ac"
                onChange={event => {
                  setArmorClass(event.target.value);
                }}
                type="number"
                value={armorClass}
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="add-combatant-max-hp" size="2" weight="medium">
                Max HP
              </Text>
              <TextField.Root
                id="add-combatant-max-hp"
                onChange={event => {
                  setMaxHp(event.target.value);
                }}
                type="number"
                value={maxHp}
              />
            </Flex>
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="add-combatant-initiative" size="2" weight="medium">
                Initiative
              </Text>
              <TextField.Root
                id="add-combatant-initiative"
                onChange={event => {
                  setInitiative(event.target.value);
                }}
                type="number"
                value={initiative}
              />
            </Flex>
          </Grid>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium">
              Type
            </Text>
            <Select.Root
              onValueChange={value => {
                if (value === 'character' || value === 'monster') {
                  setCombatantType(value);
                }
              }}
              value={combatantType}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="character">Character (Player)</Select.Item>
                <Select.Item value="monster">Monster</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
        <Flex gap="3" justify="end" mt="4">
          <Dialog.Close>
            <Button color="gray" onClick={handleClose} type="button" variant="soft">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            disabled={
              !canConfirm || (mode === 'monster-index' && monsterDetailQuery.isFetching) || parseIntOrZero(maxHp) <= 0
            }
            onClick={handleConfirm}
            type="button"
          >
            Add
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
