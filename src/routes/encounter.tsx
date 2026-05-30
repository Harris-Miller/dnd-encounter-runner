import { Container } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Header } from '../components/Header';
import { requireProfileName } from '../routing/routeGuards';

export const Route = createFileRoute('/encounter')({
  beforeLoad: async () => {
    await requireProfileName();
  },
  component: () => (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ marginTop: 9 }}>
        <Outlet />
      </Container>
    </>
  ),
});
