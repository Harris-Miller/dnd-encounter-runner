import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Card, CardContent, Chip, IconButton, TextField, Typography } from '@mui/material';
import { useCallback } from 'react';
import type { FC } from 'react';

import { getConditionById } from '../../data/conditions';
import { useEncounterStoreOrig } from '../../store/encounterStore';

export const CharacterList: FC = () => {
  const { encounter, updateCharacterInitiative, removeCharacter } = useEncounterStoreOrig();

  const handleInitiativeChange = useCallback(
    (characterId: string, value: number) => {
      updateCharacterInitiative(characterId, value);
    },
    [updateCharacterInitiative],
  );

  const handleRemoveCharacter = useCallback(
    (characterId: string) => {
      removeCharacter(characterId);
    },
    [removeCharacter],
  );

  if (!encounter || encounter.characters.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography
            sx={{
              color: 'text.secondary',
            }}
            variant="body2"
          >
            No characters in encounter. Add players or monsters to get started.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Initiative Order</Typography>
      {encounter.characters.map(character => (
        <Card key={character.id}>
          <CardContent>
            <Box
              sx={{
                alignItems: 'flex-start',
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Typography variant="h6">{character.name}</Typography>
                  <Chip
                    color={character.type === 'player' ? 'primary' : 'secondary'}
                    label={character.type}
                    size="small"
                  />
                  <TextField
                    label="Initiative"
                    onChange={e => {
                      handleInitiativeChange(character.id, Number(e.target.value));
                    }}
                    size="small"
                    sx={{ width: 100 }}
                    type="number"
                    value={character.initiative}
                  />
                </Box>

                {character.activeEffects.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                      }}
                      variant="caption"
                    >
                      Conditions:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {character.activeEffects.map(effect => {
                        const condition = getConditionById(effect.conditionId);
                        return (
                          <Chip
                            color="warning"
                            key={effect.id}
                            label={condition.name}
                            size="small"
                            title={`${condition.name}: ${condition.description}`}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {(character.damageResistances.length > 0 ||
                  character.damageVulnerabilities.length > 0 ||
                  character.damageImmunities.length > 0) && (
                  <Box>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                      }}
                      variant="caption"
                    >
                      Damage Modifiers:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {character.damageResistances.map(resistance => (
                        <Chip
                          color="info"
                          key={`resistance-${resistance}`}
                          label={`Resistant: ${resistance}`}
                          size="small"
                        />
                      ))}
                      {character.damageVulnerabilities.map(vulnerability => (
                        <Chip
                          color="error"
                          key={`vulnerability-${vulnerability}`}
                          label={`Vulnerable: ${vulnerability}`}
                          size="small"
                        />
                      ))}
                      {character.damageImmunities.map(immunity => (
                        <Chip color="default" key={`immunity-${immunity}`} label={`Immune: ${immunity}`} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              <IconButton
                color="error"
                onClick={() => {
                  handleRemoveCharacter(character.id);
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
