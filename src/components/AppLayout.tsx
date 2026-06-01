import { Outlet } from '@tanstack/react-router';
import type { FC } from 'react';

import { Container } from './compat/Container';
import { Header } from './Header';

export const AppLayout: FC = () => (
  <>
    <Header />
    <Container className="app-main" maxWidth="xl">
      <Outlet />
    </Container>
  </>
);
