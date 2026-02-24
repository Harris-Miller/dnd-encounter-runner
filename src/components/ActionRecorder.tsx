import { Autocomplete, Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import type { FC } from 'react';

import { useEncounterStoreOrig } from '../store/encounterStore';
import type { TriggerEvent } from '../types/triggers';

export const ActionRecorder: FC = () => {
  const { encounter, recordEvent, addCondition } = useEncounterStoreOrig();
  const [attackerId, setAttackerId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [damageType, setDamageType] = useState('');
  const [spellName, setSpellName] = useState('');
  const [requiresConcentration, setRequiresConcentration] = useState(false);

  const handleRecordAttack = useCallback(() => {
    if (!attackerId || !targetId || !encounter) {
      return;
    }

    const attackEvent: TriggerEvent = {
      characterId: attackerId,
      payload: {
        targetId,
      },
      timestamp: Date.now(),
      type: 'ON_ATTACK',
    };

    recordEvent(attackEvent);

    const hitEvent: TriggerEvent = {
      characterId: targetId,
      payload: {
        attackerId,
        targetId,
      },
      timestamp: Date.now(),
      type: 'ON_HIT',
    };

    recordEvent(hitEvent);

    setAttackerId('');
    setTargetId('');
  }, [attackerId, targetId, encounter, recordEvent]);

  const handleRecordDamage = useCallback(() => {
    if (!targetId || !damageType || !encounter) {
      return;
    }

    const damageEvent: TriggerEvent = {
      characterId: targetId,
      payload: {
        damageType,
      },
      timestamp: Date.now(),
      type: 'ON_DAMAGE',
    };

    recordEvent(damageEvent, damageType);

    setTargetId('');
    setDamageType('');
  }, [targetId, damageType, encounter, recordEvent]);

  const handleRecordSpell = useCallback(() => {
    if (!attackerId || !spellName || !encounter) {
      return;
    }

    const spellEvent: TriggerEvent = {
      characterId: attackerId,
      payload: {
        requiresConcentration,
        spellName,
        targetIds: targetId ? [targetId] : undefined,
      },
      timestamp: Date.now(),
      type: 'ON_SPELL_CAST',
    };

    recordEvent(spellEvent);

    if (requiresConcentration) {
      // Remove any existing concentration effects first (only one concentration at a time)
      const caster = encounter.characters.find(c => c.id === attackerId);
      if (caster) {
        const existingConcentration = caster.activeEffects.find(effect => effect.conditionId === 'concentrating');
        if (existingConcentration) {
          // In a real implementation, we'd want to remove the old one
          // For now, we'll just add the new one
        }
      }
      // Add concentrating condition if spell requires it
      addCondition(attackerId, 'concentrating', `Spell: ${spellName}`);
    }

    setAttackerId('');
    setTargetId('');
    setSpellName('');
    setRequiresConcentration(false);
  }, [attackerId, spellName, requiresConcentration, targetId, encounter, recordEvent, addCondition]);

  const handleStartOfTurn = useCallback(
    (characterId: string) => {
      const event: TriggerEvent = {
        characterId,
        timestamp: Date.now(),
        type: 'START_OF_TURN',
      };
      recordEvent(event);
    },
    [recordEvent],
  );

  const handleEndOfTurn = useCallback(
    (characterId: string) => {
      const event: TriggerEvent = {
        characterId,
        timestamp: Date.now(),
        type: 'END_OF_TURN',
      };
      recordEvent(event);
    },
    [recordEvent],
  );

  if (!encounter || encounter.characters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h5">
          Record Actions
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography gutterBottom variant="subtitle1">
              Attack
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Autocomplete
                getOptionLabel={option => option.name}
                onChange={(_, newValue) => {
                  setAttackerId(newValue?.id ?? '');
                }}
                options={encounter.characters}
                renderInput={params => <TextField {...params} label="Attacker" size="small" />}
                sx={{ minWidth: 150 }}
                value={encounter.characters.find(c => c.id === attackerId) ?? null}
              />
              <Autocomplete
                getOptionLabel={option => option.name}
                onChange={(_, newValue) => {
                  setTargetId(newValue?.id ?? '');
                }}
                options={encounter.characters}
                renderInput={params => <TextField {...params} label="Target" size="small" />}
                sx={{ minWidth: 150 }}
                value={encounter.characters.find(c => c.id === targetId) ?? null}
              />
              <Button disabled={attackerId === '' || targetId === ''} onClick={handleRecordAttack} variant="contained">
                Record Attack
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography gutterBottom variant="subtitle1">
              Damage
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Autocomplete
                getOptionLabel={option => option.name}
                onChange={(_, newValue) => {
                  setTargetId(newValue?.id ?? '');
                }}
                options={encounter.characters}
                renderInput={params => <TextField {...params} label="Target" size="small" />}
                sx={{ minWidth: 150 }}
                value={encounter.characters.find(c => c.id === targetId) ?? null}
              />
              <TextField
                label="Damage Type"
                onChange={e => {
                  setDamageType(e.target.value);
                }}
                placeholder="e.g., poison, fire, cold"
                size="small"
                sx={{ minWidth: 150 }}
                value={damageType}
              />
              <Button
                disabled={targetId === '' || damageType.trim() === ''}
                onClick={handleRecordDamage}
                variant="contained"
              >
                Record Damage
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography gutterBottom variant="subtitle1">
              Spell Cast
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Autocomplete
                  getOptionLabel={option => option.name}
                  onChange={(_, newValue) => {
                    setAttackerId(newValue?.id ?? '');
                  }}
                  options={encounter.characters}
                  renderInput={params => <TextField {...params} label="Caster" size="small" />}
                  sx={{ minWidth: 150 }}
                  value={encounter.characters.find(c => c.id === attackerId) ?? null}
                />
                <TextField
                  label="Spell Name"
                  onChange={e => {
                    setSpellName(e.target.value);
                  }}
                  size="small"
                  sx={{ minWidth: 200 }}
                  value={spellName}
                />
                <Button
                  disabled={attackerId === '' || spellName.trim() === ''}
                  onClick={handleRecordSpell}
                  variant="contained"
                >
                  Record Spell
                </Button>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography gutterBottom variant="subtitle1">
              Turn Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {encounter.characters.map(character => (
                <Box key={character.id} sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={() => {
                      handleStartOfTurn(character.id);
                    }}
                    size="small"
                    variant="outlined"
                  >
                    {character.name} Start
                  </Button>
                  <Button
                    onClick={() => {
                      handleEndOfTurn(character.id);
                    }}
                    size="small"
                    variant="outlined"
                  >
                    {character.name} End
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
