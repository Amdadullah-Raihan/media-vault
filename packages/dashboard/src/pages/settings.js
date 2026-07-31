import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useChangePasswordMutation } from '@/services/auth.service';
import { useGetSettingsQuery } from '@/services/settings.service';
import { useGetUploadRulesQuery, useUpdateCategoryMutation, useUpdateExtensionMutation, } from '@/services/upload-rules.service';
import { PageHeader } from '@/components/shared';
import { Button, Input, PageSkeleton, ErrorState, Badge } from '@/components/ui';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setTheme } from '@/redux/slices/ui.slice';
import { Select } from '@/components/ui';
import toast from 'react-hot-toast';
import { Settings, Lock, Palette, Shield, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, } from 'lucide-react';
const passwordSchema = z
    .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
const SIZE_UNITS = ['KB', 'MB', 'GB'];
function bytesToUnit(bytes) {
    if (bytes >= 1024 * 1024 * 1024)
        return { value: +(bytes / (1024 * 1024 * 1024)).toFixed(1), unit: 'GB' };
    if (bytes >= 1024 * 1024)
        return { value: +(bytes / (1024 * 1024)).toFixed(1), unit: 'MB' };
    return { value: +(bytes / 1024).toFixed(1), unit: 'KB' };
}
function unitToBytes(value, unit) {
    if (unit === 'GB')
        return value * 1024 * 1024 * 1024;
    if (unit === 'MB')
        return value * 1024 * 1024;
    return value * 1024;
}
export default function SettingsPage() {
    const theme = useAppSelector((s) => s.ui.theme);
    const dispatch = useAppDispatch();
    const { data: settingsData, isLoading, isError, refetch } = useGetSettingsQuery();
    const [changePassword, { isLoading: changing }] = useChangePasswordMutation();
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(passwordSchema),
    });
    const onPasswordSubmit = async (data) => {
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }).unwrap();
            toast.success('Password changed successfully');
            reset();
        }
        catch (err) {
            const apiErr = err;
            toast.error(apiErr.data?.message ?? 'Failed to change password');
        }
    };
    if (isLoading)
        return _jsx(PageSkeleton, {});
    if (isError)
        return _jsx(ErrorState, { onRetry: refetch });
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-8", children: [_jsx(PageHeader, { title: "Settings", description: "Manage your MediaVault configuration." }), _jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5 text-muted-foreground" }), _jsx("h3", { className: "font-semibold", children: "General" })] }) }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Admin Username" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: settingsData?.data.adminUsername ?? 'admin' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: "Storage Driver" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Local File System" })] })] })] }), _jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Palette, { className: "h-5 w-5 text-muted-foreground" }), _jsx("h3", { className: "font-semibold", children: "Appearance" })] }) }), _jsx("div", { className: "p-6", children: _jsx(Select, { id: "theme", label: "Theme", options: [
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'system', label: 'System' },
                            ], value: theme, onChange: (e) => dispatch(setTheme(e.target.value)) }) })] }), _jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lock, { className: "h-5 w-5 text-muted-foreground" }), _jsx("h3", { className: "font-semibold", children: "Change Password" })] }) }), _jsxs("div", { className: "p-6", children: [_jsxs("p", { className: "mb-4 text-sm text-muted-foreground", children: ["Initial credentials come from", ' ', _jsx("code", { className: "rounded bg-muted px-1 py-0.5 text-xs", children: ".env" }), ". Changes made here persist in the database and survive restarts."] }), _jsxs("form", { onSubmit: handleSubmit(onPasswordSubmit), className: "space-y-4", children: [_jsx(Input, { id: "currentPassword", label: "Current Password", type: "password", autoComplete: "current-password", placeholder: "Enter current password", error: errors.currentPassword?.message, ...register('currentPassword') }), _jsx(Input, { id: "newPassword", label: "New Password", type: "password", autoComplete: "new-password", placeholder: "Enter new password", error: errors.newPassword?.message, ...register('newPassword') }), _jsx(Input, { id: "confirmPassword", label: "Confirm New Password", type: "password", autoComplete: "new-password", placeholder: "Confirm new password", error: errors.confirmPassword?.message, ...register('confirmPassword') }), _jsx(Button, { type: "submit", loading: changing, children: "Update Password" })] })] })] }), _jsx(UploadRulesSection, {})] }));
}
// ---------------------------------------------------------------------------
// Upload Rules (inline section)
// ---------------------------------------------------------------------------
function UploadRulesSection() {
    const { data, isLoading, isError, refetch } = useGetUploadRulesQuery();
    const [updateCategory] = useUpdateCategoryMutation();
    const [updateExtension] = useUpdateExtensionMutation();
    const [expanded, setExpanded] = useState({});
    if (isLoading) {
        return (_jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-muted-foreground" }), _jsx("h3", { className: "font-semibold", children: "Upload Rules" })] }) }), _jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Loading..." })] }));
    }
    if (isError) {
        return (_jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-muted-foreground" }), _jsx("h3", { className: "font-semibold", children: "Upload Rules" })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Failed to load upload rules." }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                void refetch();
                            }, children: "Retry" })] })] }));
    }
    const categories = data?.categories ?? [];
    const toggleExpand = (cat) => {
        setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };
    const handleCategoryToggle = async (cat) => {
        try {
            await updateCategory({ category: cat.category, enabled: !cat.enabled }).unwrap();
            toast.success(`${cat.label} ${cat.enabled ? 'disabled' : 'enabled'}`);
        }
        catch {
            toast.error('Failed to update category');
        }
    };
    const handleCategorySize = async (cat, valueStr, unit) => {
        const value = Number(valueStr);
        if (Number.isNaN(value) || value <= 0)
            return;
        try {
            await updateCategory({ category: cat.category, maxSize: unitToBytes(value, unit) }).unwrap();
            toast.success(`${cat.label} limit updated`);
        }
        catch {
            toast.error('Failed to update size limit');
        }
    };
    const handleExtensionToggle = async (cat, ext) => {
        try {
            await updateExtension({
                category: cat.category,
                extension: ext.extension,
                enabled: !ext.enabled,
            }).unwrap();
            toast.success(`.${ext.extension} ${ext.enabled ? 'disabled' : 'enabled'}`);
        }
        catch {
            toast.error('Failed to update extension');
        }
    };
    const handleExtensionSize = async (cat, ext, valueStr, unit) => {
        const value = Number(valueStr);
        if (Number.isNaN(value) || value <= 0)
            return;
        try {
            await updateExtension({
                category: cat.category,
                extension: ext.extension,
                maxSize: unitToBytes(value, unit),
            }).unwrap();
            toast.success(`.${ext.extension} override updated`);
        }
        catch {
            toast.error('Failed to update override');
        }
    };
    const handleExtensionReset = async (cat, ext) => {
        try {
            await updateExtension({
                category: cat.category,
                extension: ext.extension,
                maxSize: null,
            }).unwrap();
            toast.success(`.${ext.extension} reset to default`);
        }
        catch {
            toast.error('Failed to reset');
        }
    };
    return (_jsxs("div", { className: "rounded-lg border", children: [_jsx("div", { className: "border-b px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-muted-foreground" }), _jsx("h3", { className: "font-semibold", children: "Upload Rules" })] }) }), _jsx("div", { className: "divide-y", children: categories.map((cat) => {
                    const isOpen = expanded[cat.category] ?? false;
                    const catSize = bytesToUnit(cat.maxSize);
                    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 px-4 py-2.5 sm:flex-nowrap", children: [_jsxs("button", { onClick: () => {
                                            toggleExpand(cat.category);
                                        }, className: "flex items-center gap-1.5 text-muted-foreground hover:text-foreground shrink-0", "aria-label": isOpen ? 'Collapse' : 'Expand', children: [isOpen ? (_jsx(ChevronDown, { className: "h-4 w-4" })) : (_jsx(ChevronRight, { className: "h-4 w-4" })), _jsx("span", { className: "text-sm font-medium", children: cat.label })] }), _jsxs("div", { className: "flex items-center gap-1.5 ml-auto shrink-0", children: [_jsx("input", { type: "number", className: "h-7 w-14 rounded border border-input bg-background px-1.5 text-xs text-foreground", defaultValue: String(catSize.value), min: 0, onBlur: (e) => {
                                                    const unit = e.target.nextSibling
                                                        .value;
                                                    handleCategorySize(cat, e.target.value, unit || 'MB');
                                                }, "aria-label": `${cat.label} max size` }), _jsx("select", { className: "h-7 rounded border border-input bg-background px-1 text-xs text-foreground", defaultValue: catSize.unit, onChange: (e) => {
                                                    const input = e.target.previousSibling;
                                                    handleCategorySize(cat, input.value, e.target.value);
                                                }, "aria-label": "Size unit", children: SIZE_UNITS.map((u) => (_jsx("option", { value: u, children: u }, u))) }), _jsx("button", { onClick: () => {
                                                    handleCategoryToggle(cat);
                                                }, className: "text-muted-foreground hover:text-foreground", "aria-label": cat.enabled ? 'Disable' : 'Enable', children: cat.enabled ? (_jsx(ToggleRight, { className: "h-5 w-5 text-primary" })) : (_jsx(ToggleLeft, { className: "h-5 w-5" })) })] })] }), isOpen && (_jsx("div", { className: "border-t bg-muted/30 divide-y", children: cat.extensions.map((ext) => {
                                    const effectiveSize = ext.maxSize ?? cat.maxSize;
                                    const extSize = bytesToUnit(effectiveSize);
                                    return (_jsxs("div", { className: "flex flex-wrap items-center gap-2 px-6 py-1.5 text-sm sm:flex-nowrap", children: [_jsxs(Badge, { variant: ext.maxSize !== null ? 'default' : 'secondary', className: "text-xs shrink-0", children: [".", ext.extension] }), _jsxs("div", { className: "flex items-center gap-1 ml-auto shrink-0", children: [ext.maxSize !== null && (_jsx("button", { onClick: () => {
                                                            handleExtensionReset(cat, ext);
                                                        }, className: "text-xs text-muted-foreground hover:text-foreground mr-1", title: "Reset to category default", children: "reset" })), _jsx("input", { type: "number", className: "h-6 w-12 rounded border border-input bg-background px-1 text-xs text-foreground", defaultValue: String(extSize.value), min: 0, onBlur: (e) => {
                                                            const unit = e.target.nextSibling
                                                                .value;
                                                            handleExtensionSize(cat, ext, e.target.value, unit || 'MB');
                                                        }, "aria-label": `${ext.extension} max size` }), _jsx("select", { className: "h-6 rounded border border-input bg-background px-1 text-xs text-foreground", defaultValue: extSize.unit, onChange: (e) => {
                                                            const input = e.target.previousSibling;
                                                            handleExtensionSize(cat, ext, input.value, e.target.value);
                                                        }, "aria-label": "Size unit", children: SIZE_UNITS.map((u) => (_jsx("option", { value: u, children: u }, u))) }), _jsx("button", { onClick: () => {
                                                            handleExtensionToggle(cat, ext);
                                                        }, className: "text-muted-foreground hover:text-foreground", "aria-label": ext.enabled ? 'Disable' : 'Enable', children: ext.enabled ? (_jsx(ToggleRight, { className: "h-4 w-4 text-primary" })) : (_jsx(ToggleLeft, { className: "h-4 w-4" })) })] })] }, ext.extension));
                                }) }))] }, cat.category));
                }) })] }));
}
//# sourceMappingURL=settings.js.map