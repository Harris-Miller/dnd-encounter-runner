import { createFileRoute } from '@tanstack/react-router';

import { AppLayout } from '../routing/AppLayout';
import { requireProfileName } from '../routing/routeGuards';

export const Route = createFileRoute('/encounter')({
  beforeLoad: async () => {
    await requireProfileName();
  },
  component: AppLayout,
});
