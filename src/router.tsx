import { CircularProgress } from '@mui/material';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type { FC } from 'react';

import { FullScreenCenter } from './components/FullScreenCenter';
import { routeTree } from './routeTree.gen';

const router = createRouter({
  defaultPendingComponent: () => (
    <FullScreenCenter>
      <CircularProgress />
    </FullScreenCenter>
  ),
  defaultPendingMinMs: 500,
  defaultPendingMs: 10,
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const Router: FC = () => <RouterProvider router={router} />;
