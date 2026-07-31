import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils';
import { X } from 'lucide-react';
import { Button } from './button';
const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};
const Modal = forwardRef(({ open, onClose, title, description, children, className, size = 'md' }, ref) => {
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, "aria-describedby": description ? 'modal-description' : undefined, className: cn('relative z-50 w-full animate-slide-up rounded-lg border bg-background p-6 shadow-lg', sizeClasses[size], className), children: [(title || description) && (_jsxs("div", { className: "mb-4 flex items-start justify-between", children: [_jsxs("div", { children: [title && (_jsx("h2", { id: "modal-title", className: "text-lg font-semibold", children: title })), description && (_jsx("p", { id: "modal-description", className: "text-sm text-muted-foreground mt-1", children: description }))] }), _jsx(Button, { variant: "ghost", size: "icon-sm", onClick: onClose, "aria-label": "Close", children: _jsx(X, { className: "h-4 w-4" }) })] })), children] })] }));
});
Modal.displayName = 'Modal';
export { Modal };
//# sourceMappingURL=modal.js.map