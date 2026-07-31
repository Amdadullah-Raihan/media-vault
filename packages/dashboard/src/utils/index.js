import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}
export function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
export function formatDateTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
export function formatRelativeTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffSecs < 60)
        return 'just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return formatDate(date);
}
export function getMimeCategory(mimeType) {
    const category = mimeType.split('/')[0];
    const valid = ['image', 'video', 'audio', 'text', 'application'];
    if (valid.includes(category ?? ''))
        return category ?? 'other';
    if (category === 'application') {
        const sub = mimeType.split('/')[1];
        if (sub?.includes('pdf'))
            return 'document';
        if (sub?.includes('zip') || sub?.includes('rar') || sub?.includes('tar'))
            return 'archive';
        return 'document';
    }
    return 'other';
}
export function isPreviewable(mimeType) {
    const previewable = [
        'image/',
        'video/',
        'audio/',
        'application/pdf',
        'text/',
        'application/json',
    ];
    return previewable.some((p) => mimeType.startsWith(p));
}
export function getFileExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() ?? '';
}
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}
export function generateId() {
    return Math.random().toString(36).substring(2, 9);
}
//# sourceMappingURL=index.js.map