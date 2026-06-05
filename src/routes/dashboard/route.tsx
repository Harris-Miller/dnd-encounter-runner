import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { AppLayout } from '../../components/AppLayout';
import { PrivateHeader } from '../../components/PrivateHeader';
import { requireSession } from '../../utils/routeGuards';

const DashboardLayout: FC = () => <AppLayout header={<PrivateHeader />} />;

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    await requireSession();
  },
  component: DashboardLayout,
});
