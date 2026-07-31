import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils';
const Textarea = forwardRef(({ className, error, label, id, ...props }, ref) => {
    return (_jsxs("div", { className: "space-y-1.5", children: [label && (_jsx("label", { htmlFor: id, className: "text-sm font-medium leading-none", children: label })), _jsx("textarea", { id: id, className: cn('flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors', 'placeholder:text-muted-foreground', 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', 'disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive focus-visible:ring-destructive', className), ref: ref, ...props }), error && _jsx("p", { className: "text-sm text-destructive", children: error })] }));
});
Textarea.displayName = 'Textarea';
export { Textarea };
//# sourceMappingURL=textarea.js.map