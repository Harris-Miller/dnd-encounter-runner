import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import type { FC } from 'react';

import { getAllConditions } from '../../data/conditions';
import { useEncounterStoreOrig } from '../../store/encounterStore';
import type { StandardCondition } from '../../types/encounter';

export const ConditionManager: FC = () => {
  const { encounter, addCondition, removeCondition } = useEncounterStoreOrig();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<{
    id: StandardCondition;
    name: string;
  } | null>(null);
  const [conditionSource, setConditionSource] = useState('');
  const [conditionDuration, setConditionDuration] = useState<number | undefined>(undefined);

  const conditions = getAllConditions();

  const handleAddCondition = useCallback(() => {
    if (!selectedCharacterId || !selectedCondition || !conditionSource.trim()) {
      return;
    }

    addCondition(selectedCharacterId, selectedCondition.id, conditionSource, conditionDuration);

    setSelectedCharacterId('');
    setSelectedCondition(null);
    setConditionSource('');
    setConditionDuration(undefined);
    setOpenDialog(false);
  }, [addCondition, selectedCharacterId, selectedCondition, conditionSource, conditionDuration]);

  const handleRemoveCondition = useCallback(
    (characterId: string, effectId: string) => {
      removeCondition(characterId, effectId);
    },
    [removeCondition],
  );

  if (!encounter || encounter.characters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h5">Manage Conditions</Typography>
          <Button
            onClick={() => {
              setOpenDialog(true);
            }}
            startIcon={<AddIcon />}
            variant="outlined"
          >
            Add Condition
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {encounter.characters.map(character => (
            <Box key={character.id}>
              <Typography gutterBottom variant="subtitle1">
                {character.name}
              </Typography>
              {character.activeEffects.length === 0 ? (
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                  variant="body2"
                >
                  No active conditions
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {character.activeEffects.map(effect => {
                    const condition = conditions.find(c => c.id === effect.conditionId);
                    return (
                      <Chip
                        color="warning"
                        deleteIcon={<DeleteIcon />}
                        key={effect.id}
                        label={condition ? `${condition.name} (${effect.source})` : effect.conditionId}
                        onDelete={() => {
                          handleRemoveCondition(character.id, effect.id);
                        }}
                        title={effect.source}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Dialog
          fullWidth
          onClose={() => {
            setOpenDialog(false);
          }}
          open={openDialog}
        >
          <DialogTitle>Add Condition</DialogTitle>
          <DialogContent>
            <Autocomplete
              getOptionLabel={option => option.name}
              onChange={(_, newValue) => {
                setSelectedCharacterId(newValue?.id ?? '');
              }}
              options={encounter.characters}
              renderInput={params => <TextField {...params} label="Character" margin="dense" variant="standard" />}
              sx={{ mb: 2 }}
              value={encounter.characters.find(c => c.id === selectedCharacterId) ?? null}
            />
            <Autocomplete
              getOptionLabel={option => option.name}
              onChange={(_, newValue) => {
                setSelectedCondition(newValue ? { id: newValue.id, name: newValue.name } : null);
              }}
              options={conditions}
              renderInput={params => <TextField {...params} label="Condition" margin="dense" variant="standard" />}
              sx={{ mb: 2 }}
              value={selectedCondition}
            />
            <TextField
              fullWidth
              label="Source (e.g., 'Poison Dart', 'Spell: Hold Person')"
              margin="dense"
              onChange={e => {
                setConditionSource(e.target.value);
              }}
              sx={{ mb: 2 }}
              value={conditionSource}
              variant="standard"
            />
            <TextField
              fullWidth
              label="Duration (in turns, optional)"
              margin="dense"
              onChange={e => {
                setConditionDuration(e.target.value !== '' ? Number(e.target.value) : undefined);
              }}
              type="number"
              value={conditionDuration ?? ''}
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={selectedCharacterId === '' || selectedCondition === null || conditionSource.trim() === ''}
              onClick={handleAddCondition}
              variant="contained"
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};
