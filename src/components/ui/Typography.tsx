import type { ElementType, FC, HTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

type TypographyVariant =
  | 'body1'
  | 'body2'
  | 'caption'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2';

type TypographyColor = 'error' | 'info' | 'inherit' | 'primary' | 'secondary' | 'success' | 'warning';

export type TypographyProps = {
  color?: TypographyColor;
  component?: ElementType;
  variant?: TypographyVariant;
} & HTMLAttributes<HTMLElement>;

const variantClass: Record<TypographyVariant, string> = {
  body1: 'typography-body1',
  body2: 'typography-body2',
  caption: 'typography-body2',
  h1: 'typography-h1',
  h2: 'typography-h2',
  h3: 'typography-h3',
  h4: 'typography-h4',
  h5: 'typography-h5',
  h6: 'typography-h6',
  subtitle1: 'typography-body1',
  subtitle2: 'typography-body2',
};

const defaultComponent: Record<TypographyVariant, ElementType> = {
  body1: 'p',
  body2: 'p',
  caption: 'span',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'p',
};

const colorClass: Record<TypographyColor, string> = {
  error: 'text-error',
  info: 'text-info',
  inherit: '',
  primary: '',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
};

export const Typography: FC<TypographyProps> = ({
  children,
  className,
  color,
  component,
  variant = 'body1',
  ...props
}) => {
  const Component = component ?? defaultComponent[variant];

  return (
    <Component className={cn(variantClass[variant], color != null && colorClass[color], className)} {...props}>
      {children}
    </Component>
  );
};
