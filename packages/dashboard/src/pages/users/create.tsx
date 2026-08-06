import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, CircleDashed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateUserMutation } from '@/services/users.service';
import { useCreateRoleMutation } from '@/services/roles.service';
import { useGetPermissionsQuery } from '@/services/permissions.service';
import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  ForbiddenState,
  PageSpinner,
} from '@/components/ui';
import { usePermissions } from '@/hooks';
import { ROUTES } from '@/constants';
import type { ApiError } from '@/types';

// ---------------------------------------------------------------------------
// Permission presets — mirrors the built-in server roles
// ---------------------------------------------------------------------------

interface RolePreset {
  label: string;
  name: string;
  description: string;
  permissions: string[];
}

const ROLE_PRESETS: RolePreset[] = [
  {
    label: 'Viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned projects.',
    permissions: ['files.view', 'projects.view'],
  },
  {
    label: 'Developer',
    name: 'Developer',
    description: 'Can manage files and API keys within assigned projects.',
    permissions: [
      'files.view',
      'files.upload',
      'files.rename',
      'files.delete',
      'files.move',
      'folders.create',
      'folders.rename',
      'folders.delete',
      'apikeys.view',
      'apikeys.create',
      'apikeys.rotate',
      'apikeys.delete',
      'audit.view',
    ],
  },
  {
    label: 'Manager',
    name: 'Manager',
    description: 'Operational administrator — manages projects, files, API keys, and upload rules.',
    permissions: [
      'projects.view',
      'projects.create',
      'projects.update',
      'files.view',
      'files.upload',
      'files.rename',
      'files.delete',
      'files.move',
      'folders.create',
      'folders.rename',
      'folders.delete',
      'apikeys.view',
      'apikeys.create',
      'apikeys.rotate',
      'apikeys.delete',
      'uploadrules.view',
      'uploadrules.update',
    ],
  },
  {
    label: 'Administrator',
    name: 'Administrator',
    description: 'Full administrative access except Owner-only operations.',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.invite',
      'projects.view',
      'projects.create',
      'projects.update',
      'projects.delete',
      'files.view',
      'files.upload',
      'files.rename',
      'files.delete',
      'files.move',
      'folders.create',
      'folders.rename',
      'folders.delete',
      'apikeys.view',
      'apikeys.create',
      'apikeys.rotate',
      'apikeys.delete',
      'uploadrules.view',
      'uploadrules.update',
      'storage.view',
      'storage.update',
      'settings.view',
      'settings.update',
      'audit.view',
      'audit.export',
      'system.backup',
      'system.restore',
    ],
  },
  {
    label: 'Owner',
    name: 'Owner',
    description: 'Unrestricted access to all features and settings.',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.invite',
      'projects.view',
      'projects.create',
      'projects.update',
      'projects.delete',
      'files.view',
      'files.upload',
      'files.rename',
      'files.delete',
      'files.move',
      'folders.create',
      'folders.rename',
      'folders.delete',
      'apikeys.view',
      'apikeys.create',
      'apikeys.rotate',
      'apikeys.delete',
      'uploadrules.view',
      'uploadrules.update',
      'storage.view',
      'storage.update',
      'settings.view',
      'settings.update',
      'audit.view',
      'audit.export',
      'system.backup',
      'system.restore',
      'system.shutdown',
      'system.upgrade',
    ],
  },
];

