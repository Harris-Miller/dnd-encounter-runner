import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

type ChipColor = 'default' | 'error' | 'info' | 'success' | 'warning';
type ChipVariant = 'filled' | 'outlined';

export type ChipProps = {
  color?: ChipColor;
  label: string;
  size?: 'small';
  variant?: ChipVariant;
} & HTMLAttributes<HTMLSpanElement>;

export const Chip: FC<ChipProps> = ({ className, color = 'default', label, variant = 'filled', ...props }) => (
  <span
    className={cn(
      'chip',
      variant === 'outlined' && 'chip-outlined',
      variant === 'filled' && color === 'error' && 'chip-filled-error',
      variant === 'filled' && color === 'info' && 'chip-filled-info',
      variant === 'filled' && color === 'default' && 'chip-filled-default',
      variant === 'filled' && color === 'success' && 'chip-filled-success',
      variant === 'filled' && color === 'warning' && 'chip-filled-warning',
      className,
    )}
    {...props}
  >
    {label}
  </span>
);
