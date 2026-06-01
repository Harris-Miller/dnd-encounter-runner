import type { ButtonHTMLAttributes, FC } from 'react';

import { cn } from '../../styles/cn';

export type IconButtonProps = {
  size?: 'medium' | 'small';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton: FC<IconButtonProps> = ({ className, size = 'medium', ...props }) => (
  <button className={cn('btn-icon', size === 'small' && 'btn-icon-sm', className)} type="button" {...props} />
);
