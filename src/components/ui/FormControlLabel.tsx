import type { FC, ReactNode } from 'react';

import { cn } from '../../styles/cn';

export type FormControlLabelProps = {
  className?: string;
  control: ReactNode;
  label: ReactNode;
};

export const FormControlLabel: FC<FormControlLabelProps> = ({ className, control, label }) => (
  <div className={cn('form-control-label', className)} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
    {control}
    <span>{label}</span>
  </div>
);
