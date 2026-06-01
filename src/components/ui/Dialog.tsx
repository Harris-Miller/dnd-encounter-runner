import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

import { cn } from '../../styles/cn';

export type DialogProps = {
  children: ReactNode;
  fullWidth?: boolean;
  maxWidth?: 'sm';
  onClose?: () => void;
  open: boolean;
};

export const Dialog: FC<DialogProps> = ({ children, fullWidth: _fullWidth, maxWidth, onClose, open }) => (
  <DialogPrimitive.Root
    onOpenChange={nextOpen => {
      if (!nextOpen) onClose?.();
    }}
    open={open}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content
        className={cn('dialog-content', maxWidth === 'sm' && 'dialog-content-sm')}
        onEscapeKeyDown={() => onClose?.()}
        onPointerDownOutside={() => onClose?.()}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export const DialogTitle: FC<PropsWithChildren> = ({ children }) => (
  <DialogPrimitive.Title className="dialog-title">{children}</DialogPrimitive.Title>
);

export const DialogContent: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('dialog-body', className)} {...props}>
    {children}
  </div>
);

export const DialogActions: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('dialog-actions', className)} {...props}>
    {children}
  </div>
);
