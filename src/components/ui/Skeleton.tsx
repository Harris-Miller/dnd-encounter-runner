import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type SkeletonProps = {
  height?: number;
  variant?: 'rectangular' | 'text';
  width?: number | string;
} & HTMLAttributes<HTMLDivElement>;

export const Skeleton: FC<SkeletonProps> = ({ className, height, style, variant = 'text', width, ...props }) => (
  <div
    className={cn('skeleton', variant === 'rectangular' && 'skeleton-rect', className)}
    style={{ height, width, ...style }}
    {...props}
  />
);
