import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, CircleDashed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateRoleMutation } from '@/services/roles.service';
import { useGetPermissionsQuery } from '@/services/permissions.service';
import { PageHeader } from '@/components/shared';
import { Badge, Button, Input, PageSpinner, Textarea } from '@/components/ui';
import { ROUTES } from '@/constants';
import type { ApiError } from '@/types';

const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(100, 'Role name must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

function formatPermissionLabel(permission: string): string {
  return permission
    .split('.')
    .map((segment) => segment.replace(/[-_]/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' · ');
}

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const { data, isLoading, isError } = useGetPermissionsQuery();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
  });

  const permissionGroups = data?.data.groups ?? [];
  const selectedCount = useMemo(() => selectedPermissions.length, [selectedPermissions.length]);

  const togglePermission = (permission: string) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  const toggleGroup = (permissions: string[]) => {
    setSelectedPermissions((current) => {
      const hasAll = permissions.every((permission) => current.includes(permission));
      if (hasAll) {
        return current.filter((permission) => !permissions.includes(permission));
      }

      return Array.from(new Set([...current, ...permissions]));
    });
  };

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      const result = await createRole({
        name: data.name,
        description: data.description,
        permissions: selectedPermissions,
      }).unwrap();

      toast.success('Role created successfully');
      navigate(`/roles/${result.data.id}`);
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiError };
      toast.error(apiErr.data?.error?.message ?? 'Failed to create role');
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => {
          navigate(ROUTES.ROLES);
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Roles
      </button>

      <PageHeader
        title="Create Role"
        description="Define a custom role and choose the permissions it should grant."
      />

      {isError ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Unable to load the permissions catalog. Try again later.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="name"
              label="Role Name"
              placeholder="media-manager"
              error={errors.name?.message}
              {...register('name')}
            />
            <div className="flex items-end">
              <Badge variant="secondary">{selectedCount} selected</Badge>
            </div>
          </div>

          <Textarea
            id="description"
            label="Description"
            placeholder="Who should use this role and what can they do?"
            error={errors.description?.message}
            rows={3}
            {...register('description')}
          />

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Permissions</h2>
                <p className="text-sm text-muted-foreground">
                  Select one or more capabilities for this role.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions([])}
              >
                Clear
              </Button>
            </div>

            <div className="space-y-4">
              {permissionGroups.map((group) => {
                const allSelected = group.permissions.every((permission) =>
                  selectedPermissions.includes(permission),
                );

                return (
                  <div key={group.label} className="rounded-lg border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{group.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {group.permissions.length} permission
                          {group.permissions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={allSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => toggleGroup(group.permissions)}
                      >
                        {allSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <CircleDashed className="h-4 w-4" />
                        )}
                        {allSelected ? 'Selected' : 'Select group'}
                      </Button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.permissions.map((permission) => {
                        const selected = selectedPermissions.includes(permission);

                        return (
                          <button
                            key={permission}
                            type="button"
                            onClick={() => togglePermission(permission)}
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

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ROLES)}>
              Cancel
            </Button>
            <Button type="submit" loading={isCreating}>
              Create Role
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
