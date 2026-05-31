import { CircularProgress } from '@mui/material';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type { FC } from 'react';

import { FullScreenCenter } from './components/FullScreenCenter';
import { routeTree } from './routeTree.gen';

const basepath = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createRouter({
  basepath,
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
