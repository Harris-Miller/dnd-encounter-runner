import { Box } from '@mui/material';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <Box sx={{ bottom: 0, display: 'flex', left: 0, position: 'absolute', right: 0, top: 0 }}>
      <Outlet />
      <TanStackRouterDevtools />
    </Box>
  ),
  staleTime: Infinity,
});
