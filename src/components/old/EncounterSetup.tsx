import AddIcon from '@mui/icons-material/Add';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';

import { getMonster, getMonsters } from '../../services/dndApi';
import { useEncounterStoreOrig } from '../../store/encounterStore';
import type { ApiReference } from '../../types/dnd';
import type { CharacterType } from '../../types/encounter';

export const EncounterSetup: FC = () => {
  const { encounter, createEncounter, addCharacter } = useEncounterStoreOrig();
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [openMonsterDialog, setOpenMonsterDialog] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerInitiative, setPlayerInitiative] = useState(0);
  const [monsterOptions, setMonsterOptions] = useState<ApiReference[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<ApiReference | null>(null);
  const [monsterInitiative, setMonsterInitiative] = useState(0);
  const [loadingMonsters, setLoadingMonsters] = useState(false);

  useEffect(() => {
    if (!openMonsterDialog || monsterOptions.length > 0) {
      return undefined;
    }
    let cancelled = false;
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setLoadingMonsters(true);
    }, 0);
    getMonsters()
      .then(response => {
        if (!cancelled) {
          setMonsterOptions(response.results);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error('Failed to load monsters:', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMonsters(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [openMonsterDialog, monsterOptions.length]);

  const handleCreateEncounter = useCallback(() => {
    createEncounter();
  }, [createEncounter]);

  const handleAddPlayer = useCallback(() => {
    if (!playerName.trim()) {
      return;
    }

    addCharacter({
      damageImmunities: [],
      damageResistances: [],
      damageVulnerabilities: [],
      initiative: playerInitiative,
      name: playerName,
      type: 'player' as CharacterType,
    });

    setPlayerName('');
    setPlayerInitiative(0);
    setOpenPlayerDialog(false);
  }, [addCharacter, playerName, playerInitiative]);

  const handleAddMonster = useCallback(() => {
    if (selectedMonster === null) {
      return;
    }

    const monsterName = selectedMonster.name;
    const monsterIndex = selectedMonster.index;

    // Load monster details to get resistances
    getMonster(monsterIndex)
      .then(monster => {
        addCharacter({
          damageImmunities: monster.damage_immunities ?? [],
          damageResistances: monster.damage_resistances ?? [],
          damageVulnerabilities: monster.damage_vulnerabilities ?? [],
          initiative: monsterInitiative,
          name: monsterName,
          type: 'monster' as CharacterType,
        });

        setSelectedMonster(null);
        setMonsterInitiative(0);
        setOpenMonsterDialog(false);
      })
      .catch((error: unknown) => {
        console.error('Failed to load monster details:', error);
        // Fallback: add without resistances
        addCharacter({
          damageImmunities: [],
          damageResistances: [],
          damageVulnerabilities: [],
          initiative: monsterInitiative,
          name: monsterName,
          type: 'monster' as CharacterType,
        });

        setSelectedMonster(null);
        setMonsterInitiative(0);
        setOpenMonsterDialog(false);
      });
  }, [addCharacter, selectedMonster, monsterInitiative]);

  if (!encounter) {
    return (
      <Card>
        <CardContent>
          <Typography gutterBottom variant="h5">
            Create Encounter
          </Typography>
          <Typography
            component="p"
            sx={{
              color: 'text.secondary',
            }}
            variant="body2"
          >
            Start a new encounter to begin tracking characters and conditions.
          </Typography>
          <Button onClick={handleCreateEncounter} startIcon={<AddIcon />} variant="contained">
            Create New Encounter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          onClick={() => {
            setOpenPlayerDialog(true);
          }}
          startIcon={<AddIcon />}
          variant="outlined"
        >
          Add Player
        </Button>
        <Button
          onClick={() => {
            setOpenMonsterDialog(true);
          }}
          startIcon={<AddIcon />}
          variant="outlined"
        >
          Add Monster
        </Button>
      </Box>

      <Dialog
        onClose={() => {
          setOpenPlayerDialog(false);
        }}
        open={openPlayerDialog}
      >
        <DialogTitle>Add Player Character</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Player Name"
            margin="dense"
            onChange={e => {
              setPlayerName(e.target.value);
            }}
            sx={{ mb: 2 }}
            value={playerName}
            variant="standard"
          />
          <TextField
            fullWidth
            label="Initiative"
            margin="dense"
            onChange={e => {
              setPlayerInitiative(Number(e.target.value));
            }}
            type="number"
            value={playerInitiative}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPlayerDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddPlayer} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => {
          setOpenMonsterDialog(false);
        }}
        open={openMonsterDialog}
      >
        <DialogTitle>Add Monster</DialogTitle>
        <DialogContent>
          <Autocomplete
            getOptionLabel={option => option.name}
            loading={loadingMonsters}
            onChange={(_, newValue) => {
              setSelectedMonster(newValue);
            }}
            options={monsterOptions}
            renderInput={params => <TextField {...params} label="Search Monsters" margin="dense" variant="standard" />}
            sx={{ mb: 2 }}
            value={selectedMonster}
          />
          <TextField
            fullWidth
            label="Initiative"
            margin="dense"
            onChange={e => {
              setMonsterInitiative(Number(e.target.value));
            }}
            type="number"
            value={monsterInitiative}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenMonsterDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button disabled={selectedMonster === null} onClick={handleAddMonster} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
