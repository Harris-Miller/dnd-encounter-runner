import type { CSSProperties, ElementType, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type BoxProps = {
  component?: ElementType;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>;

export const Box = ({ className, component: Component = 'div', style, ...props }: BoxProps) => (
  <Component className={cn(className)} style={style} {...props} />
);
