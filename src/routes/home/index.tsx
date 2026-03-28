// @ts-nocheck
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FC } from 'react';

// import { supabase } from '../services/supabase';
import { RouterLink } from '../../components/RouterLink';
import { useEncounterStore } from '../../store/encounter';
import type { Encounter } from '../../store/encounter';

const HomeComponentOld: FC = () => {
  const navigate = useNavigate();
  const encounters = useEncounterStore((state): Record<string, Encounter> => state.encounters);
  const createEncounter = useEncounterStore(state => state.create);
  const deleteEncounter = useEncounterStore(state => state.delete);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [encounterToDelete, setEncounterToDelete] = useState<Encounter | null>(null);

  const encounterList: Encounter[] = Object.values(encounters);

  const handleCreateEncounter = () => {
    const newEncounter = createEncounter();
    navigate({ params: { encounterId: newEncounter.id }, to: '/encounter/$encounterId' });
  };

  const handleDeleteClick = (encounter: Encounter) => {
    setEncounterToDelete(encounter);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (encounterToDelete) {
      deleteEncounter(encounterToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEncounterToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEncounterToDelete(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Encounters</Typography>
            <Button onClick={handleCreateEncounter} startIcon={<AddIcon />} variant="contained">
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
                        <TableCell>
                          <RouterLink params={{ encounterId: encounter.id }} to="/encounter/$encounterId">
                            {encounter.name}
                          </RouterLink>
                        </TableCell>
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
                              handleDeleteClick(encounter);
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
          <Dialog onClose={handleDeleteCancel} open={deleteDialogOpen}>
            <DialogTitle>Delete Encounter</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete &quot;{encounterToDelete?.name}&quot;? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button color="error" onClick={handleDeleteConfirm} variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export const Route = createFileRoute('/home/')({
  component: HomeComponentOld,
});
