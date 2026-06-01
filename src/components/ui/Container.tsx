import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

type ContainerMaxWidth = 'md' | 'sm' | 'xl';

export type ContainerProps = {
  maxWidth?: ContainerMaxWidth | false;
} & HTMLAttributes<HTMLDivElement>;

const maxWidthClass: Record<ContainerMaxWidth, string> = {
  md: 'container-md',
  sm: 'container-sm',
  xl: 'container-xl',
};

export const Container: FC<ContainerProps> = ({ className, maxWidth = 'lg', ...props }) => (
  <div
    className={cn(
      'container',
      maxWidth !== false && maxWidth in maxWidthClass && maxWidthClass[maxWidth as ContainerMaxWidth],
      className,
    )}
    {...props}
  />
);
