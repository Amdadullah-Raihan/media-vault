import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFilesQuery, useDeleteFileMutation } from '@/services/files.service';
import { PageHeader } from '@/components/shared';
import { SearchInput } from '@/components/shared';
import { Pagination } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { Button, Badge, PageSkeleton, ErrorState, EmptyState } from '@/components/ui';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui';
import { useConfirm } from '@/hooks';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setViewMode } from '@/redux/slices/ui.slice';
import { formatFileSize, formatRelativeTime, getMimeCategory } from '@/utils';
import { Upload, FileText, Image, Video, Music, Archive, File, MoreVertical, Download, Copy, Trash2, Eye, Grid3X3, List, ExternalLink, } from 'lucide-react';
import toast from 'react-hot-toast';
const mimeIconMap = {
    image: Image,
    video: Video,
    audio: Music,
    document: FileText,
    archive: Archive,
    other: File,
};
function FileThumbnail({ file, size }) {
    const category = getMimeCategory(file.mimeType);
    const streamUrl = `/api/v1/files/${file.id}/stream`;
    if (category === 'image') {
        const dims = size === 'lg' ? 'h-32 w-full' : 'h-8 w-8';
        return (_jsx("img", { src: streamUrl, alt: file.originalFilename, className: `${dims} rounded object-cover`, loading: "lazy" }));
    }
    const IconComp = mimeIconMap[category] ?? File;
    const iconDims = size === 'lg' ? 'h-10 w-10' : 'h-4 w-4';
    const bg = size === 'lg' ? 'flex h-32 w-full items-center justify-center rounded-lg bg-muted' : '';
    if (size === 'lg') {
        return (_jsx("div", { className: bg, children: _jsx(IconComp, { className: "h-10 w-10 text-muted-foreground" }) }));
    }
    return _jsx(IconComp, { className: `${iconDims} text-muted-foreground shrink-0` });
}
export default function FilesPage() {
    const navigate = useNavigate();
    const viewMode = useAppSelector((s) => s.ui.viewMode);
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, isLoading, isError, refetch } = useGetFilesQuery({ page, limit: 24, search });
    const [deleteFile, { isLoading: deleting }] = useDeleteFileMutation();
    const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
    const [selectedFile, setSelectedFile] = useState(null);
    const files = data?.data.data ?? [];
    const totalPages = data?.data.totalPages ?? 1;
    const handleDelete = (file) => {
        confirm('Delete File', `Are you sure you want to delete "${file.originalFilename}"? This is irreversible.`, async () => {
            try {
                await deleteFile(file.id).unwrap();
                toast.success('File deleted');
            }
            catch {
                toast.error('Failed to delete file');
            }
        }, 'destructive');
    };
    const handleCopyUrl = (file) => {
        const url = `${window.location.origin}/api/v1/files/${file.id}/stream`;
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };
    const handleDownload = (file) => {
        window.open(`/api/v1/files/${file.id}/download`, '_blank');
    };
    if (isLoading)
        return _jsx(PageSkeleton, {});
    if (isError)
        return _jsx(ErrorState, { onRetry: refetch });
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Files", description: "Browse and manage your uploaded files.", actions: _jsxs(_Fragment, { children: [_jsxs("div", { className: "flex rounded-md border", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'secondary' : 'ghost', size: "icon-sm", onClick: () => dispatch(setViewMode('grid')), "aria-label": "Grid view", children: _jsx(Grid3X3, { className: "h-4 w-4" }) }), _jsx(Button, { variant: viewMode === 'table' ? 'secondary' : 'ghost', size: "icon-sm", onClick: () => dispatch(setViewMode('table')), "aria-label": "Table view", children: _jsx(List, { className: "h-4 w-4" }) })] }), _jsxs(Button, { onClick: () => navigate('/upload'), children: [_jsx(Upload, { className: "h-4 w-4" }), "Upload"] })] }) }), _jsx(SearchInput, { placeholder: "Search files...", value: search, onChange: setSearch, className: "max-w-sm" }), files.length === 0 ? (_jsx(EmptyState, { icon: _jsx(File, { className: "h-6 w-6" }), title: "No files found", description: search ? 'No files match your search.' : 'Upload files to get started.', action: !search ? { label: 'Upload Files', onClick: () => navigate('/upload') } : undefined })) : viewMode === 'grid' ? (_jsx(FileGrid, { files: files, onDelete: handleDelete, onCopyUrl: handleCopyUrl, onDownload: handleDownload, onView: (f) => navigate(`/files/${f.id}`) })) : (_jsx(FileTable, { files: files, onDelete: handleDelete, onCopyUrl: handleCopyUrl, onDownload: handleDownload, onView: (f) => navigate(`/files/${f.id}`) })), _jsx(Pagination, { page: page, totalPages: totalPages, onPageChange: setPage }), _jsx(ConfirmDialog, { open: confirmState.open, onClose: handleClose, onConfirm: handleConfirm, title: confirmState.title, message: confirmState.message, variant: confirmState.variant, loading: deleting, confirmLabel: "Delete" }), selectedFile && (_jsx(FilePreviewModal, { file: selectedFile, onClose: () => setSelectedFile(null) }))] }));
}
// ---------------------------------------------------------------------------
// File Grid
// ---------------------------------------------------------------------------
function FileGrid({ files, onDelete, onCopyUrl, onDownload, onView, }) {
    return (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", children: files.map((file) => {
            return (_jsxs("div", { className: "group rounded-lg border bg-card transition-colors hover:border-primary/50", children: [_jsx(FileThumbnail, { file: file, size: "lg" }), _jsxs("div", { className: "p-4", children: [_jsx("div", { className: "flex justify-end", children: _jsxs(DropdownMenu, { trigger: _jsx("button", { className: "rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100", "aria-label": "File actions", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }), align: "end", children: [_jsxs(DropdownItem, { onClick: () => onView(file), children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), "Preview"] }), _jsxs(DropdownItem, { onClick: () => onDownload(file), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download"] }), _jsxs(DropdownItem, { onClick: () => onCopyUrl(file), children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy URL"] }), _jsx(DropdownSeparator, {}), _jsxs(DropdownItem, { onClick: () => onDelete(file), destructive: true, children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] }) }), _jsx("p", { className: "mt-3 truncate text-sm font-medium", title: file.originalFilename, children: file.originalFilename }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx(Badge, { variant: "secondary", className: "text-xs", children: file.extension.toUpperCase() }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatFileSize(file.size) })] }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: formatRelativeTime(file.createdAt) })] })] }, file.id));
        }) }));
}
// ---------------------------------------------------------------------------
// File Table
// ---------------------------------------------------------------------------
function FileTable({ files, onDelete, onCopyUrl, onDownload, onView, }) {
    return (_jsx("div", { className: "rounded-lg border", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/50", children: [_jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Name" }), _jsx("th", { className: "px-4 py-3 text-left font-medium hidden sm:table-cell", children: "Type" }), _jsx("th", { className: "px-4 py-3 text-left font-medium hidden md:table-cell", children: "Size" }), _jsx("th", { className: "px-4 py-3 text-left font-medium hidden lg:table-cell", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y", children: files.map((file) => {
                            return (_jsxs("tr", { className: "hover:bg-muted/50 transition-colors", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileThumbnail, { file: file, size: "sm" }), _jsx("span", { className: "truncate font-medium max-w-[200px]", children: file.originalFilename })] }) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground hidden sm:table-cell", children: file.mimeType }), _jsx("td", { className: "px-4 py-3 text-muted-foreground hidden md:table-cell", children: formatFileSize(file.size) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground hidden lg:table-cell", children: formatRelativeTime(file.createdAt) }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon-sm", onClick: () => onView(file), "aria-label": "Preview", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: () => onDownload(file), "aria-label": "Download", children: _jsx(Download, { className: "h-4 w-4" }) }), _jsxs(DropdownMenu, { trigger: _jsx(Button, { variant: "ghost", size: "icon-sm", "aria-label": "More actions", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }), align: "end", children: [_jsxs(DropdownItem, { onClick: () => onCopyUrl(file), children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy URL"] }), _jsx(DropdownSeparator, {}), _jsxs(DropdownItem, { onClick: () => onDelete(file), destructive: true, children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })] }) })] }, file.id));
                        }) })] }) }) }));
}
// ---------------------------------------------------------------------------
// File Preview Modal
// ---------------------------------------------------------------------------
function FilePreviewModal({ file, onClose }) {
    const category = getMimeCategory(file.mimeType);
    const streamUrl = `/api/v1/files/${file.id}/stream`;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/60", onClick: onClose }), _jsxs("div", { className: "relative z-50 max-h-[90vh] max-w-4xl rounded-lg bg-background shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b px-6 py-4", children: [_jsx("h3", { className: "font-semibold truncate", children: file.originalFilename }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: onClose, children: _jsx(ExternalLink, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "p-6", children: [category === 'image' && (_jsx("img", { src: streamUrl, alt: file.originalFilename, className: "max-h-[70vh] rounded object-contain" })), category === 'video' && (_jsx("video", { controls: true, className: "max-h-[70vh] rounded", src: streamUrl, children: "Your browser does not support video playback." })), category === 'audio' && (_jsx("audio", { controls: true, className: "w-full", src: streamUrl, children: "Your browser does not support audio playback." })), category === 'document' && file.mimeType === 'application/pdf' && (_jsx("iframe", { src: streamUrl, className: "h-[70vh] w-full rounded", title: file.originalFilename })), !['image', 'video', 'audio'].includes(category) &&
                                file.mimeType !== 'application/pdf' && (_jsxs("div", { className: "space-y-3 py-8 text-center", children: [_jsx(File, { className: "mx-auto h-12 w-12 text-muted-foreground" }), _jsx("p", { className: "text-muted-foreground", children: "Preview not available for this file type." }), _jsxs("dl", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-center gap-2", children: [_jsx("dt", { className: "text-muted-foreground", children: "Type:" }), _jsx("dd", { children: file.mimeType })] }), _jsxs("div", { className: "flex justify-center gap-2", children: [_jsx("dt", { className: "text-muted-foreground", children: "Size:" }), _jsx("dd", { children: formatFileSize(file.size) })] })] })] }))] })] })] }));
}
//# sourceMappingURL=list.js.map