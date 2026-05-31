import { createFileRoute } from '@tanstack/react-router';

import { AppLayout } from '../../components/AppLayout';
import { requireSession } from '../../utils/routeGuards';

export const Route = createFileRoute('/home')({
  beforeLoad: async () => {
    await requireSession();
  },
  component: AppLayout,
});
