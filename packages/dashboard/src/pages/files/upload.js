import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useUploadFileMutation } from '@/services/files.service';
import { useGetProjectsQuery } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { Select, Progress, Button } from '@/components/ui';
import { PageSkeleton } from '@/components/ui';
import { Upload, FileText, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Loader2, Settings, } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatFileSize } from '@/utils';
export default function UploadPage() {
    const navigate = useNavigate();
    const [projectId, setProjectId] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [uploads, setUploads] = useState([]);
    const [uploadFile] = useUploadFileMutation();
    const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();
    const projectOptions = projectsData?.data.data.map((p) => ({ value: p.id, label: p.name })) ?? [];
    const onDrop = useCallback((acceptedFiles) => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }
        const newUploads = acceptedFiles.map((file) => ({
            id: Math.random().toString(36).substring(2),
            file,
            progress: 0,
            status: 'pending',
        }));
        setUploads((prev) => [...prev, ...newUploads]);
        newUploads.forEach((item) => {
            uploadSingleFile(item);
        });
    }, [projectId, visibility]);
    const uploadSingleFile = async (item) => {
        setUploads((prev) => prev.map((u) => (u.id === item.id ? { ...u, status: 'uploading' } : u)));
        try {
            await uploadFile({
                file: item.file,
                projectId,
                visibility,
            }).unwrap();
            setUploads((prev) => prev.map((u) => u.id === item.id ? { ...u, status: 'success', progress: 100 } : u));
        }
        catch (err) {
            const apiErr = err;
            setUploads((prev) => prev.map((u) => u.id === item.id
                ? {
                    ...u,
                    status: 'error',
                    error: apiErr?.data?.message ?? 'Upload failed',
                }
                : u));
        }
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    });
    if (projectsLoading)
        return _jsx(PageSkeleton, {});
    const pendingCount = uploads.filter((u) => u.status === 'uploading' || u.status === 'pending').length;
    const successCount = uploads.filter((u) => u.status === 'success').length;
    const errorCount = uploads.filter((u) => u.status === 'error').length;
    return (_jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [_jsxs("button", { onClick: () => navigate('/files'), className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Files"] }), _jsx(PageHeader, { title: "Upload Files", description: "Drag and drop files to upload to your MediaVault.", actions: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate('/settings'), children: [_jsx(Settings, { className: "mr-1.5 h-4 w-4" }), "Upload Rules"] }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Select, { id: "project", label: "Project", placeholder: "Select a project", options: projectOptions, value: projectId, onChange: (e) => setProjectId(e.target.value) }), _jsx(Select, { id: "visibility", label: "Visibility", options: [
                            { value: 'private', label: 'Private' },
                            { value: 'public', label: 'Public' },
                        ], value: visibility, onChange: (e) => setVisibility(e.target.value) })] }), _jsxs("div", { ...getRootProps(), className: `flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'}`, children: [_jsx("input", { ...getInputProps() }), _jsx("div", { className: "mb-4 rounded-full bg-muted p-3", children: _jsx(Upload, { className: "h-6 w-6 text-muted-foreground" }) }), _jsx("p", { className: "text-sm font-medium", children: isDragActive ? 'Drop files here' : 'Drag & drop files here' }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or click to browse \u00B7 Max 100MB per file" })] }), uploads.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [pendingCount > 0 && (_jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [_jsx(Loader2, { className: "h-3 w-3 animate-spin" }), pendingCount, " uploading"] })), successCount > 0 && (_jsxs("span", { className: "flex items-center gap-1 text-success", children: [_jsx(CheckCircle2, { className: "h-3 w-3" }), successCount, " done"] })), errorCount > 0 && (_jsxs("span", { className: "flex items-center gap-1 text-destructive", children: [_jsx(XCircle, { className: "h-3 w-3" }), errorCount, " failed"] }))] }), _jsx("div", { className: "space-y-2", children: uploads.map((item) => (_jsxs("div", { className: "flex items-center gap-3 rounded-lg border p-3", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded bg-muted", children: item.status === 'success' ? (_jsx(CheckCircle2, { className: "h-4 w-4 text-success" })) : item.status === 'error' ? (_jsx(AlertCircle, { className: "h-4 w-4 text-destructive" })) : (_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium", children: item.file.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [formatFileSize(item.file.size), item.error && _jsx("span", { className: "ml-2 text-destructive", children: item.error })] }), item.status === 'uploading' && (_jsx(Progress, { value: item.progress, size: "sm", className: "mt-1" }))] })] }, item.id))) })] }))] }));
}
//# sourceMappingURL=upload.js.map