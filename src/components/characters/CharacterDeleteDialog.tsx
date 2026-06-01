import { Button, Dialog, Flex, Text } from '@radix-ui/themes';
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
    <Dialog.Content maxWidth="480px">
      <Dialog.Title>Delete character</Dialog.Title>
      <Text as="p" mt="4">
        Delete <strong>{characterName ?? 'this character'}</strong>? This cannot be undone.
      </Text>
      <Flex gap="3" justify="end" mt="4">
        <Dialog.Close>
          <Button color="gray" onClick={onCancel} type="button" variant="soft">
            Cancel
          </Button>
        </Dialog.Close>
        <Button color="red" disabled={isPending} onClick={onConfirm} type="button">
          Delete
        </Button>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
);
