import { PageHeader, StatCard } from '@/components/shared';
import { PageSkeleton } from '@/components/ui';
import { useGetProjectsQuery } from '@/services/projects.service';
import { useGetFilesQuery } from '@/services/files.service';
import { FolderOpen, FileText, HardDrive, Upload } from 'lucide-react';
import { formatFileSize, formatRelativeTime } from '@/utils';
import type { FileMetadata } from '@/types';

export default function DashboardPage() {
  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery({ limit: 5 });
  const { data: filesData, isLoading: filesLoading } = useGetFilesQuery({ limit: 5 });

  const isLoading = projectsLoading || filesLoading;

  if (isLoading) return <PageSkeleton />;

  const projects = projectsData?.data.data ?? [];
  const files = filesData?.data.data ?? [];
  const totalStorage = files.reduce((sum: number, f: FileMetadata) => sum + f.size, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description="Your MediaVault at a glance." />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={projects.length} icon={FolderOpen} />
        <StatCard title="Total Files" value={filesData?.data.total ?? 0} icon={FileText} />
        <StatCard title="Storage Used" value={formatFileSize(totalStorage)} icon={HardDrive} />
        <StatCard title="Recent Uploads" value={files.length} icon={Upload} />
      </div>

      {/* Recent Uploads */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Uploads</h2>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
        ) : (
          <div className="rounded-lg border">
            <div className="divide-y">
              {files.map((file: FileMetadata) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.originalFilename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} · {file.mimeType}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(file.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Projects</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects created yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    {project.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
