import * as Label from '@radix-ui/react-label';
import type { FC, SelectHTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type SelectProps = {
  fullWidth?: boolean;
  label?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const Select: FC<SelectProps> = ({ children, className, fullWidth = false, id, label, ...props }) => {
  const fieldId = id ?? (label != null ? label.replaceAll(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className={cn('field', fullWidth && 'field-full-width', className)}>
      {label != null ? (
        <Label.Root className="field-label" htmlFor={fieldId}>
          {label}
        </Label.Root>
      ) : null}
      <select className="field-input" id={fieldId} {...props}>
        {children}
      </select>
    </div>
  );
};
