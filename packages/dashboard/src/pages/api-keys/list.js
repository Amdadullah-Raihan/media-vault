import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation, } from '@/services/api-keys.service';
import { useGetProjectsQuery } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { Button, Select, PageSkeleton, ErrorState, EmptyState } from '@/components/ui';
import { useConfirm } from '@/hooks';
import { formatDate, formatRelativeTime } from '@/utils';
import { Key, Plus, Copy, Trash2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
export default function ApiKeysPage() {
    const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
    const [selectedProject, setSelectedProject] = useState('');
    const [newKeyValue, setNewKeyValue] = useState(null);
    const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();
    const { data: keysData, isLoading: keysLoading, isError, refetch, } = useGetApiKeysQuery(selectedProject || undefined);
    const [createApiKey, { isLoading: creatingKey }] = useCreateApiKeyMutation();
    const [revokeApiKey] = useRevokeApiKeyMutation();
    const projectOptions = projectsData?.data.data.map((p) => ({ value: p.id, label: p.name })) ?? [];
    const isLoading = projectsLoading || keysLoading;
    const handleGenerateKey = async () => {
        if (!selectedProject) {
            toast.error('Please select a project first');
            return;
        }
        try {
            const result = await createApiKey({ projectId: selectedProject, label: 'default' }).unwrap();
            setNewKeyValue(result.data.rawKey);
            toast.success('API Key generated');
        }
        catch {
            toast.error('Failed to generate API key');
        }
    };
    const handleRevoke = (key) => {
        confirm('Revoke API Key', 'Applications using this key will lose access immediately. This cannot be undone.', async () => {
            try {
                await revokeApiKey(key.id).unwrap();
                toast.success('API Key revoked');
            }
            catch {
                toast.error('Failed to revoke API key');
            }
        }, 'destructive');
    };
    const handleCopyKey = (val) => {
        navigator.clipboard.writeText(val);
        toast.success('Key copied to clipboard');
    };
    if (isLoading)
        return _jsx(PageSkeleton, {});
    if (isError)
        return _jsx(ErrorState, { onRetry: refetch });
    const apiKeys = keysData?.data ?? [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "API Keys", description: "Manage API keys for application authentication.", actions: _jsxs(Button, { onClick: handleGenerateKey, loading: creatingKey, disabled: !selectedProject, children: [_jsx(Plus, { className: "h-4 w-4" }), "Generate Key"] }) }), _jsx(Select, { id: "project-filter", label: "Filter by Project", placeholder: "All Projects", options: [{ value: '', label: 'All Projects' }, ...projectOptions], value: selectedProject, onChange: (e) => setSelectedProject(e.target.value), className: "max-w-xs" }), newKeyValue && (_jsxs("div", { className: "rounded-lg border border-success/50 bg-success/5 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-success", children: "New API Key Generated" }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: () => setNewKeyValue(null), children: _jsx(EyeOff, { className: "h-4 w-4" }) })] }), _jsx("p", { className: "mt-1 font-mono text-sm break-all select-all", children: newKeyValue }), _jsx("div", { className: "mt-3 flex gap-2", children: _jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleCopyKey(newKeyValue), children: [_jsx(Copy, { className: "h-4 w-4" }), "Copy Key"] }) }), _jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "This is the only time the full key will be shown. Store it securely." })] })), apiKeys.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Key, { className: "h-6 w-6" }), title: "No API keys", description: selectedProject
                    ? 'Generate an API key for this project.'
                    : 'Select a project and generate an API key.' })) : (_jsx("div", { className: "rounded-lg border", children: _jsx("div", { className: "divide-y", children: apiKeys.map((key) => (_jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10", children: _jsx(Key, { className: "h-4 w-4 text-primary" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium", children: key.label }), _jsxs("p", { className: "font-mono text-xs text-muted-foreground truncate", children: ["mv_...", key.id.slice(-8)] })] })] }), _jsxs("div", { className: "mt-1 flex gap-4 text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Created ", formatDate(key.createdAt)] }), key.lastUsedAt && _jsxs("span", { children: ["Last used ", formatRelativeTime(key.lastUsedAt)] })] })] }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: () => handleRevoke(key), className: "text-destructive hover:text-destructive shrink-0", "aria-label": "Revoke API key", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, key.id))) }) })), _jsx(ConfirmDialog, { open: confirmState.open, onClose: handleClose, onConfirm: handleConfirm, title: confirmState.title, message: confirmState.message, variant: confirmState.variant, confirmLabel: "Revoke" })] }));
}
//# sourceMappingURL=list.js.map