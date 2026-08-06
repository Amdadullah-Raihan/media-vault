import { useState } from 'react';
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} from '@/services/api-keys.service';
import { useGetProjectsQuery } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import {
  Button,
  Select,
  PageSkeleton,
  ErrorState,
  EmptyState,
  ForbiddenState,
  PageSpinner,
} from '@/components/ui';
import { useConfirm, usePermissions } from '@/hooks';
import { formatDate, formatRelativeTime } from '@/utils';
import { Key, Plus, Copy, Trash2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ApiKey } from '@/types';
import type { SelectOption } from '@/components/ui';

export default function ApiKeysPage() {
  const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const canView = hasPermission('apikeys.view');
  const canCreate = hasPermission('apikeys.create');
  const canDelete = hasPermission('apikeys.delete');

  const [selectedProject, setSelectedProject] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: !canView,
  });
  const {
    data: keysData,
    isLoading: keysLoading,
    isError,
    refetch,
  } = useGetApiKeysQuery(selectedProject || undefined, { skip: !canView });
  const [createApiKey, { isLoading: creatingKey }] = useCreateApiKeyMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();

  const projectOptions: SelectOption[] =
    projectsData?.data.data.map((p) => ({ value: p.id, label: p.name })) ?? [];

  if (permissionsLoading) return <PageSpinner />;
  if (!canView) return <ForbiddenState />;

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
    } catch {
      toast.error('Failed to generate API key');
    }
  };

  const handleRevoke = (key: ApiKey) => {
    confirm(
      'Revoke API Key',
      'Applications using this key will lose access immediately. This cannot be undone.',
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

  const handleCopyKey = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success('Key copied to clipboard');
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const apiKeys = keysData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Manage API keys for application authentication."
        actions={
          canCreate ? (
            <Button onClick={handleGenerateKey} loading={creatingKey} disabled={!selectedProject}>
              <Plus className="h-4 w-4" />
              Generate Key
            </Button>
          ) : undefined
        }
      />

      {/* Project Filter */}
      <Select
        id="project-filter"
        label="Filter by Project"
        placeholder="All Projects"
        options={[{ value: '', label: 'All Projects' }, ...projectOptions]}
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="max-w-xs"
      />

      {/* New Key Display */}
      {newKeyValue && (
        <div className="rounded-lg border border-success/50 bg-success/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-success">New API Key Generated</p>
            <Button variant="ghost" size="icon-sm" onClick={() => setNewKeyValue(null)}>
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 font-mono text-sm break-all select-all">{newKeyValue}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleCopyKey(newKeyValue)}>
              <Copy className="h-4 w-4" />
              Copy Key
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This is the only time the full key will be shown. Store it securely.
          </p>
        </div>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <EmptyState
          icon={<Key className="h-6 w-6" />}
          title="No API keys"
          description={
            selectedProject
              ? 'Generate an API key for this project.'
              : 'Select a project and generate an API key.'
          }
        />
      ) : (
        <div className="rounded-lg border">
          <div className="divide-y">
            {apiKeys.map((key: ApiKey) => (
              <div
                key={key.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Key className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{key.label}</p>
                      <p className="font-mono text-xs text-muted-foreground truncate">
                        mv_...{key.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Created {formatDate(key.createdAt)}</span>
                    {key.lastUsedAt && <span>Last used {formatRelativeTime(key.lastUsedAt)}</span>}
                  </div>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRevoke(key)}
                    className="text-destructive hover:text-destructive shrink-0"
                    aria-label="Revoke API key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel="Revoke"
      />
    </div>
  );
}
