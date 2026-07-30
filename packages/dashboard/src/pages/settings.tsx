import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useChangePasswordMutation } from '@/services/auth.service';
import { useGetSettingsQuery } from '@/services/settings.service';
import {
  useGetUploadRulesQuery,
  useUpdateCategoryMutation,
  useUpdateExtensionMutation,
} from '@/services/upload-rules.service';
import type { CategoryWithExtensions, ExtensionRule } from '@/services/upload-rules.service';
import { PageHeader } from '@/components/shared';
import { Button, Input, PageSkeleton, ErrorState, Badge } from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setTheme } from '@/redux/slices/ui.slice';
import { Select } from '@/components/ui';
import toast from 'react-hot-toast';
import {
  Settings,
  Lock,
  Palette,
  Shield,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
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

const SIZE_UNITS = ['KB', 'MB', 'GB'] as const;

function bytesToUnit(bytes: number): { value: number; unit: (typeof SIZE_UNITS)[number] } {
  if (bytes >= 1024 * 1024 * 1024)
    return { value: +(bytes / (1024 * 1024 * 1024)).toFixed(1), unit: 'GB' };
  if (bytes >= 1024 * 1024) return { value: +(bytes / (1024 * 1024)).toFixed(1), unit: 'MB' };
  return { value: +(bytes / 1024).toFixed(1), unit: 'KB' };
}

function unitToBytes(value: number, unit: (typeof SIZE_UNITS)[number]): number {
  if (unit === 'GB') return value * 1024 * 1024 * 1024;
  if (unit === 'MB') return value * 1024 * 1024;
  return value * 1024;
}

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
      toast.error(apiErr.data?.message ?? 'Failed to change password');
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
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
          <p className="mb-4 text-sm text-muted-foreground">
            Initial credentials come from{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>. Changes made here
            persist in the database and survive restarts.
          </p>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
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

      {/* Upload Rules */}
      <UploadRulesSection />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload Rules (inline section)
// ---------------------------------------------------------------------------

function UploadRulesSection() {
  const { data, isLoading, isError, refetch } = useGetUploadRulesQuery();
  const [updateCategory] = useUpdateCategoryMutation();
  const [updateExtension] = useUpdateExtensionMutation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Upload Rules</h3>
          </div>
        </div>
        <div className="p-6 text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Upload Rules</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Failed to load upload rules.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const categories = data?.categories ?? [];

  const toggleExpand = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleCategoryToggle = async (cat: CategoryWithExtensions) => {
    try {
      await updateCategory({ category: cat.category, enabled: !cat.enabled }).unwrap();
      toast.success(`${cat.label} ${cat.enabled ? 'disabled' : 'enabled'}`);
    } catch {
      toast.error('Failed to update category');
    }
  };

  const handleCategorySize = async (
    cat: CategoryWithExtensions,
    valueStr: string,
    unit: (typeof SIZE_UNITS)[number],
  ) => {
    const value = Number(valueStr);
    if (Number.isNaN(value) || value <= 0) return;
    try {
      await updateCategory({ category: cat.category, maxSize: unitToBytes(value, unit) }).unwrap();
      toast.success(`${cat.label} limit updated`);
    } catch {
      toast.error('Failed to update size limit');
    }
  };

  const handleExtensionToggle = async (cat: CategoryWithExtensions, ext: ExtensionRule) => {
    try {
      await updateExtension({
        category: cat.category,
        extension: ext.extension,
        enabled: !ext.enabled,
      }).unwrap();
      toast.success(`.${ext.extension} ${ext.enabled ? 'disabled' : 'enabled'}`);
    } catch {
      toast.error('Failed to update extension');
    }
  };

  const handleExtensionSize = async (
    cat: CategoryWithExtensions,
    ext: ExtensionRule,
    valueStr: string,
    unit: (typeof SIZE_UNITS)[number],
  ) => {
    const value = Number(valueStr);
    if (Number.isNaN(value) || value <= 0) return;
    try {
      await updateExtension({
        category: cat.category,
        extension: ext.extension,
        maxSize: unitToBytes(value, unit),
      }).unwrap();
      toast.success(`.${ext.extension} override updated`);
    } catch {
      toast.error('Failed to update override');
    }
  };

  const handleExtensionReset = async (cat: CategoryWithExtensions, ext: ExtensionRule) => {
    try {
      await updateExtension({
        category: cat.category,
        extension: ext.extension,
        maxSize: null,
      }).unwrap();
      toast.success(`.${ext.extension} reset to default`);
    } catch {
      toast.error('Failed to reset');
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Upload Rules</h3>
        </div>
      </div>
      <div className="divide-y">
        {categories.map((cat) => {
          const isOpen = expanded[cat.category] ?? false;
          const catSize = bytesToUnit(cat.maxSize);

          return (
            <div key={cat.category}>
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:flex-nowrap">
                <button
                  onClick={() => {
                    toggleExpand(cat.category);
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>

                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                  <input
                    type="number"
                    className="h-7 w-14 rounded border px-1.5 text-xs"
                    defaultValue={String(catSize.value)}
                    min={0}
                    onBlur={(e) => {
                      const unit = (e.target.nextSibling as HTMLSelectElement)
                        .value as (typeof SIZE_UNITS)[number];
                      handleCategorySize(cat, e.target.value, unit || 'MB');
                    }}
                    aria-label={`${cat.label} max size`}
                  />
                  <select
                    className="h-7 rounded border px-1 text-xs"
                    defaultValue={catSize.unit}
                    onChange={(e) => {
                      const input = e.target.previousSibling as HTMLInputElement;
                      handleCategorySize(
                        cat,
                        input.value,
                        e.target.value as (typeof SIZE_UNITS)[number],
                      );
                    }}
                    aria-label="Size unit"
                  >
                    {SIZE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      handleCategoryToggle(cat);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={cat.enabled ? 'Disable' : 'Enable'}
                  >
                    {cat.enabled ? (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t bg-muted/30 divide-y">
                  {cat.extensions.map((ext) => {
                    const effectiveSize = ext.maxSize ?? cat.maxSize;
                    const extSize = bytesToUnit(effectiveSize);

                    return (
                      <div
                        key={ext.extension}
                        className="flex flex-wrap items-center gap-2 px-6 py-1.5 text-sm sm:flex-nowrap"
                      >
                        <Badge
                          variant={ext.maxSize !== null ? 'default' : 'secondary'}
                          className="text-xs shrink-0"
                        >
                          .{ext.extension}
                        </Badge>
                        <div className="flex items-center gap-1 ml-auto shrink-0">
                          {ext.maxSize !== null && (
                            <button
                              onClick={() => {
                                handleExtensionReset(cat, ext);
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground mr-1"
                              title="Reset to category default"
                            >
                              reset
                            </button>
                          )}
                          <input
                            type="number"
                            className="h-6 w-12 rounded border px-1 text-xs"
                            defaultValue={String(extSize.value)}
                            min={0}
                            onBlur={(e) => {
                              const unit = (e.target.nextSibling as HTMLSelectElement)
                                .value as (typeof SIZE_UNITS)[number];
                              handleExtensionSize(cat, ext, e.target.value, unit || 'MB');
                            }}
                            aria-label={`${ext.extension} max size`}
                          />
                          <select
                            className="h-6 rounded border px-1 text-xs"
                            defaultValue={extSize.unit}
                            onChange={(e) => {
                              const input = e.target.previousSibling as HTMLInputElement;
                              handleExtensionSize(
                                cat,
                                ext,
                                input.value,
                                e.target.value as (typeof SIZE_UNITS)[number],
                              );
                            }}
                            aria-label="Size unit"
                          >
                            {SIZE_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              handleExtensionToggle(cat, ext);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={ext.enabled ? 'Disable' : 'Enable'}
                          >
                            {ext.enabled ? (
                              <ToggleRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
