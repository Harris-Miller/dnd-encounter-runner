import type { FC, PropsWithChildren } from 'react';

export const FullScreenCenter: FC<PropsWithChildren> = ({ children }) => (
  <div className="full-screen-center">{children}</div>
);
