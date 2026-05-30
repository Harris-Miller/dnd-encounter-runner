import { Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { queryClient } from '../queryClient';

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ bottom: 0, display: 'flex', left: 0, position: 'absolute', right: 0, top: 0 }}>
        <Outlet />
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </Box>
    </QueryClientProvider>
  ),
  staleTime: Infinity,
});
