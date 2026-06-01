import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type LinkProps = {
  color?: 'inherit' | 'primary';
  underline?: 'always' | 'hover' | 'none';
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, className, color, underline = 'hover', ...props }, ref) => (
    <a
      className={cn('ui-link', color === 'inherit' && 'nav-link', underline === 'none' && 'nav-link', className)}
      ref={ref}
      {...props}
    >
      {children}
    </a>
  ),
);

Link.displayName = 'Link';
