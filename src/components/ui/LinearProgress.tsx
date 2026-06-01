import type { FC, HTMLAttributes } from 'react';

export type LinearProgressProps = {
  value?: number;
  variant?: 'determinate' | 'indeterminate';
} & HTMLAttributes<HTMLDivElement>;

export const LinearProgress: FC<LinearProgressProps> = ({ value = 0, variant = 'indeterminate' }) => (
  <div
    aria-valuemax={100}
    aria-valuemin={0}
    aria-valuenow={variant === 'determinate' ? value : undefined}
    className="linear-progress"
    role="progressbar"
  >
    {variant === 'determinate' ? (
      <div className="linear-progress-bar" style={{ width: `${String(Math.min(100, Math.max(0, value)))}%` }} />
    ) : (
      <div className="linear-progress-bar" style={{ width: '40%' }} />
    )}
  </div>
);
