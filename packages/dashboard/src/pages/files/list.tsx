import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFilesQuery, useDeleteFileMutation } from '@/services/files.service';
import { PageHeader } from '@/components/shared';
import { SearchInput } from '@/components/shared';
import { Pagination } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared';
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
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setViewMode } from '@/redux/slices/ui.slice';
import { formatFileSize, formatRelativeTime, getMimeCategory } from '@/utils';
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  Eye,
  Grid3X3,
  List,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { FileMetadata } from '@/types';

const mimeIconMap: Record<string, React.ElementType> = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  other: File,
};

function FileThumbnail({ file, size }: { file: FileMetadata; size?: 'sm' | 'lg' }) {
  const category = getMimeCategory(file.mimeType);
  const streamUrl = `/api/v1/files/${file.id}/stream`;

  if (category === 'image') {
    const dims = size === 'lg' ? 'aspect-video w-full' : 'h-8 w-8';
    return (
      <img
        src={streamUrl}
        alt={file.originalFilename}
        className={`${dims} object-cover ${size === 'lg' ? 'rounded-t-lg' : 'rounded'}`}
        loading="lazy"
      />
    );
  }

  const IconComp = mimeIconMap[category] ?? File;
  const iconDims = size === 'lg' ? 'h-10 w-10' : 'h-4 w-4';
  const bg =
    size === 'lg'
      ? 'flex aspect-video w-full items-center justify-center rounded-t-lg bg-muted'
      : '';

  if (size === 'lg') {
    return (
      <div className={bg}>
        <IconComp className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return <IconComp className={`${iconDims} text-muted-foreground shrink-0`} />;
}

export default function FilesPage() {
  const navigate = useNavigate();
  const viewMode = useAppSelector((s) => s.ui.viewMode);
  const dispatch = useAppDispatch();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const canView = hasPermission('files.view');
  const canUpload = hasPermission('files.upload');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useGetFilesQuery(
    { page, limit: 24, search },
    { skip: !canView },
  );
  const [deleteFile, { isLoading: deleting }] = useDeleteFileMutation();
  const { confirm, confirmState, handleConfirm, handleClose } = useConfirm();
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);

  if (permissionsLoading) return <PageSpinner />;
  if (!canView) return <ForbiddenState />;

  const files = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 1;

  const handleDelete = (file: FileMetadata) => {
    confirm(
      'Delete File',
      `Are you sure you want to delete "${file.originalFilename}"? This is irreversible.`,
      async () => {
        try {
          await deleteFile(file.id).unwrap();
          toast.success('File deleted');
        } catch {
          toast.error('Failed to delete file');
        }
      },
      'destructive',
    );
  };

  const handleCopyUrl = (file: FileMetadata) => {
    const url = `${window.location.origin}/api/v1/files/${file.id}/stream`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleDownload = (file: FileMetadata) => {
    window.open(`/api/v1/files/${file.id}/download`, '_blank');
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Files"
        description="Browse and manage your uploaded files."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border shrink-0">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => dispatch(setViewMode('grid'))}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => dispatch(setViewMode('table'))}
                aria-label="Table view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            {canUpload && (
              <Button onClick={() => navigate('/upload')}>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            )}
          </div>
        }
      />

      <SearchInput
        placeholder="Search files..."
        value={search}
        onChange={setSearch}
        className="w-full max-w-sm"
      />

      {files.length === 0 ? (
        <EmptyState
          icon={<File className="h-6 w-6" />}
          title="No files found"
          description={search ? 'No files match your search.' : 'Upload files to get started.'}
          action={
            !search ? { label: 'Upload Files', onClick: () => navigate('/upload') } : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <FileGrid
          files={files}
          onDelete={handleDelete}
          onCopyUrl={handleCopyUrl}
          onDownload={handleDownload}
          onView={(f) => navigate(`/files/${f.id}`)}
        />
      ) : (
        <FileTable
          files={files}
          onDelete={handleDelete}
          onCopyUrl={handleCopyUrl}
          onDownload={handleDownload}
          onView={(f) => navigate(`/files/${f.id}`)}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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

      {/* Preview Modal */}
      {selectedFile && (
        <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// File Grid
// ---------------------------------------------------------------------------

function FileGrid({
  files,
  onDelete,
  onCopyUrl,
  onDownload,
  onView,
}: {
  files: FileMetadata[];
  onDelete: (f: FileMetadata) => void;
  onCopyUrl: (f: FileMetadata) => void;
  onDownload: (f: FileMetadata) => void;
  onView: (f: FileMetadata) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 min-w-0">
      {files.map((file) => {
        return (
          <div
            key={file.id}
            className="group rounded-lg border bg-card transition-colors hover:border-primary/50 min-w-0"
          >
            <FileThumbnail file={file} size="lg" />
            <div className="p-4">
              <div className="flex justify-end">
                <DropdownMenu
                  trigger={
                    <button
                      className="rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 md:opacity-0"
                      aria-label="File actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  }
                  align="end"
                >
                  <DropdownItem onClick={() => onView(file)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownItem>
                  <DropdownItem onClick={() => onDownload(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownItem>
                  <DropdownItem onClick={() => onCopyUrl(file)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => onDelete(file)} destructive>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </div>
              <p className="mt-3 truncate text-sm font-medium" title={file.originalFilename}>
                {file.originalFilename}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {file.extension.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatRelativeTime(file.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// File Table
// ---------------------------------------------------------------------------

function FileTable({
  files,
  onDelete,
  onCopyUrl,
  onDownload,
  onView,
}: {
  files: FileMetadata[];
  onDelete: (f: FileMetadata) => void;
  onCopyUrl: (f: FileMetadata) => void;
  onDownload: (f: FileMetadata) => void;
  onView: (f: FileMetadata) => void;
}) {
  return (
    <div className="rounded-lg border min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Type</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Size</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {files.map((file) => {
              return (
                <tr key={file.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileThumbnail file={file} size="sm" />
                      <span className="truncate font-medium max-w-[200px]">
                        {file.originalFilename}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {file.mimeType}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatRelativeTime(file.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onView(file)}
                        aria-label="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDownload(file)}
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="More actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        align="end"
                      >
                        <DropdownItem onClick={() => onCopyUrl(file)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem onClick={() => onDelete(file)} destructive>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File Preview Modal
// ---------------------------------------------------------------------------

function FilePreviewModal({ file, onClose }: { file: FileMetadata; onClose: () => void }) {
  const category = getMimeCategory(file.mimeType);
  const streamUrl = `/api/v1/files/${file.id}/stream`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl overflow-hidden rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-semibold truncate mr-2">{file.originalFilename}</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 sm:p-6 overflow-auto max-h-[calc(90vh-3.5rem)]">
          {category === 'image' && (
            <img
              src={streamUrl}
              alt={file.originalFilename}
              className="max-h-[70vh] w-full rounded object-contain"
            />
          )}
          {category === 'video' && (
            <video controls className="max-h-[70vh] w-full rounded" src={streamUrl}>
              Your browser does not support video playback.
            </video>
          )}
          {category === 'audio' && (
            <audio controls className="w-full" src={streamUrl}>
              Your browser does not support audio playback.
            </audio>
          )}
          {category === 'document' && file.mimeType === 'application/pdf' && (
            <iframe
              src={streamUrl}
              className="h-[70vh] w-full rounded"
              title={file.originalFilename}
            />
          )}
          {!['image', 'video', 'audio'].includes(category) &&
            file.mimeType !== 'application/pdf' && (
              <div className="space-y-3 py-8 text-center">
                <File className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Preview not available for this file type.</p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-center gap-2">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd>{file.mimeType}</dd>
                  </div>
                  <div className="flex justify-center gap-2">
                    <dt className="text-muted-foreground">Size:</dt>
                    <dd>{formatFileSize(file.size)}</dd>
                  </div>
                </dl>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
