import { CircularProgress } from '@mui/material';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type { FC } from 'react';

import { FullScreenCenter } from './components/FullScreenCenter';
import { NotFoundPage } from './components/NotFoundPage';
import { routeTree } from './routeTree.gen';

export const basepath = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

export const absoluteBasepath = `${window.location.origin}${basepath}`.replace(/\/$/, '');

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
