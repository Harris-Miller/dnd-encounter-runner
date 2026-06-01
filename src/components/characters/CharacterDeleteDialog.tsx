import type { FC } from 'react';

import { Button } from '../compat/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../compat/Dialog';
import { Typography } from '../compat/Typography';

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
  <Dialog maxWidth="sm" onClose={onCancel} open={open}>
    <DialogTitle>Delete character</DialogTitle>
    <DialogContent>
      <Typography variant="body2">
        Delete <strong>{characterName ?? 'this character'}</strong>? This cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
      <Button disabled={isPending} onClick={onConfirm} type="button" variant="contained">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);
