import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

type AlertSeverity = 'error' | 'info' | 'success' | 'warning';

export type AlertProps = {
  severity?: AlertSeverity;
} & HTMLAttributes<HTMLDivElement>;

export const Alert: FC<AlertProps> = ({ children, className, severity = 'info', ...props }) => (
  <div
    className={cn(
      'alert',
      severity === 'error' && 'alert-error',
      severity === 'success' && 'alert-success',
      severity === 'info' && 'alert-info',
      severity === 'warning' && 'alert-warning',
      className,
    )}
    role="alert"
    {...props}
  >
    {children}
  </div>
);
