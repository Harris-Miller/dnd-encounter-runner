import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import type { FC } from 'react';

export interface CharacterDeleteDialogProps {
  characterName: null | string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export const CharacterDeleteDialog: FC<CharacterDeleteDialogProps> = ({
  characterName,
  isPending,
  onCancel,
  onConfirm,
  open,
}) => (
  <Dialog fullWidth maxWidth="xs" onClose={onCancel} open={open}>
    <DialogTitle>Delete character</DialogTitle>
    <DialogContent>
      <Typography variant="body2">
        Delete <strong>{characterName ?? 'this character'}</strong>? This cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button color="error" disabled={isPending} onClick={onConfirm} variant="contained">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);
