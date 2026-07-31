import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsQuery, useDeleteProjectMutation } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { SearchInput } from '@/components/shared';
import { Pagination } from '@/components/shared';
import { Button, Badge, PageSkeleton, ErrorState, EmptyState } from '@/components/ui';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui';
import { useConfirm } from '@/hooks';
import { formatDate } from '@/utils';
import { Plus, FolderOpen, MoreVertical, ExternalLink, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
export default function ProjectsListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, isLoading, isError, refetch } = useGetProjectsQuery({ page, limit: 12 });
    const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
    const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
    const projects = data?.data.data ?? [];
    const totalPages = data?.data.totalPages ?? 1;
    const handleDelete = (project) => {
        confirm('Delete Project', `Are you sure you want to delete "${project.name}"? This will remove all associated files and API keys permanently.`, async () => {
            try {
                await deleteProject(project.id).unwrap();
                toast.success('Project deleted');
            }
            catch {
                toast.error('Failed to delete project');
            }
        }, 'destructive');
    };
    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        toast.success('ID copied to clipboard');
    };
    if (isLoading)
        return _jsx(PageSkeleton, {});
    if (isError)
        return _jsx(ErrorState, { onRetry: refetch });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Projects", description: "Manage your MediaVault projects and their configurations.", actions: _jsxs(Button, { onClick: () => navigate('/projects/new'), children: [_jsx(Plus, { className: "h-4 w-4" }), "New Project"] }) }), _jsx(SearchInput, { placeholder: "Search projects...", value: search, onChange: setSearch, className: "max-w-sm" }), projects.length === 0 ? (_jsx(EmptyState, { icon: _jsx(FolderOpen, { className: "h-6 w-6" }), title: "No projects yet", description: "Create your first project to start managing media.", action: { label: 'Create Project', onClick: () => navigate('/projects/new') } })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: projects
                            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                            .map((project) => (_jsxs("div", { className: "group rounded-lg border bg-card p-4 transition-colors hover:border-primary/50", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: _jsx(FolderOpen, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: project.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Created ", formatDate(project.createdAt)] })] })] }), _jsxs(DropdownMenu, { trigger: _jsx("button", { className: "rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100", "aria-label": "Project actions", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }), align: "end", children: [_jsxs(DropdownItem, { onClick: () => navigate(`/projects/${project.id}`), children: [_jsx(ExternalLink, { className: "mr-2 h-4 w-4" }), "View Details"] }), _jsxs(DropdownItem, { onClick: () => handleCopyId(project.id), children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy ID"] }), _jsx(DropdownSeparator, {}), _jsxs(DropdownItem, { onClick: () => handleDelete(project), destructive: true, children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] }), project.description && (_jsx("p", { className: "mt-3 text-sm text-muted-foreground line-clamp-2", children: project.description })), _jsx("div", { className: "mt-4", children: _jsxs(Badge, { variant: "secondary", className: "font-mono text-xs", children: [project.id.slice(0, 8), "..."] }) })] }, project.id))) }), _jsx(Pagination, { page: page, totalPages: totalPages, onPageChange: setPage })] })), _jsx(ConfirmDialog, { open: confirmState.open, onClose: handleClose, onConfirm: handleConfirm, title: confirmState.title, message: confirmState.message, variant: confirmState.variant, loading: deleting, confirmLabel: "Delete" })] }));
}
//# sourceMappingURL=list.js.map