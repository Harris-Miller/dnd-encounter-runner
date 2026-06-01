import type { AnchorHTMLAttributes, ButtonHTMLAttributes, FC, HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../styles/cn';

export type CardProps = {
  variant?: 'elevation' | 'outlined';
} & HTMLAttributes<HTMLDivElement>;

export const Card: FC<CardProps> = ({ className, variant = 'elevation', ...props }) => (
  <div className={cn('card', variant === 'outlined' && 'card-outlined', className)} {...props} />
);

export const CardContent: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('card-content', className)} {...props}>
    {children}
  </div>
);

type CardActionAreaProps = {
  component?: 'a' | 'button' | 'div';
} & (
  | AnchorHTMLAttributes<HTMLAnchorElement>
  | ButtonHTMLAttributes<HTMLButtonElement>
  | HTMLAttributes<HTMLDivElement>
);

export const CardActionArea: FC<CardActionAreaProps> = ({ children, className, component = 'button', ...props }) => {
  if (component === 'a') {
    return (
      <a className={cn('card-action-area', className)} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  if (component === 'div') {
    return (
      <div
        className={cn('card-action-area', className)}
        role="button"
        tabIndex={0}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      className={cn('card-action-area', className)}
      type="button"
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};
