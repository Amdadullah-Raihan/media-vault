import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useGetUsersQuery, useDeleteUserMutation, useSuspendUserMutation, useRestoreUserMutation, useUnlockUserMutation, } from '@/services/users.service';
import { Button, Badge, EmptyState, PageSpinner } from '@/components/ui';
import { UserStatus } from '@/types';
import { ROUTES } from '@/constants';
import { Users, Plus, Shield, Ban, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
const STATUS_BADGES = {
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
    if (isLoading)
        return _jsx(PageSpinner, {});
    const users = data?.data ?? [];
    const handleDelete = async (user) => {
        try {
            await deleteUser(user.id).unwrap();
            toast.success(`User "${user.displayName}" deleted`);
        }
        catch {
            toast.error('Failed to delete user');
        }
    };
    const handleSuspend = async (user) => {
        try {
            await suspendUser(user.id).unwrap();
            toast.success(`User "${user.displayName}" suspended`);
        }
        catch {
            toast.error('Failed to suspend user');
        }
    };
    const handleRestore = async (user) => {
        try {
            await restoreUser(user.id).unwrap();
            toast.success(`User "${user.displayName}" restored`);
        }
        catch {
            toast.error('Failed to restore user');
        }
    };
    const handleUnlock = async (user) => {
        try {
            await unlockUser(user.id).unwrap();
            toast.success(`User "${user.displayName}" unlocked`);
        }
        catch {
            toast.error('Failed to unlock user');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Users" }), _jsx("p", { className: "text-muted-foreground", children: "Manage administrator accounts and permissions." })] }), _jsx(Link, { to: ROUTES.USER_CREATE, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add User"] }) })] }), isError && (_jsx(EmptyState, { icon: _jsx(Users, { className: "h-12 w-12" }), title: "Failed to load users", description: "An error occurred while loading users." })), !isError && users.length === 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx(EmptyState, { icon: _jsx(Users, { className: "h-12 w-12" }), title: "No users yet", description: "Create the first user to get started." }), _jsx("div", { className: "flex justify-center", children: _jsx(Link, { to: ROUTES.USER_CREATE, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Add User"] }) }) })] })), users.length > 0 && (_jsx("div", { className: "rounded-lg border", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/50", children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-medium", children: "User" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium", children: "Role" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium", children: "Last Active" }), _jsx("th", { className: "px-4 py-3 text-right text-sm font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: users.map((user) => {
                                const badge = STATUS_BADGES[user.status];
                                return (_jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium", children: [user.firstName[0], user.lastName[0]] }), _jsxs("div", { children: [_jsx(Link, { to: `/users/${user.id}`, className: "font-medium hover:underline", children: user.displayName }), _jsx("p", { className: "text-xs text-muted-foreground", children: user.email })] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm capitalize", children: user.roleId })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { variant: badge.variant, children: badge.label }) }), _jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: user.lastActiveAt
                                                ? new Date(user.lastActiveAt).toLocaleDateString()
                                                : 'Never' }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [user.status === UserStatus.Active && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                            void handleSuspend(user);
                                                        }, children: _jsx(Ban, { className: "h-4 w-4" }) })), user.status === UserStatus.Suspended && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                            void handleRestore(user);
                                                        }, children: _jsx(Shield, { className: "h-4 w-4" }) })), user.status === UserStatus.Locked && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                            void handleUnlock(user);
                                                        }, children: _jsx(Lock, { className: "h-4 w-4" }) })), (user.status === UserStatus.Disabled ||
                                                        user.status === UserStatus.Suspended) && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                            void handleDelete(user);
                                                        }, children: _jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }))] }) })] }, user.id));
                            }) })] }) }))] }));
}
//# sourceMappingURL=list.js.map