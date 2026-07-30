import { useGetSettingsQuery } from '@/services/settings.service';
import { PageHeader } from '@/components/shared';
import { PageSkeleton, ErrorState } from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setTheme } from '@/redux/slices/ui.slice';
import { Select } from '@/components/ui';
import { Settings, Lock, Palette } from 'lucide-react';

export default function SettingsPage() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  const { data: settingsData, isLoading, isError, refetch } = useGetSettingsQuery();

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Settings" description="Manage your MediaVault configuration." />

      {/* General */}
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">General</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Admin Username</label>
            <p className="mt-1 text-sm text-muted-foreground">
              {settingsData?.data.adminUsername ?? 'admin'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Storage Driver</label>
            <p className="mt-1 text-sm text-muted-foreground">Local File System</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
        </div>
        <div className="p-6">
          <Select
            id="theme"
            label="Theme"
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            value={theme}
            onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark' | 'system'))}
          />
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Admin Credentials</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Admin credentials are managed via the{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">ADMIN_USERNAME</code> and{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">ADMIN_PASSWORD</code> environment
            variables in your <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>{' '}
            file. Change them there and restart the server.
          </p>
        </div>
      </div>
    </div>
  );
}
