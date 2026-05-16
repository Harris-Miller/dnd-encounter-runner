import { Container } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Header } from '../components/Header';
import { requireProfileName } from '../routing/routeGuards';

export const Route = createFileRoute('/home')({
  beforeLoad: async () => {
    await requireProfileName();
  },
  component: () => (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ marginTop: 8 }}>
        <Outlet />
      </Container>
    </>
  ),
});
