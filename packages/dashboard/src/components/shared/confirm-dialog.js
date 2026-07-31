import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', loading = false, }) {
    return (_jsx(Modal, { open: open, onClose: onClose, size: "sm", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: `mb-4 rounded-full p-3 ${variant === 'destructive'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'}`, children: _jsx(AlertTriangle, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-lg font-semibold", children: title }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: message }), _jsxs("div", { className: "mt-6 flex gap-3 w-full", children: [_jsx(Button, { variant: "outline", className: "flex-1", onClick: onClose, disabled: loading, children: cancelLabel }), _jsx(Button, { variant: variant === 'destructive' ? 'destructive' : 'default', className: "flex-1", onClick: onConfirm, loading: loading, children: confirmLabel })] })] }) }));
}
//# sourceMappingURL=confirm-dialog.js.map