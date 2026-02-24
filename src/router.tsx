import { Container } from '@mui/material';
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { SingleEncounterLandingPage } from './components/old/SingleEncounterLandingPage';

const rootRoute = createRootRoute({
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

const indexRoute = createRoute({
  component: LandingPage,
  getParentRoute: () => rootRoute,
  path: '/',
});

const oldLandingPageRoute = createRoute({
  component: SingleEncounterLandingPage,
  getParentRoute: () => rootRoute,
  path: '/old',
});

const routeTree = rootRoute.addChildren([indexRoute, oldLandingPageRoute]);

export const router = createRouter({
  defaultPreload: 'intent',
  routeTree,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
