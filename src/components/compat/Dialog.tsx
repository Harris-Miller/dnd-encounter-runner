import type { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

import {
  DialogFooter,
  DialogHeader,
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogTitle as ShadcnDialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type DialogProps = {
  children: ReactNode;
  fullWidth?: boolean;
  maxWidth?: 'sm';
  onClose?: () => void;
  open: boolean;
};

export const Dialog: FC<DialogProps> = ({ children, maxWidth, onClose, open }) => (
  <ShadcnDialog
    onOpenChange={nextOpen => {
      if (!nextOpen) onClose?.();
    }}
    open={open}
  >
    <ShadcnDialogContent
      className={cn(maxWidth === 'sm' && 'sm:max-w-sm')}
      onEscapeKeyDown={() => onClose?.()}
      onPointerDownOutside={() => onClose?.()}
      showCloseButton={Boolean(onClose)}
    >
      {children}
    </ShadcnDialogContent>
  </ShadcnDialog>
);

export const DialogTitle: FC<PropsWithChildren> = ({ children }) => (
  <DialogHeader>
    <ShadcnDialogTitle>{children}</ShadcnDialogTitle>
  </DialogHeader>
);

export const DialogContent: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('flex flex-col gap-4', className)} {...props}>
    {children}
  </div>
);

export const DialogActions: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <DialogFooter className={cn(className)} {...props}>
    {children}
  </DialogFooter>
);
