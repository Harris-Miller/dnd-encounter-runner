import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { FC, PropsWithChildren, ReactNode } from 'react';

export type DrawerProps = {
  anchor?: 'right';
  children: ReactNode;
  onClose: () => void;
  open: boolean;
};

export const Drawer: FC<DrawerProps> = ({ children, onClose, open }) => (
  <DialogPrimitive.Root
    onOpenChange={nextOpen => {
      if (!nextOpen) onClose();
    }}
    open={open}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="drawer-overlay" />
      <DialogPrimitive.Content className="drawer-content" onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export const DrawerContent: FC<PropsWithChildren> = ({ children }) => children;
