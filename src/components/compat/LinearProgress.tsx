import type { FC, HTMLAttributes } from 'react';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type LinearProgressProps = {
  value?: number;
  variant?: 'determinate' | 'indeterminate';
} & HTMLAttributes<HTMLDivElement>;

export const LinearProgress: FC<LinearProgressProps> = ({
  className,
  value = 0,
  variant = 'indeterminate',
  ...props
}) => (
  <Progress
    className={cn(className)}
    value={variant === 'determinate' ? Math.min(100, Math.max(0, value)) : undefined}
    {...props}
  />
);
