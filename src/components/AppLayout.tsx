import { Outlet } from '@tanstack/react-router';
import type { FC } from 'react';

import { Header } from './Header';

export const AppLayout: FC = () => (
  <>
    <Header />
    <main className="app-main" style={{ marginInline: 'auto', maxWidth: 1536, padding: '0 1rem', width: '100%' }}>
      <Outlet />
    </main>
  </>
);
