import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { createRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { rootRoute } from '../../routes/rootRoute';
import { useEncounterStore } from '../../store/encounter';
import { RouterLink } from '../RouterLink';

export const encounterRoute = createRoute({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  component: EncounterPage,
  getParentRoute: () => rootRoute,
  path: '/encounter/$encounterId',
});

// eslint-disable-next-line func-style, react/function-component-definition, react-refresh/only-export-components
function EncounterPage() {
  const { encounterId } = encounterRoute.useParams();
  const encounter = useEncounterStore(state => state.encounters[encounterId]);
  const setName = useEncounterStore(state => state.setName);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (encounter == null) {
    return <Typography>Encounter not found</Typography>;
  }

  return (
    <>
      <Typography>
        <RouterLink to="/">Back to encounters</RouterLink>
      </Typography>
      <Card>
        <CardHeader
          title={
            <Box>
              {encounter.name}{' '}
              <IconButton onClick={handleClickOpen} size="small">
                <EditIcon />
              </IconButton>
            </Box>
          }
        />
        <CardContent />
      </Card>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Rename Encounter</DialogTitle>
        <DialogContent>
          <form
            id="update-encounter-name-form"
            onSubmit={event => {
              event.preventDefault();
              const formData = new FormData(event.target);
              const newName = formData.get('name') as string;
              setName(encounter.id, newName);
              handleClose();
            }}
          >
            <TextField
              autoFocus
              defaultValue={encounter.name}
              fullWidth
              id="name"
              label="Encounter Name"
              margin="dense"
              name="name"
              required
              type="text"
              variant="standard"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button form="update-encounter-name-form" type="submit">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
