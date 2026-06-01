import type { FC, HTMLAttributes } from 'react';

import { AlertDescription, AlertTitle, Alert as ShadcnAlert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type AlertSeverity = 'error' | 'info' | 'success' | 'warning';

export type AlertProps = {
  severity?: AlertSeverity;
} & HTMLAttributes<HTMLDivElement>;

const severityClassName: Record<AlertSeverity, string> = {
  error: 'border-destructive/50 text-destructive',
  info: 'border-border text-foreground',
  success: 'border-[color:var(--color-success)] text-[color:var(--color-success)]',
  warning: 'border-[color:var(--color-warning)] text-[color:var(--color-warning)]',
};

export const Alert: FC<AlertProps> = ({ children, className, severity = 'info', ...props }) => (
  <ShadcnAlert className={cn(severityClassName[severity], className)} {...props}>
    <AlertTitle className="sr-only">{severity}</AlertTitle>
    <AlertDescription>{children}</AlertDescription>
  </ShadcnAlert>
);
