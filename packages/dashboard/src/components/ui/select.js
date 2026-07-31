import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
const Select = forwardRef(({ className, options, error, label, id, placeholder, ...props }, ref) => {
    return (_jsxs("div", { className: "space-y-1.5", children: [label && (_jsx("label", { htmlFor: id, className: "text-sm font-medium leading-none", children: label })), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: id, className: cn('flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors', 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', 'disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive focus-visible:ring-destructive', className), ref: ref, ...props, children: [placeholder && (_jsx("option", { value: "", disabled: true, children: placeholder })), options.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] }), _jsx(ChevronDown, { className: "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" })] }), error && _jsx("p", { className: "text-sm text-destructive", children: error })] }));
});
Select.displayName = 'Select';
export { Select };
//# sourceMappingURL=select.js.map