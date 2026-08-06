import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetFileQuery,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useGetSignedUrlMutation,
} from '@/services/files.service';
import { PageHeader } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
import {
  Button,
  Badge,
  PageSkeleton,
  ErrorState,
  ForbiddenState,
  PageSpinner,
} from '@/components/ui';
import { useConfirm, usePermissions } from '@/hooks';
import { formatFileSize, formatDateTime, getMimeCategory, isPreviewable } from '@/utils';
import { FileVisibility } from '@/types';
import {
  ArrowLeft,
  Download,
  Copy,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Link,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const mimeIconMap: Record<string, React.ElementType> = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  other: File,
};

export default function FileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const canView = hasPermission('files.view');
  const canDelete = hasPermission('files.delete');

  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetFileQuery(id!, { skip: !canView || !id });
  const [deleteFile, { isLoading: deleting }] = useDeleteFileMutation();
  const [updateFile, { isLoading: updatingVisibility }] = useUpdateFileMutation();
  const [getSignedUrl, { isLoading: generatingUrl }] = useGetSignedUrlMutation();

  if (permissionsLoading) return <PageSpinner />;
  if (!canView) return <ForbiddenState />;

  if (isLoading) return <PageSkeleton />;
  if (isError || !data?.data) return <ErrorState onRetry={refetch} />;

  const file = data.data;
  const category = getMimeCategory(file.mimeType);
  const IconComponent = mimeIconMap[category] ?? File;
  void IconComponent;
  const streamUrl = `/api/v1/files/${file.id}/stream`;
  const previewable = isPreviewable(file.mimeType);

  const handleDelete = () => {
    confirm(
      'Delete File',
      `Are you sure you want to delete "${file.originalFilename}"?`,
      async () => {
        try {
          await deleteFile(file.id).unwrap();
          toast.success('File deleted');
          navigate('/files');
        } catch {
          toast.error('Failed to delete file');
        }
      },
      'destructive',
    );
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
    } catch {
      toast.error('Failed to generate signed URL');
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility =
      file.visibility === 'public' ? FileVisibility.Private : FileVisibility.Public;
    try {
      await updateFile({ id: file.id, body: { visibility: newVisibility } }).unwrap();
      toast.success(`File is now ${newVisibility}`);
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate('/files')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Files
      </button>

      <PageHeader
        title={file.originalFilename}
        description={`${formatFileSize(file.size)} · ${file.mimeType}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            {canDelete && (
              <Button size="sm" variant="destructive" onClick={handleDelete} loading={deleting}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Preview */}
      {previewable && (
        <div className="overflow-hidden rounded-lg border bg-black/5 dark:bg-white/5">
          {category === 'image' && (
            <img
              src={streamUrl}
              alt={file.originalFilename}
              className="max-h-[60vh] w-full object-contain"
            />
          )}
          {category === 'video' && (
            <video controls className="max-h-[60vh] w-full" src={streamUrl} />
          )}
          {category === 'audio' && <audio controls className="w-full p-4" src={streamUrl} />}
          {file.mimeType === 'application/pdf' && (
            <iframe src={streamUrl} className="h-[60vh] w-full" title={file.originalFilename} />
          )}
        </div>
      )}

      {/* File Info */}
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">File Information</h3>
        </div>
        <dl className="divide-y">
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:px-6">
            <dt className="text-muted-foreground">Filename</dt>
            <dd className="font-medium break-all">{file.filename}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:px-6">
            <dt className="text-muted-foreground">Original Name</dt>
            <dd className="font-medium break-all">{file.originalFilename}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:px-6">
            <dt className="text-muted-foreground">MIME Type</dt>
            <dd className="font-medium break-all">{file.mimeType}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:px-6">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-medium">{formatFileSize(file.size)}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:px-6">
            <dt className="text-muted-foreground">Extension</dt>
            <dd className="font-medium uppercase">{file.extension}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between sm:px-6">
            <dt className="text-muted-foreground">Visibility</dt>
            <dd className="flex items-center gap-2">
              <Badge variant={file.visibility === 'public' ? 'success' : 'secondary'}>
                {file.visibility}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleVisibility}
                loading={updatingVisibility}
                title={`Make ${file.visibility === 'public' ? 'private' : 'public'}`}
              >
                {file.visibility === 'public' ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-3 3m0 0l6.364-6.364M9.88 9.88L3 3"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </Button>
            </dd>
          </div>
          <div className="flex justify-between px-6 py-3 text-sm">
            <dt className="text-muted-foreground">Hash</dt>
            <dd className="font-mono text-xs max-w-[200px] truncate">{file.hash}</dd>
          </div>
          <div className="flex justify-between px-6 py-3 text-sm">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDateTime(file.createdAt)}</dd>
          </div>
          <div className="flex justify-between px-6 py-3 text-sm">
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatDateTime(file.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyUrl}>
          <Copy className="h-4 w-4" />
          Copy Stream URL
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateSignedUrl}
          loading={generatingUrl}
        >
          <Link className="h-4 w-4" />
          Generate Signed URL
        </Button>
      </div>

      {signedUrl && (
        <div className="rounded-lg border border-success/50 bg-success/5 p-4">
          <p className="text-sm font-medium text-success">Signed URL generated</p>
          <p className="mt-1 font-mono text-xs break-all">{signedUrl}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Expires in 1 hour. Already copied to clipboard.
          </p>
        </div>
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
