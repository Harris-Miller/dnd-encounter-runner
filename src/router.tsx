import { createRouter, RouterProvider } from '@tanstack/react-router';
import type { FC } from 'react';

import { CircularProgress } from './components/compat/CircularProgress';
import { FullScreenCenter } from './components/FullScreenCenter';
import { NotFoundPage } from './components/NotFoundPage';
import { routeTree } from './routeTree.gen';

export const basepath = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createRouter({
  basepath,
  defaultNotFoundComponent: NotFoundPage,
  defaultPendingComponent: () => (
    <FullScreenCenter>
      <CircularProgress />
    </FullScreenCenter>
  ),
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const Router: FC = () => <RouterProvider router={router} />;
