import { Outlet } from '@tanstack/react-router';
import type { FC } from 'react';

import { Header } from './Header';
import { Container } from './ui/Container';

export const AppLayout: FC = () => (
  <>
    <Header />
    <Container className="app-main" maxWidth="xl">
      <Outlet />
    </Container>
  </>
);
