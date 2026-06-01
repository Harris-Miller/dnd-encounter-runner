import type { CSSProperties, FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

type StackDirection = 'column' | 'row' | { sm?: 'column' | 'row'; xs?: 'column' | 'row' };

export type StackProps = {
  alignItems?: CSSProperties['alignItems'];
  direction?: StackDirection;
  flexWrap?: CSSProperties['flexWrap'];
  gap?: number;
  spacing?: number;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>;

const gapClass = (spacing: number): string => {
  if (spacing <= 1) return 'stack-gap-1';
  if (spacing <= 2) return 'stack-gap-2';
  if (spacing <= 3) return 'stack-gap-3';
  return 'stack-gap-4';
};

export const Stack: FC<StackProps> = ({
  alignItems,
  children,
  className,
  direction = 'column',
  flexWrap,
  gap,
  spacing = 2,
  style,
  ...props
}) => {
  const resolvedGap = gap ?? spacing;
  const isRow = direction === 'row' || (typeof direction === 'object' && direction.xs === 'row');

  return (
    <div
      className={cn(
        'stack',
        isRow && 'stack-row',
        gapClass(resolvedGap),
        alignItems === 'center' && 'stack-align-center',
        flexWrap === 'wrap' && 'stack-wrap',
        className,
      )}
      style={{ alignItems, flexWrap, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
