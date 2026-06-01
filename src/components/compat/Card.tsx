import type { AnchorHTMLAttributes, ButtonHTMLAttributes, FC, HTMLAttributes, PropsWithChildren } from 'react';

import { Card as ShadcnCard, CardContent as ShadcnCardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type CardProps = {
  variant?: 'elevation' | 'outlined';
} & HTMLAttributes<HTMLDivElement>;

export const Card: FC<CardProps> = ({ className, variant = 'elevation', ...props }) => (
  <ShadcnCard
    className={cn(
      variant === 'outlined' && 'border-2 border-border shadow-none',
      variant === 'elevation' && 'shadow-md',
      className,
    )}
    {...props}
  />
);

export const CardContent: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <ShadcnCardContent className={className} {...props}>
    {children}
  </ShadcnCardContent>
);

type CardActionAreaProps = {
  component?: 'a' | 'button' | 'div';
} & (
  | AnchorHTMLAttributes<HTMLAnchorElement>
  | ButtonHTMLAttributes<HTMLButtonElement>
  | HTMLAttributes<HTMLDivElement>
);

export const CardActionArea: FC<CardActionAreaProps> = ({ children, className, component = 'button', ...props }) => {
  const actionClassName = cn(
    'flex w-full cursor-pointer rounded-xl text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className,
  );

  if (component === 'a') {
    return (
      <a className={actionClassName} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  if (component === 'div') {
    return (
      <div className={actionClassName} role="button" tabIndex={0} {...(props as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <button className={actionClassName} type="button" {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};
