import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useGetRoleQuery } from '@/services/roles.service';
import { useGetPermissionsQuery } from '@/services/permissions.service';
import { PageHeader } from '@/components/shared';
import { Badge, Button, PageSkeleton, ErrorState, EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants';
import { formatDate } from '@/utils';

function formatPermissionLabel(permission: string): string {
  return permission
    .split('.')
    .map((segment) => segment.replace(/[-_]/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' · ');
}

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: roleData, isLoading, isError, refetch } = useGetRoleQuery(id ?? '');
  const { data: permissionsData } = useGetPermissionsQuery();

  if (isLoading) return <PageSkeleton />;
  if (isError || !roleData?.data) return <ErrorState onRetry={refetch} />;

  const role = roleData.data;
  const permissionGroups = permissionsData?.data.groups ?? [];

  return (
    <div className="space-y-6">
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
        title={role.name}
        description={role.description}
        actions={
          <Badge variant={role.isBuiltIn ? 'secondary' : 'outline'}>
            {role.isBuiltIn ? 'Built-in' : 'Custom'}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Permissions</h2>
          {role.permissions.length === 0 ? (
            <EmptyState icon={<Shield className="h-12 w-12" />} title="No permissions assigned" />
          ) : (
            <div className="space-y-4">
              {permissionGroups.map((group) => {
                const activePermissions = group.permissions.filter((permission) =>
                  role.permissions.includes(permission),
                );

                if (activePermissions.length === 0) {
                  return null;
                }

                return (
                  <div key={group.label} className="rounded-lg border bg-muted/20 p-4">
                    <h3 className="mb-3 font-medium">{group.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {activePermissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {formatPermissionLabel(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Details</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-right">{role.id}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="text-right">{formatDate(role.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="text-right">{formatDate(role.updatedAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Permissions</dt>
              <dd className="text-right">{role.permissions.length}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate(ROUTES.ROLES)}
            >
              Back to Roles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
