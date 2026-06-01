import type { FC, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {label != null ? <Label htmlFor={fieldId}>{label}</Label> : null}
        <select
          aria-invalid={error || undefined}
          className={cn(
            'flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            error && 'border-destructive ring-destructive/20',
          )}
          id={fieldId}
          {...selectProps}
        >
          {children}
        </select>
        {helperText != null ? (
          <span className={cn('text-xs text-muted-foreground', error && 'text-destructive')}>{helperText}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
      {label != null ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className="relative flex items-center">
        {multiline ? (
          <Textarea
            aria-invalid={error || undefined}
            id={fieldId}
            rows={minRows ?? 3}
            {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            aria-invalid={error || undefined}
            id={fieldId}
            {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {InputProps?.endAdornment != null ? (
          <span className="absolute right-2 flex items-center">{InputProps.endAdornment}</span>
        ) : null}
      </div>
      {helperText != null ? (
        <span className={cn('text-xs text-muted-foreground', error && 'text-destructive')}>{helperText}</span>
      ) : null}
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
