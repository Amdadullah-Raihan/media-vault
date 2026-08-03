import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsQuery, useDeleteProjectMutation } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { SearchInput } from '@/components/shared';
import { Pagination } from '@/components/shared';
import {
  Button,
  Badge,
  PageSkeleton,
  ErrorState,
  EmptyState,
  ForbiddenState,
  PageSpinner,
} from '@/components/ui';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui';
import { useConfirm, usePermissions } from '@/hooks';
import { formatDate } from '@/utils';
import { Plus, FolderOpen, MoreVertical, ExternalLink, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Project } from '@/types';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const canView = hasPermission('projects.view');
  const canCreate = hasPermission('projects.create');
  const canDelete = hasPermission('projects.delete');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useGetProjectsQuery(
    { page, limit: 12 },
    { skip: !canView },
  );
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();

  const projects = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 1;

  const handleDelete = (project: Project) => {
    confirm(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This will remove all associated files and API keys permanently.`,
      async () => {
        try {
          await deleteProject(project.id).unwrap();
          toast.success('Project deleted');
        } catch {
          toast.error('Failed to delete project');
        }
      },
      'destructive',
    );
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('ID copied to clipboard');
  };

  if (permissionsLoading) return <PageSpinner />;
  if (!canView) return <ForbiddenState />;

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your MediaVault projects and their configurations."
        actions={
          canCreate ? (
            <Button onClick={() => navigate('/projects/new')}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          ) : undefined
        }
      />

      {/* Search */}
      <SearchInput
        placeholder="Search projects..."
        value={search}
        onChange={setSearch}
        className="max-w-sm"
      />

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-6 w-6" />}
          title="No projects yet"
          description="Create your first project to start managing media."
          action={{ label: 'Create Project', onClick: () => navigate('/projects/new') }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p: Project) => p.name.toLowerCase().includes(search.toLowerCase()))
              .map((project: Project) => (
                <div
                  key={project.id}
                  className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu
                      trigger={
                        <button
                          className="rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                          aria-label="Project actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      align="end"
                    >
                      <DropdownItem onClick={() => navigate(`/projects/${project.id}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownItem>
                      <DropdownItem onClick={() => handleCopyId(project.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                      </DropdownItem>
                      {canDelete && (
                        <>
                          <DropdownSeparator />
                          <DropdownItem onClick={() => handleDelete(project)} destructive>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </div>
                  {project.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {project.id.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={confirmState.open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        loading={deleting}
        confirmLabel="Delete"
      />
    </div>
  );
}
