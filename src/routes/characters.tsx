import { createFileRoute } from '@tanstack/react-router';

import { AppLayout } from '../routing/AppLayout';
import { requireSession } from '../routing/routeGuards';

export const Route = createFileRoute('/characters')({
  beforeLoad: async () => {
    await requireSession();
  },
  component: AppLayout,
});
