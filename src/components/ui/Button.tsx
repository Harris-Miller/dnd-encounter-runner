import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from '../../styles/cn';

export type ButtonProps = {
  asChild?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({
  asChild = false,
  children,
  className,
  fullWidth = false,
  startIcon,
  type = 'button',
  variant = 'text',
  ...props
}) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'btn',
        variant === 'contained' && 'btn-contained',
        variant === 'outlined' && 'btn-outlined',
        variant === 'text' && 'btn-text',
        fullWidth && 'btn-full-width',
        className,
      )}
      type={asChild ? undefined : type}
      {...props}
    >
      {startIcon}
      {children}
    </Comp>
  );
};
