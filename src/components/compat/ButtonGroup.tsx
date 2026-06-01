import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement>;

export const ButtonGroup: FC<ButtonGroupProps> = ({ className, ...props }) => (
  <div className={cn('btn-group', className)} role="group" {...props} />
);
