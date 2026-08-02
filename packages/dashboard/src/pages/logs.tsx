import { PageHeader } from '@/components/shared';
import { EmptyState, ForbiddenState, PageSpinner } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { Activity } from 'lucide-react';

export default function LogsPage() {
  const { hasPermission, isLoading } = usePermissions();
  const canView = hasPermission('audit.view');

  if (isLoading) return <PageSpinner />;
  if (!canView) return <ForbiddenState />;
  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="View recent activity and server logs." />

      <EmptyState
        icon={<Activity className="h-6 w-6" />}
        title="Coming soon"
        description="Activity logs will be available in a future update."
      />
    </div>
  );
}
