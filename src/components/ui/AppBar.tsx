import type { FC, HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../styles/cn';

export type AppBarProps = {
  position?: 'fixed';
} & HTMLAttributes<HTMLElement>;

export const AppBar: FC<AppBarProps> = ({ children, className, ...props }) => (
  <header className={cn('app-bar', className)} {...props}>
    {children}
  </header>
);

export const Toolbar: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, className, ...props }) => (
  <div className={cn('toolbar', className)} {...props}>
    {children}
  </div>
);
