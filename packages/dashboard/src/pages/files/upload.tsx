import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useUploadFileMutation } from '@/services/files.service';
import { useGetProjectsQuery } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import {
  Select,
  Progress,
  Button,
  ForbiddenState,
  PageSpinner,
  PageSkeleton,
} from '@/components/ui';
import {
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatFileSize } from '@/utils';
import { usePermissions } from '@/hooks';
import type { SelectOption } from '@/components/ui';
import type { ApiError } from '@/types';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const canUpload = hasPermission('files.upload');

  const [projectId, setProjectId] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadFile] = useUploadFileMutation();

  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: !canUpload,
  });

  if (permissionsLoading) return <PageSpinner />;
  if (!canUpload) return <ForbiddenState />;

  const projectOptions: SelectOption[] =
    projectsData?.data.data.map((p) => ({ value: p.id, label: p.name })) ?? [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!projectId) {
        toast.error('Please select a project first');
        return;
      }

      const newUploads: UploadItem[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(2),
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      newUploads.forEach((item) => {
        uploadSingleFile(item);
      });
    },
    [projectId, visibility],
  );

  const uploadSingleFile = async (item: UploadItem) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, status: 'uploading' as const } : u)),
    );

    try {
      await uploadFile({
        file: item.file,
        projectId,
        visibility,
      }).unwrap();

      setUploads((prev) =>
        prev.map((u) =>
          u.id === item.id ? { ...u, status: 'success' as const, progress: 100 } : u,
        ),
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiError };
      setUploads((prev) =>
        prev.map((u) =>
          u.id === item.id
            ? {
                ...u,
                status: 'error' as const,
                error: apiErr.data?.error.message ?? 'Upload failed',
              }
            : u,
        ),
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  if (projectsLoading) return <PageSkeleton />;

  const pendingCount = uploads.filter(
    (u) => u.status === 'uploading' || u.status === 'pending',
  ).length;
  const successCount = uploads.filter((u) => u.status === 'success').length;
  const errorCount = uploads.filter((u) => u.status === 'error').length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => navigate('/files')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Files
      </button>

      <PageHeader
        title="Upload Files"
        description="Drag and drop files to upload to your MediaVault."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            <Settings className="mr-1.5 h-4 w-4" />
            Upload Rules
          </Button>
        }
      />

      {/* Project Selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="project"
          label="Project"
          placeholder="Select a project"
          options={projectOptions}
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
          }}
        />
        <Select
          id="visibility"
          label="Visibility"
          options={[
            { value: 'private', label: 'Private' },
            { value: 'public', label: 'Public' },
          ]}
          value={visibility}
          onChange={(e) => {
            setVisibility(e.target.value);
          }}
        />
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-4 rounded-full bg-muted p-3">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse · Max 100MB per file
        </p>
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {pendingCount} uploading
              </span>
            )}
            {successCount > 0 && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3" />
                {successCount} done
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" />
                {errorCount} failed
              </span>
            )}
          </div>

          <div className="space-y-2">
            {uploads.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.file.size)}
                    {item.error && <span className="ml-2 text-destructive">{item.error}</span>}
                  </p>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} size="sm" className="mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
