import { Box, Container } from '@radix-ui/themes';
import { Outlet } from '@tanstack/react-router';
import type { FC } from 'react';

import { Header } from './Header';

export const AppLayout: FC = () => (
  <>
    <Header />
    <Box asChild className="app-main">
      <main>
        <Container size="4">
          <Outlet />
        </Container>
      </main>
    </Box>
  </>
);
