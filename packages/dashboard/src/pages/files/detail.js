import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useGetFileQuery, useUpdateFileMutation, useDeleteFileMutation, useGetSignedUrlMutation, } from '@/services/files.service';
import { PageHeader } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { Button, Badge, PageSkeleton, ErrorState } from '@/components/ui';
import { useConfirm } from '@/hooks';
import { formatFileSize, formatDateTime, getMimeCategory, isPreviewable } from '@/utils';
import { FileVisibility } from '@/types';
import { ArrowLeft, Download, Copy, Trash2, FileText, Image, Video, Music, Archive, File, Link, } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
const mimeIconMap = {
    image: Image,
    video: Video,
    audio: Music,
    document: FileText,
    archive: Archive,
    other: File,
};
export default function FileDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
    const [signedUrl, setSignedUrl] = useState(null);
    const { data, isLoading, isError, refetch } = useGetFileQuery(id);
    const [deleteFile, { isLoading: deleting }] = useDeleteFileMutation();
    const [updateFile, { isLoading: updatingVisibility }] = useUpdateFileMutation();
    const [getSignedUrl, { isLoading: generatingUrl }] = useGetSignedUrlMutation();
    if (isLoading)
        return _jsx(PageSkeleton, {});
    if (isError || !data?.data)
        return _jsx(ErrorState, { onRetry: refetch });
    const file = data.data;
    const category = getMimeCategory(file.mimeType);
    const IconComponent = mimeIconMap[category] ?? File;
    void IconComponent;
    const streamUrl = `/api/v1/files/${file.id}/stream`;
    const previewable = isPreviewable(file.mimeType);
    const handleDelete = () => {
        confirm('Delete File', `Are you sure you want to delete "${file.originalFilename}"?`, async () => {
            try {
                await deleteFile(file.id).unwrap();
                toast.success('File deleted');
                navigate('/files');
            }
            catch {
                toast.error('Failed to delete file');
            }
        }, 'destructive');
    };
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(streamUrl);
        toast.success('URL copied');
    };
    const handleDownload = () => {
        window.open(`/api/v1/files/${file.id}/download`, '_blank');
    };
    const handleGenerateSignedUrl = async () => {
        try {
            const result = await getSignedUrl({
                fileId: file.id,
                body: { expiresInSeconds: 3600 },
            }).unwrap();
            setSignedUrl(result.data.url);
            navigator.clipboard.writeText(result.data.url);
            toast.success('Signed URL copied to clipboard');
        }
        catch {
            toast.error('Failed to generate signed URL');
        }
    };
    const handleToggleVisibility = async () => {
        const newVisibility = file.visibility === 'public' ? FileVisibility.Private : FileVisibility.Public;
        try {
            await updateFile({ id: file.id, body: { visibility: newVisibility } }).unwrap();
            toast.success(`File is now ${newVisibility}`);
        }
        catch {
            toast.error('Failed to update visibility');
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-3xl space-y-6", children: [_jsxs("button", { onClick: () => navigate('/files'), className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Files"] }), _jsx(PageHeader, { title: file.originalFilename, description: `${formatFileSize(file.size)} · ${file.mimeType}`, actions: _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", onClick: handleDownload, children: [_jsx(Download, { className: "h-4 w-4" }), "Download"] }), _jsxs(Button, { size: "sm", variant: "destructive", onClick: handleDelete, loading: deleting, children: [_jsx(Trash2, { className: "h-4 w-4" }), "Delete"] })] }) }), previewable && (_jsxs("div", { className: "overflow-hidden rounded-lg border bg-black/5 dark:bg-white/5", children: [category === 'image' && (_jsx("img", { src: streamUrl, alt: file.originalFilename, className: "max-h-[60vh] w-full object-contain" })), category === 'video' && (_jsx("video", { controls: true, className: "max-h-[60vh] w-full", src: streamUrl })), category === 'audio' && _jsx("audio", { controls: true, className: "w-full p-4", src: streamUrl }), file.mimeType === 'application/pdf' && (_jsx("iframe", { src: streamUrl, className: "h-[60vh] w-full", title: file.originalFilename }))] })), _jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsx("h3", { className: "font-semibold", children: "File Information" }) }), _jsxs("dl", { className: "divide-y", children: [_jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Filename" }), _jsx("dd", { className: "font-medium", children: file.filename })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Original Name" }), _jsx("dd", { className: "font-medium", children: file.originalFilename })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "MIME Type" }), _jsx("dd", { className: "font-medium", children: file.mimeType })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Size" }), _jsx("dd", { className: "font-medium", children: formatFileSize(file.size) })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Extension" }), _jsx("dd", { className: "font-medium uppercase", children: file.extension })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Visibility" }), _jsxs("dd", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: file.visibility === 'public' ? 'success' : 'secondary', children: file.visibility }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: handleToggleVisibility, loading: updatingVisibility, title: `Make ${file.visibility === 'public' ? 'private' : 'public'}`, children: file.visibility === 'public' ? (_jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-3 3m0 0l6.364-6.364M9.88 9.88L3 3" }) })) : (_jsxs("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) })] })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Hash" }), _jsx("dd", { className: "font-mono text-xs max-w-[200px] truncate", children: file.hash })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Created" }), _jsx("dd", { children: formatDateTime(file.createdAt) })] }), _jsxs("div", { className: "flex justify-between px-6 py-3 text-sm", children: [_jsx("dt", { className: "text-muted-foreground", children: "Updated" }), _jsx("dd", { children: formatDateTime(file.updatedAt) })] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handleCopyUrl, children: [_jsx(Copy, { className: "h-4 w-4" }), "Copy Stream URL"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleGenerateSignedUrl, loading: generatingUrl, children: [_jsx(Link, { className: "h-4 w-4" }), "Generate Signed URL"] })] }), signedUrl && (_jsxs("div", { className: "rounded-lg border border-success/50 bg-success/5 p-4", children: [_jsx("p", { className: "text-sm font-medium text-success", children: "Signed URL generated" }), _jsx("p", { className: "mt-1 font-mono text-xs break-all", children: signedUrl }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Expires in 1 hour. Already copied to clipboard." })] })), _jsx(ConfirmDialog, { open: confirmState.open, onClose: handleClose, onConfirm: handleConfirm, title: confirmState.title, message: confirmState.message, variant: confirmState.variant, loading: deleting, confirmLabel: "Delete" })] }));
}
//# sourceMappingURL=detail.js.map