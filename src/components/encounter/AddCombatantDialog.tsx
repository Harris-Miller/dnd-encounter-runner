import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FC, SyntheticEvent } from 'react';

import { queryCharactersList } from '../../api/characters';
import { queryMonster, queryMonstersSearch } from '../../api/monsters';
import type { MonsterSummary } from '../../api/monsters';
import type { Combatant, CombatantType } from '../../types/encounterState';
import { DEFAULT_ACTION_ECONOMY } from '../../types/encounterState';
import { Autocomplete } from '../compat/Autocomplete';
import { Box } from '../compat/Box';
import { Button } from '../compat/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../compat/Dialog';
import { Stack } from '../compat/Stack';
import { Tab, Tabs } from '../compat/Tabs';
import { MenuItem, TextField } from '../compat/TextField';

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

  const handleModeChange = (_event: SyntheticEvent, nextMode: string) => {
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
    <Dialog maxWidth="sm" onClose={handleClose} open={open}>
      <DialogTitle>Add combatant</DialogTitle>
      <DialogContent>
        <Stack spacing={2} style={{ paddingTop: 8 }}>
          <Tabs onChange={handleModeChange} value={mode}>
            <Tab label="From roster" value="character-roster" />
            <Tab label="From monster index" value="monster-index" />
            <Tab label="Custom" value="custom" />
          </Tabs>

          {mode === 'character-roster' && (
            <TextField
              fullWidth
              label="Character"
              onChange={event => {
                handleCharacterSelect(event.target.value);
              }}
              select
              value={selectedCharacterId ?? ''}
            >
              {characters.length === 0 ? (
                <MenuItem disabled value="">
                  No saved characters
                </MenuItem>
              ) : (
                characters.map(character => (
                  <MenuItem key={character.id} value={character.id}>
                    {character.name} · AC {String(character.armorClass)} · {String(character.maxHitPoints)} HP
                  </MenuItem>
                ))
              )}
            </TextField>
          )}

          {mode === 'monster-index' && (
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
                <TextField
                  id={id}
                  label="Monster"
                  onChange={e => {
                    onChange(e.target.value);
                  }}
                  onFocus={onFocus}
                  value={value}
                />
              )}
              value={monsters.find(option => option.id === selectedMonsterId) ?? null}
            />
          )}

          <TextField
            label="Name"
            onChange={event => {
              setName(event.target.value);
            }}
            value={name}
          />

          <Box className="grid-3">
            <TextField
              label="AC"
              onChange={event => {
                setArmorClass(event.target.value);
              }}
              type="number"
              value={armorClass}
            />
            <TextField
              label="Max HP"
              onChange={event => {
                setMaxHp(event.target.value);
              }}
              type="number"
              value={maxHp}
            />
            <TextField
              label="Initiative"
              onChange={event => {
                setInitiative(event.target.value);
              }}
              type="number"
              value={initiative}
            />
          </Box>

          <TextField
            label="Type"
            onChange={event => {
              const next = event.target.value;
              if (next === 'character' || next === 'monster') {
                setCombatantType(next);
              }
            }}
            select
            value={combatantType}
          >
            <MenuItem value="character">Character (Player)</MenuItem>
            <MenuItem value="monster">Monster</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} type="button">
          Cancel
        </Button>
        <Button
          disabled={
            !canConfirm || (mode === 'monster-index' && monsterDetailQuery.isFetching) || parseIntOrZero(maxHp) <= 0
          }
          onClick={handleConfirm}
          type="button"
          variant="contained"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
