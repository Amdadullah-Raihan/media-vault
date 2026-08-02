import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useGetRolesQuery, useDeleteRoleMutation, useDuplicateRoleMutation, } from '@/services/roles.service';
import { Button, Badge, EmptyState, PageSpinner } from '@/components/ui';
import { ROUTES } from '@/constants';
import { Shield, Plus, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
export default function RolesListPage() {
    const { data, isLoading, isError } = useGetRolesQuery();
    const [deleteRole] = useDeleteRoleMutation();
    const [duplicateRole] = useDuplicateRoleMutation();
    if (isLoading)
        return _jsx(PageSpinner, {});
    const roles = data?.data ?? [];
    const handleDelete = async (role) => {
        try {
            await deleteRole(role.id).unwrap();
            toast.success(`Role "${role.name}" deleted`);
        }
        catch {
            toast.error('Failed to delete role');
        }
    };
    const handleDuplicate = async (role) => {
        try {
            await duplicateRole(role.id).unwrap();
            toast.success(`Role "${role.name}" duplicated`);
        }
        catch {
            toast.error('Failed to duplicate role');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Roles" }), _jsx("p", { className: "text-muted-foreground", children: "Manage roles and their permissions." })] }), _jsx(Link, { to: ROUTES.ROLE_CREATE, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Create Role"] }) })] }), isError && (_jsx(EmptyState, { icon: _jsx(Shield, { className: "h-12 w-12" }), title: "Failed to load roles" })), !isError && roles.length === 0 && (_jsx(EmptyState, { icon: _jsx(Shield, { className: "h-12 w-12" }), title: "No roles yet" })), roles.length > 0 && (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: roles.map((role) => (_jsxs("div", { className: "rounded-lg border p-4 transition-colors hover:bg-muted/30", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: _jsx(Shield, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx(Link, { to: `/roles/${role.id}`, className: "font-medium hover:underline", children: role.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [role.permissions.length, " permission", role.permissions.length !== 1 ? 's' : ''] })] })] }), role.isBuiltIn && _jsx(Badge, { variant: "secondary", children: "Built-in" })] }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground line-clamp-2", children: role.description }), _jsx("div", { className: "mt-3 flex gap-1", children: !role.isBuiltIn && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                            void handleDuplicate(role);
                                        }, children: _jsx(Copy, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                            void handleDelete(role);
                                        }, children: _jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })] })) })] }, role.id))) }))] }));
}
//# sourceMappingURL=list.js.map