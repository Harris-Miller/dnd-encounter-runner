import { createRoute, createRouter } from '@tanstack/react-router';

import { encounterRoute } from './components/EncounterPage';
import { LandingPage } from './components/LandingPage';
import { SingleEncounterLandingPage } from './components/old/SingleEncounterLandingPage';
import { rootRoute } from './routes/rootRoute';

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

const routeTree = rootRoute.addChildren([indexRoute, oldLandingPageRoute, encounterRoute]);

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
