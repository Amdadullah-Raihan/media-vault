import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageHeader, StatCard } from '@/components/shared';
import { PageSkeleton } from '@/components/ui';
import { useGetProjectsQuery } from '@/services/projects.service';
import { useGetFilesQuery } from '@/services/files.service';
import { FolderOpen, FileText, HardDrive, Upload } from 'lucide-react';
import { formatFileSize, formatRelativeTime } from '@/utils';
export default function DashboardPage() {
    const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery({ limit: 5 });
    const { data: filesData, isLoading: filesLoading } = useGetFilesQuery({ limit: 5 });
    const isLoading = projectsLoading || filesLoading;
    if (isLoading)
        return _jsx(PageSkeleton, {});
    const projects = projectsData?.data.data ?? [];
    const files = filesData?.data.data ?? [];
    const totalStorage = files.reduce((sum, f) => sum + f.size, 0);
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(PageHeader, { title: "Overview", description: "Your MediaVault at a glance." }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx(StatCard, { title: "Total Projects", value: projects.length, icon: FolderOpen }), _jsx(StatCard, { title: "Total Files", value: filesData?.data.total ?? 0, icon: FileText }), _jsx(StatCard, { title: "Storage Used", value: formatFileSize(totalStorage), icon: HardDrive }), _jsx(StatCard, { title: "Recent Uploads", value: files.length, icon: Upload })] }), _jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-lg font-semibold", children: "Recent Uploads" }), files.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No files uploaded yet." })) : (_jsx("div", { className: "rounded-lg border", children: _jsx("div", { className: "divide-y", children: files.map((file) => (_jsxs("div", { className: "flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx(FileText, { className: "h-5 w-5 shrink-0 text-muted-foreground" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium", children: file.originalFilename }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [formatFileSize(file.size), " \u00B7 ", file.mimeType] })] })] }), _jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: formatRelativeTime(file.createdAt) })] }, file.id))) }) }))] }), _jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-lg font-semibold", children: "Recent Projects" }), projects.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No projects created yet." })) : (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: projects.map((project) => (_jsx("div", { className: "rounded-lg border p-4 hover:border-primary/50 transition-colors", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-md bg-primary/10", children: _jsx(FolderOpen, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium", children: project.name }), project.description && (_jsx("p", { className: "truncate text-xs text-muted-foreground", children: project.description }))] })] }) }, project.id))) }))] })] }));
}
//# sourceMappingURL=dashboard.js.map