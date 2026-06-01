import * as Label from '@radix-ui/react-label';
import type { FC, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '../../styles/cn';

export type TextFieldProps = (
  | ({ multiline: true; select?: false } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({ multiline?: false; select?: false } & InputHTMLAttributes<HTMLInputElement>)
  | ({ select: true } & SelectHTMLAttributes<HTMLSelectElement>)
) & {
  children?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  InputProps?: { endAdornment?: ReactNode };
  label?: string;
  minRows?: number;
  multiline?: boolean;
  select?: boolean;
};

export const TextField: FC<TextFieldProps> = ({
  children,
  className,
  error = false,
  fullWidth = false,
  helperText,
  id,
  InputProps,
  label,
  minRows,
  multiline = false,
  select = false,
  ...inputProps
}) => {
  const fieldId = id ?? (label != null ? label.replaceAll(/\s+/g, '-').toLowerCase() : undefined);

  if (select) {
    const selectProps = inputProps as SelectHTMLAttributes<HTMLSelectElement>;
    return (
      <div className={cn('field', fullWidth && 'field-full-width', className)}>
        {label != null ? (
          <Label.Root className="field-label" htmlFor={fieldId}>
            {label}
          </Label.Root>
        ) : null}
        <select
          aria-invalid={error || undefined}
          className={cn('field-input', error && 'field-input-error')}
          id={fieldId}
          {...selectProps}
        >
          {children}
        </select>
        {helperText != null ? <span className={cn('field-helper', error && 'text-error')}>{helperText}</span> : null}
      </div>
    );
  }

  const inputClassName = cn('field-input', error && 'field-input-error');

  return (
    <div className={cn('field', fullWidth && 'field-full-width', className)}>
      {label != null ? (
        <Label.Root className="field-label" htmlFor={fieldId}>
          {label}
        </Label.Root>
      ) : null}
      <div className="field-input-wrap">
        {multiline ? (
          <textarea
            aria-invalid={error || undefined}
            className={inputClassName}
            id={fieldId}
            rows={minRows ?? 3}
            {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            aria-invalid={error || undefined}
            className={inputClassName}
            id={fieldId}
            {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {InputProps?.endAdornment != null ? <span className="field-adornment">{InputProps.endAdornment}</span> : null}
      </div>
      {helperText != null ? <span className={cn('field-helper', error && 'text-error')}>{helperText}</span> : null}
    </div>
  );
};

export const MenuItem: FC<{ children: ReactNode; disabled?: boolean; value: string }> = ({
  children,
  disabled,
  value,
}) => (
  <option disabled={disabled} value={value}>
    {children}
  </option>
);
