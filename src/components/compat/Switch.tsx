import type { FC, InputHTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Switch: FC<SwitchProps> = ({ className, ...props }) => (
  <input className={cn('switch-input', className)} type="checkbox" {...props} />
);
