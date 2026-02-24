import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { FC } from 'react';

import { useEncounterStore } from '../store/encounter';
import type { Encounter } from '../store/encounter';

export const LandingPage: FC = () => {
  const encounters = useEncounterStore((state): Record<string, Encounter> => state.encounters);
  const createEncounter = useEncounterStore(state => state.create);
  const deleteEncounter = useEncounterStore(state => state.delete);

  const encounterList: Encounter[] = Object.values(encounters);

  return (
    <Card>
      <CardContent>
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Encounters</Typography>
          <Button onClick={createEncounter} startIcon={<AddIcon />} variant="contained">
            Create Encounter
          </Button>
        </Box>
        {encounterList.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No encounters created yet. Create an encounter to get started.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Combatants</TableCell>
                  <TableCell>Current Initiative</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {encounterList.map(encounter => {
                  const combatantCount = Object.keys(encounter.combatants).length;
                  const currentCombatant =
                    encounter.currentInitiative != null && encounter.currentInitiative !== ''
                      ? encounter.combatants[encounter.currentInitiative]
                      : null;

                  return (
                    <TableRow key={encounter.id}>
                      <TableCell>{encounter.name}</TableCell>
                      <TableCell>
                        <Chip
                          color={encounter.active ? 'success' : 'default'}
                          label={encounter.active ? 'Active' : 'Inactive'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{combatantCount}</TableCell>
                      <TableCell>
                        {currentCombatant ? (
                          <Box>
                            <Typography component="span" variant="body2">
                              {currentCombatant.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography color="text.secondary" component="span" variant="body2">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => {
                            deleteEncounter(encounter.id);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
