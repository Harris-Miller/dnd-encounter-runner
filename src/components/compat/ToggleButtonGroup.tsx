import * as ToggleGroup from '@radix-ui/react-toggle-group';
import type { FC, MouseEvent, PropsWithChildren } from 'react';

export type ToggleButtonGroupProps = PropsWithChildren<{
  /** @deprecated Radix single-select is always exclusive; kept for MUI API compatibility */
  exclusive?: boolean;
  onChange?: (event: MouseEvent<HTMLElement>, value: null | string) => void;
  value: string;
}>;

export const ToggleButtonGroup: FC<ToggleButtonGroupProps> = ({ children, onChange, value }) => (
  <ToggleGroup.Root
    className="toggle-group"
    onValueChange={nextValue => {
      onChange?.({} as MouseEvent<HTMLElement>, nextValue === '' ? null : nextValue);
    }}
    type="single"
    value={value}
  >
    {children}
  </ToggleGroup.Root>
);

export type ToggleButtonProps = PropsWithChildren<{
  disabled?: boolean;
  value: string;
}>;

export const ToggleButton: FC<ToggleButtonProps> = ({ children, disabled, value }) => (
  <ToggleGroup.Item className="toggle-btn" disabled={disabled} value={value}>
    {children}
  </ToggleGroup.Item>
);
