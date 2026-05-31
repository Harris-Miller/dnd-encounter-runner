import { Container } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import type { FC } from 'react';

import { Header } from './Header';

export const AppLayout: FC = () => (
  <>
    <Header />
    <Container maxWidth="xl" sx={{ marginTop: 9 }}>
      <Outlet />
    </Container>
  </>
);
