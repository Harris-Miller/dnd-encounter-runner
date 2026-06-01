import type { FC } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type CircularProgressProps = {
  className?: string;
};

export const CircularProgress: FC<CircularProgressProps> = ({ className }) => (
  <Spinner aria-label="Loading" className={cn('size-10', className)} />
);
