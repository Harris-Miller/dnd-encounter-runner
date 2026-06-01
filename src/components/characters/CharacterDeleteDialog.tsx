import * as Dialog from '@radix-ui/react-dialog';
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
  <Dialog.Root
    onOpenChange={nextOpen => {
      if (!nextOpen) {
        onCancel();
      }
    }}
    open={open}
  >
    <Dialog.Portal>
      <Dialog.Overlay className="radix-overlay" />
      <Dialog.Content className="radix-dialog-content">
        <Dialog.Title>Delete character</Dialog.Title>
        <p style={{ margin: '1rem 0' }}>
          Delete <strong>{characterName ?? 'this character'}</strong>? This cannot be undone.
        </p>
        <div className="dialog-actions">
          <button onClick={onCancel} type="button">
            Cancel
          </button>
          <button disabled={isPending} onClick={onConfirm} type="button">
            Delete
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
