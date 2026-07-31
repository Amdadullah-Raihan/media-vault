import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectQuery, useDeleteProjectMutation } from '@/services/projects.service';
import { useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation, } from '@/services/api-keys.service';
import { useGetFilesQuery } from '@/services/files.service';
import { PageHeader, StatCard } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { Button, Badge, PageSkeleton, ErrorState } from '@/components/ui';
import { useConfirm } from '@/hooks';
import { formatDate, formatFileSize, formatRelativeTime } from '@/utils';
import { ArrowLeft, FileText, Key, HardDrive, Plus, Trash2, Copy, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
export default function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
    const [newKeyValue, setNewKeyValue] = useState(null);
    const { data: projectData, isLoading, isError, refetch } = useGetProjectQuery(id);
    const { data: keysData } = useGetApiKeysQuery(id);
    const { data: filesData } = useGetFilesQuery({ projectId: id, limit: 10 });
    const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
    const [createApiKey, { isLoading: creatingKey }] = useCreateApiKeyMutation();
    const [revokeApiKey] = useRevokeApiKeyMutation();
    if (isLoading)
        return _jsx(PageSkeleton, {});
    if (isError || !projectData?.data)
        return _jsx(ErrorState, { onRetry: refetch });
    const project = projectData.data;
    const apiKeys = keysData?.data ?? [];
    const files = filesData?.data.data ?? [];
    const totalStorage = files.reduce((sum, f) => sum + f.size, 0);
    const handleDelete = () => {
        confirm('Delete Project', `Are you sure you want to delete "${project.name}"? This is irreversible.`, async () => {
            try {
                await deleteProject(project.id).unwrap();
                toast.success('Project deleted');
                navigate('/projects');
            }
            catch {
                toast.error('Failed to delete project');
            }
        }, 'destructive');
    };
    const handleGenerateKey = async () => {
        try {
            const result = await createApiKey({ projectId: project.id, label: 'default' }).unwrap();
            setNewKeyValue(result.data.rawKey);
            toast.success('API Key generated');
        }
        catch {
            toast.error('Failed to generate API key');
        }
    };
    const handleRevokeKey = (key) => {
        confirm('Revoke API Key', `Are you sure you want to revoke this API key? Applications using it will lose access.`, async () => {
            try {
                await revokeApiKey(key.id).unwrap();
                toast.success('API Key revoked');
            }
            catch {
                toast.error('Failed to revoke API key');
            }
        }, 'destructive');
    };
    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
        toast.success('Key copied to clipboard');
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("button", { onClick: () => navigate('/projects'), className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Projects"] }), _jsx(PageHeader, { title: project.name, description: project.description ?? undefined, actions: _jsxs(Button, { variant: "destructive", size: "sm", onClick: handleDelete, loading: deleting, children: [_jsx(Trash2, { className: "h-4 w-4" }), "Delete Project"] }) })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(StatCard, { title: "Files", value: filesData?.data.total ?? 0, icon: FileText }), _jsx(StatCard, { title: "Storage Used", value: formatFileSize(totalStorage), icon: HardDrive }), _jsx(StatCard, { title: "API Keys", value: apiKeys.length, icon: Key })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "API Keys" }), _jsxs(Button, { size: "sm", onClick: handleGenerateKey, loading: creatingKey, children: [_jsx(Plus, { className: "h-4 w-4" }), "Generate Key"] })] }), newKeyValue && (_jsxs("div", { className: "mb-4 rounded-lg border border-success/50 bg-success/5 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-success", children: "New API Key" }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: () => setNewKeyValue(null), children: _jsx(EyeOff, { className: "h-4 w-4" }) })] }), _jsx("p", { className: "mt-1 font-mono text-sm break-all", children: newKeyValue }), _jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Copy this key now. You won't be able to see it again." }), _jsxs(Button, { size: "sm", variant: "outline", className: "mt-2", onClick: () => handleCopyKey(newKeyValue), children: [_jsx(Copy, { className: "h-4 w-4" }), "Copy"] })] })), _jsx("div", { className: "rounded-lg border", children: apiKeys.length === 0 ? (_jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "No API keys yet. Generate one to get started." })) : (_jsx("div", { className: "divide-y", children: apiKeys.map((key) => (_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: key.label }), _jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: ["mv_...", key.id.slice(-6)] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Created ", formatDate(key.createdAt), key.lastUsedAt && ` · Last used ${formatRelativeTime(key.lastUsedAt)}`] })] }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: () => handleRevokeKey(key), className: "text-destructive hover:text-destructive", "aria-label": "Revoke API key", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, key.id))) })) })] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Recent Files" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate('/files'), children: "View all" })] }), _jsx("div", { className: "rounded-lg border", children: files.length === 0 ? (_jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: "No files uploaded yet." })) : (_jsx("div", { className: "divide-y", children: files.map((file) => (_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx(FileText, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium", children: file.originalFilename }), _jsx("p", { className: "text-xs text-muted-foreground", children: formatFileSize(file.size) })] })] }), _jsx(Badge, { variant: "outline", className: "shrink-0 text-xs", children: file.visibility })] }, file.id))) })) })] })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Project Details" }), _jsxs("dl", { className: "mt-2 space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-muted-foreground", children: "ID" }), _jsx("dd", { className: "font-mono", children: project.id })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-muted-foreground", children: "Created" }), _jsx("dd", { children: formatDate(project.createdAt) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-muted-foreground", children: "Updated" }), _jsx("dd", { children: formatDate(project.updatedAt) })] })] })] }), _jsx(ConfirmDialog, { open: confirmState.open, onClose: handleClose, onConfirm: handleConfirm, title: confirmState.title, message: confirmState.message, variant: confirmState.variant, loading: deleting, confirmLabel: "Delete" })] }));
}
//# sourceMappingURL=detail.js.map