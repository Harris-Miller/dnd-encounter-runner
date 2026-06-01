import type { FC, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../styles/cn';

export type DividerProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const Divider: FC<DividerProps> = ({ children, className, ...props }) => (
  <div className={cn('divider', className)} role="separator" {...props}>
    {children}
  </div>
);
