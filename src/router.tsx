import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

import { FullScreenCenter } from './components/FullScreenCenter';
import { NotFoundPage } from './components/NotFoundPage';
import { routeTree } from './routeTree.gen';

export const basepath = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createRouter({
  basepath,
  defaultNotFoundComponent: NotFoundPage,
  defaultPendingComponent: () => (
    <FullScreenCenter>
      <Loader2 aria-hidden className="spin" size={40} />
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
