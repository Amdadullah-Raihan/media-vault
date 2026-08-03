import { useGetSessionQuery } from '@/services/auth.service';

/**
 * Returns the current user's permissions from the session.
 * Returns `undefined` while loading and `[]` when not authenticated.
 */
export function usePermissions(): {
  permissions: string[] | undefined;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
} {
  const { data, isLoading } = useGetSessionQuery();
  const permissions = data?.data?.user?.permissions;

  const hasPermission = (permission: string): boolean => {
    if (permissions === undefined) return false;
    return permissions.includes(permission);
  };

  return {
    permissions: permissions ?? [],
    hasPermission,
    isLoading,
  };
}
