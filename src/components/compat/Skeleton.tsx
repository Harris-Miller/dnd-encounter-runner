import type { FC, HTMLAttributes } from 'react';

import { Skeleton as ShadcnSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type SkeletonProps = {
  height?: number;
  variant?: 'rectangular' | 'text';
  width?: number | string;
} & HTMLAttributes<HTMLDivElement>;

export const Skeleton: FC<SkeletonProps> = ({ className, height, style, variant = 'text', width, ...props }) => (
  <ShadcnSkeleton
    className={cn(variant === 'text' && 'h-4 w-full rounded-md', variant === 'rectangular' && 'rounded-lg', className)}
    style={{ height, width, ...style }}
    {...props}
  />
);
