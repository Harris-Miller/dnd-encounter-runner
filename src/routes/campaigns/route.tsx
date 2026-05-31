import { createFileRoute } from '@tanstack/react-router';

import { AppLayout } from '../../components/AppLayout';
import { requireSession } from '../../utils/routeGuards';

export const Route = createFileRoute('/campaigns')({
  beforeLoad: async () => {
    await requireSession();
  },
  component: AppLayout,
});
