import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonProps = {
  asChild?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantMap = {
  contained: 'default',
  outlined: 'outline',
  text: 'ghost',
} as const;

export const Button: FC<ButtonProps> = ({
  asChild = false,
  children,
  className,
  fullWidth = false,
  startIcon,
  type = 'button',
  variant = 'text',
  ...props
}) => (
  <ShadcnButton
    asChild={asChild}
    className={cn(fullWidth && 'w-full', className)}
    type={asChild ? undefined : type}
    variant={variantMap[variant]}
    {...props}
  >
    {startIcon}
    {children}
  </ShadcnButton>
);
