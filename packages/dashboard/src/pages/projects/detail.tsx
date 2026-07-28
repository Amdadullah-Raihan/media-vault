import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectQuery, useDeleteProjectMutation } from '@/services/projects.service';
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} from '@/services/api-keys.service';
import { useGetFilesQuery } from '@/services/files.service';
import { PageHeader, StatCard } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import { Button, Badge, PageSkeleton, ErrorState } from '@/components/ui';
import { useConfirm } from '@/hooks';
import { formatDate, formatFileSize, formatRelativeTime } from '@/utils';
import { ArrowLeft, FileText, Key, HardDrive, Plus, Trash2, Copy, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import type { FileMetadata, ApiKey } from '@/types';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const { data: projectData, isLoading, isError, refetch } = useGetProjectQuery(id!);
  const { data: keysData } = useGetApiKeysQuery(id);
  const { data: filesData } = useGetFilesQuery({ projectId: id, limit: 10 });
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const [createApiKey, { isLoading: creatingKey }] = useCreateApiKeyMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();

  if (isLoading) return <PageSkeleton />;
  if (isError || !projectData?.data) return <ErrorState onRetry={refetch} />;

  const project = projectData.data;
  const apiKeys = keysData?.data ?? [];
  const files = filesData?.data.data ?? [];
  const totalStorage = files.reduce((sum: number, f: FileMetadata) => sum + f.size, 0);

  const handleDelete = () => {
    confirm(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This is irreversible.`,
      async () => {
        try {
          await deleteProject(project.id).unwrap();
          toast.success('Project deleted');
          navigate('/projects');
        } catch {
          toast.error('Failed to delete project');
        }
      },
      'destructive',
    );
  };

  const handleGenerateKey = async () => {
    try {
      const result = await createApiKey({ projectId: project.id, label: 'default' }).unwrap();
      setNewKeyValue(result.data.rawKey);
      toast.success('API Key generated');
    } catch {
      toast.error('Failed to generate API key');
    }
  };

  const handleRevokeKey = (key: ApiKey) => {
    confirm(
      'Revoke API Key',
      `Are you sure you want to revoke this API key? Applications using it will lose access.`,
      async () => {
        try {
          await revokeApiKey(key.id).unwrap();
          toast.success('API Key revoked');
        } catch {
          toast.error('Failed to revoke API key');
        }
      },
      'destructive',
    );
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key copied to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div className="space-y-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <PageHeader
          title={project.name}
          description={project.description ?? undefined}
          actions={
            <Button variant="destructive" size="sm" onClick={handleDelete} loading={deleting}>
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          }
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Files" value={filesData?.data.total ?? 0} icon={FileText} />
        <StatCard title="Storage Used" value={formatFileSize(totalStorage)} icon={HardDrive} />
        <StatCard title="API Keys" value={apiKeys.length} icon={Key} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Keys */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">API Keys</h2>
            <Button size="sm" onClick={handleGenerateKey} loading={creatingKey}>
              <Plus className="h-4 w-4" />
              Generate Key
            </Button>
          </div>

          {newKeyValue && (
            <div className="mb-4 rounded-lg border border-success/50 bg-success/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-success">New API Key</p>
                <Button variant="ghost" size="icon-sm" onClick={() => setNewKeyValue(null)}>
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 font-mono text-sm break-all">{newKeyValue}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Copy this key now. You won't be able to see it again.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => handleCopyKey(newKeyValue)}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          )}

          <div className="rounded-lg border">
            {apiKeys.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No API keys yet. Generate one to get started.
              </div>
            ) : (
              <div className="divide-y">
                {apiKeys.map((key: ApiKey) => (
                  <div key={key.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{key.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        mv_...{key.id.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(key.createdAt)}
                        {key.lastUsedAt && ` · Last used ${formatRelativeTime(key.lastUsedAt)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRevokeKey(key)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Revoke API key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Files */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Files</h2>
            <Button size="sm" variant="outline" onClick={() => navigate('/files')}>
              View all
            </Button>
          </div>

          <div className="rounded-lg border">
            {files.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No files uploaded yet.
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file: FileMetadata) => (
                  <div key={file.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{file.originalFilename}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {file.visibility}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Project Details</h3>
        <dl className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono">{project.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(project.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatDate(project.updatedAt)}</dd>
          </div>
        </dl>
      </div>

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
