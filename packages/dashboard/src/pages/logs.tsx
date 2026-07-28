import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';
import { Activity } from 'lucide-react';

export default function LogsPage() {
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
