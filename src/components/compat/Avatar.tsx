import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { FC } from 'react';

import { cn } from '../../styles/cn';

export type AvatarProps = {
  alt?: string;
  className?: string;
  src?: string;
};

export const Avatar: FC<AvatarProps> = ({ alt, className, src }) => (
  <AvatarPrimitive.Root className={cn('avatar', className)}>
    <AvatarPrimitive.Image alt={alt} src={src} />
    <AvatarPrimitive.Fallback>{alt?.charAt(0) ?? '?'}</AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
);
