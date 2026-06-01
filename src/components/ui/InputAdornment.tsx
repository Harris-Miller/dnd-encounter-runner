import type { FC, PropsWithChildren } from 'react';

export type InputAdornmentProps = PropsWithChildren<{
  position?: 'end' | 'start';
}>;

export const InputAdornment: FC<InputAdornmentProps> = ({ children }) => children;
