import { Link } from 'react-router-dom';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useSuspendUserMutation,
  useRestoreUserMutation,
  useUnlockUserMutation,
} from '@/services/users.service';
import { Button, Badge, EmptyState, PageSpinner } from '@/components/ui';
import { UserStatus, type UserProfile } from '@/types';
import { ROUTES } from '@/constants';
import { Users, Plus, Shield, Ban, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGES: Record<
  UserStatus,
  { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }
> = {
  [UserStatus.Active]: { variant: 'default', label: 'Active' },
  [UserStatus.Pending]: { variant: 'secondary', label: 'Pending' },
  [UserStatus.Locked]: { variant: 'destructive', label: 'Locked' },
  [UserStatus.Suspended]: { variant: 'destructive', label: 'Suspended' },
  [UserStatus.Disabled]: { variant: 'secondary', label: 'Disabled' },
  [UserStatus.Archived]: { variant: 'outline', label: 'Archived' },
  [UserStatus.Deleted]: { variant: 'outline', label: 'Deleted' },
};

export default function UsersListPage() {
  const { data, isLoading, isError } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [unlockUser] = useUnlockUserMutation();

  if (isLoading) return <PageSpinner />;

  const users = data?.data ?? [];

  const handleDelete = async (user: UserProfile) => {
    try {
      await deleteUser(user.id).unwrap();
      toast.success(`User "${user.displayName}" deleted`);
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleSuspend = async (user: UserProfile) => {
    try {
      await suspendUser(user.id).unwrap();
      toast.success(`User "${user.displayName}" suspended`);
    } catch {
      toast.error('Failed to suspend user');
    }
  };

  const handleRestore = async (user: UserProfile) => {
    try {
      await restoreUser(user.id).unwrap();
      toast.success(`User "${user.displayName}" restored`);
    } catch {
      toast.error('Failed to restore user');
    }
  };

  const handleUnlock = async (user: UserProfile) => {
    try {
      await unlockUser(user.id).unwrap();
      toast.success(`User "${user.displayName}" unlocked`);
    } catch {
      toast.error('Failed to unlock user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage administrator accounts and permissions.</p>
        </div>
        <Link to={ROUTES.USER_CREATE}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {isError && (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Failed to load users"
          description="An error occurred while loading users."
        />
      )}

      {!isError && users.length === 0 && (
        <div className="space-y-4">
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No users yet"
            description="Create the first user to get started."
          />
          <div className="flex justify-center">
            <Link to={ROUTES.USER_CREATE}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </Link>
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Last Active</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const badge = STATUS_BADGES[user.status];
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <Link to={`/users/${user.id}`} className="font-medium hover:underline">
                            {user.displayName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{user.roleId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.lastActiveAt
                        ? new Date(user.lastActiveAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === UserStatus.Active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              void handleSuspend(user);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {user.status === UserStatus.Suspended && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              void handleRestore(user);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        {user.status === UserStatus.Locked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              void handleUnlock(user);
                            }}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        {(user.status === UserStatus.Disabled ||
                          user.status === UserStatus.Suspended) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              void handleDelete(user);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
