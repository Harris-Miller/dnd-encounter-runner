import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type PaperProps = {
  elevation?: number;
  variant?: 'elevation' | 'outlined';
} & HTMLAttributes<HTMLDivElement>;

export const Paper: FC<PaperProps> = ({ className, elevation = 1, variant = 'elevation', ...props }) => (
  <div
    className={cn(
      'paper',
      variant === 'outlined' && 'paper-outlined',
      elevation >= 6 && 'paper-elevation-6',
      className,
    )}
    {...props}
  />
);
