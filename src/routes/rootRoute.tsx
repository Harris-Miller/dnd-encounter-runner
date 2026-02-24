import { Container } from '@mui/material';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Header } from '../components/Header';

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Header />
      <Container maxWidth="lg">
        <Outlet />
      </Container>
      <TanStackRouterDevtools />
    </>
  ),
});
