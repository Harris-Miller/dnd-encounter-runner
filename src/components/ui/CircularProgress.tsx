import { Loader2 } from 'lucide-react';
import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type CircularProgressProps = HTMLAttributes<SVGSVGElement>;

export const CircularProgress: FC<CircularProgressProps> = ({ className, ...props }) => (
  <Loader2 aria-label="Loading" className={cn('circular-progress', className)} size={40} {...props} />
);
