import { createFileRoute } from '@tanstack/react-router';

import { AppLayout } from '../../routing/AppLayout';
import { requireSession } from '../../routing/routeGuards';

export const Route = createFileRoute('/invite')({
  beforeLoad: async () => {
    await requireSession();
  },
  component: AppLayout,
});
