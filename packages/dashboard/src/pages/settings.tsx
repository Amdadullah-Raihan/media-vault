import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePasswordMutation } from '@/services/auth.service';
import { useGetSettingsQuery } from '@/services/settings.service';
import { PageHeader } from '@/components/shared';
import { Button, Input, PageSkeleton, ErrorState } from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setTheme } from '@/redux/slices/ui.slice';
import { Select } from '@/components/ui';
import toast from 'react-hot-toast';
import { Settings, Lock, Palette, HardDrive } from 'lucide-react';
import type { ApiError } from '@/types';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  const { data: settingsData, isLoading, isError, refetch } = useGetSettingsQuery();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success('Password changed successfully');
      reset();
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiError };
      toast.error(apiErr?.data?.message ?? 'Failed to change password');
    }
  };

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
            <h3 className="font-semibold">Change Password</h3>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" loading={changing}>
              Update Password
            </Button>
          </form>
        </div>
      </div>

      {/* Storage */}
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Storage Limits</h3>
          </div>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max File Size</span>
            <span className="font-medium">
              {settingsData?.data.storage.maxFileSizeBytes
                ? `${(settingsData.data.storage.maxFileSizeBytes / 1024 / 1024).toFixed(0)} MB`
                : '100 MB'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Allowed MIME Types</span>
            <span className="font-medium">
              {settingsData?.data.storage.allowedMimeTypes?.join(', ') ?? 'All'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
