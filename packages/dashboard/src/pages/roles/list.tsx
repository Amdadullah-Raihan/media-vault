import { Link } from 'react-router-dom';
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
  useDuplicateRoleMutation,
} from '@/services/roles.service';
import { Button, Badge, EmptyState, PageSpinner } from '@/components/ui';
import { type Role } from '@/types';
import { ROUTES } from '@/constants';
import { Shield, Plus, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RolesListPage() {
  const { data, isLoading, isError } = useGetRolesQuery();
  const [deleteRole] = useDeleteRoleMutation();
  const [duplicateRole] = useDuplicateRoleMutation();

  if (isLoading) return <PageSpinner />;

  const roles = data?.data ?? [];

  const handleDelete = async (role: Role) => {
    try {
      await deleteRole(role.id).unwrap();
      toast.success(`Role "${role.name}" deleted`);
    } catch {
      toast.error('Failed to delete role');
    }
  };

  const handleDuplicate = async (role: Role) => {
    try {
      await duplicateRole(role.id).unwrap();
      toast.success(`Role "${role.name}" duplicated`);
    } catch {
      toast.error('Failed to duplicate role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage roles and their permissions.</p>
        </div>
        <Link to={ROUTES.ROLE_CREATE}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </div>

      {isError && (
        <EmptyState icon={<Shield className="h-12 w-12" />} title="Failed to load roles" />
      )}

      {!isError && roles.length === 0 && (
        <EmptyState icon={<Shield className="h-12 w-12" />} title="No roles yet" />
      )}

      {roles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link to={`/roles/${role.id}`} className="font-medium hover:underline">
                      {role.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {role.isBuiltIn && <Badge variant="secondary">Built-in</Badge>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{role.description}</p>
              <div className="mt-3 flex gap-1">
                {!role.isBuiltIn && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleDuplicate(role);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleDelete(role);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