const PRESET_OPTIONS = [
  { value: '', label: 'Custom' },
  ...ROLE_PRESETS.map((p) => ({ value: p.label, label: p.label })),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPermissionLabel(permission: string): string {
  return permission
    .split('.')
    .map((segment) => segment.replace(/[-_]/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' · ');
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleName: z
    .string()
    .min(1, 'Role name is required')
    .max(100, 'Role name must be 100 characters or less'),
  roleDescription: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const canCreate = hasPermission('users.create');

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
  const { data: permissionsData, isLoading: permissionsIsLoading } = useGetPermissionsQuery(
    undefined,
    { skip: !canCreate },
  );

  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const isSubmitting = isCreatingUser || isCreatingRole;

  if (permissionsLoading) return <PageSpinner />;
  if (!canCreate) return <ForbiddenState />;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      roleName: '',
      roleDescription: '',
    },
  });

  const permissionGroups = permissionsData?.data.groups ?? [];
  const selectedCount = useMemo(() => selectedPermissions.length, [selectedPermissions.length]);

  // Apply preset selections
  const handlePresetChange = useCallback(
    (presetLabel: string) => {
      setSelectedPreset(presetLabel);
      const preset = ROLE_PRESETS.find((p) => p.label === presetLabel);
      if (preset) {
        setValue('roleName', preset.name);
        setValue('roleDescription', preset.description);
        setSelectedPermissions([...preset.permissions]);
      } else {
        setValue('roleName', '');
        setValue('roleDescription', '');
        setSelectedPermissions([]);
      }
    },
    [setValue],
  );

  // Sync roleName/description when user edits them manually (clear preset association)
  const handleRoleNameChange = useCallback(() => {
    setSelectedPreset('');
  }, []);

  const togglePermission = useCallback((permission: string) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
    setSelectedPreset('');
  }, []);

  const toggleGroup = useCallback((permissions: string[]) => {
    setSelectedPermissions((current) => {
      const hasAll = permissions.every((p) => current.includes(p));
      if (hasAll) return current.filter((p) => !permissions.includes(p));
      return Array.from(new Set([...current, ...permissions]));
    });
    setSelectedPreset('');
  }, []);

  const clearPermissions = useCallback(() => {
    setSelectedPermissions([]);
    setSelectedPreset('');
  }, []);

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      // 1. Create the role
      const roleResult = await createRole({
        name: data.roleName,
        description: data.roleDescription,
        permissions: selectedPermissions,
      }).unwrap();

      // 2. Create the user with the new role ID
      await createUser({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: roleResult.data.id,
      }).unwrap();

      toast.success('User created successfully');
      navigate(ROUTES.USERS);
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiError };

      // Map server field-level errors to form fields
      const details = apiErr.data?.error.details;
      if (details && details.length > 0) {
        let matched = false;
        for (const { path, message } of details) {
          if (path in createUserSchema.shape) {
            setError(path as keyof CreateUserFormData, { message });
            matched = true;
          }
        }
        if (matched) return;
      }

      toast.error(apiErr.data?.error.message ?? 'Failed to create user');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => {
          navigate(ROUTES.USERS);
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
        <p className="text-muted-foreground">
          Add a new user and define their role with custom permissions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ── User Details ─────────────────────────────── */}

        <div className="rounded-lg border p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold">User Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="firstName"
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              id="lastName"
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            id="username"
            label="Username"
            placeholder="johndoe"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="john@mediavault.local"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        {/* ── Role & Permissions ────────────────────────── */}

        <div className="rounded-lg border p-4 sm:p-6 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Role & Permissions</h2>
              <p className="text-sm text-muted-foreground">
                Define the role and select which permissions it grants.
              </p>
            </div>
            <Badge variant="secondary">
              {selectedCount} permission{selectedCount !== 1 ? 's' : ''} selected
            </Badge>
          </div>

          <Select
            id="preset"
            label="Permission Preset"
            value={selectedPreset}
            onChange={(e) => {
              handlePresetChange(e.target.value);
            }}
            options={PRESET_OPTIONS}
          />

          <Input
            id="roleName"
            label="Role Name"
            placeholder="e.g. media-manager"
            error={errors.roleName?.message}
            {...register('roleName', { onChange: handleRoleNameChange })}
          />

          <Textarea
            id="roleDescription"
            label="Role Description"
            placeholder="Who should use this role and what can they do?"
            error={errors.roleDescription?.message}
            rows={3}
            {...register('roleDescription')}
          />

          {/* Permissions grid */}
          {permissionsIsLoading ? (
            <PageSpinner />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Permissions</h3>
                <Button type="button" variant="outline" size="sm" onClick={clearPermissions}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-4">
                {permissionGroups.map((group) => {
                  const allSelected = group.permissions.every((p) =>
                    selectedPermissions.includes(p),
                  );
                  return (
                    <div key={group.label} className="rounded-lg border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-medium">{group.label}</h4>
                          <p className="text-xs text-muted-foreground">
                            {group.permissions.length} permission
                            {group.permissions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={allSelected ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => {
                            toggleGroup(group.permissions);
                          }}
                        >
                          {allSelected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <CircleDashed className="h-4 w-4" />
                          )}
                          {allSelected ? 'All Selected' : 'Select Group'}
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.permissions.map((permission) => {
                          const selected = selectedPermissions.includes(permission);
                          return (
                            <button
                              key={permission}
                              type="button"
                              onClick={() => {
                                togglePermission(permission);
                              }}
                              className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                selected
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border bg-background hover:bg-muted/40'
                              }`}
                            >
                              <span>{formatPermissionLabel(permission)}</span>
                              <span className="text-xs text-muted-foreground">{permission}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ───────────────────────────────────── */}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={isSubmitting}>
            Create User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigate(ROUTES.USERS);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
