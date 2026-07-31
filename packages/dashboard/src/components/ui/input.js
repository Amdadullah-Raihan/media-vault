import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils';
const Input = forwardRef(({ className, type, error, label, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    return (_jsxs("div", { className: "space-y-1.5", children: [label && (_jsx("label", { htmlFor: id, className: "text-sm font-medium leading-none", children: label })), _jsxs("div", { className: "relative", children: [_jsx("input", { type: isPassword && visible ? 'text' : type, id: id, className: cn('flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors', 'file:border-0 file:bg-transparent file:text-sm file:font-medium', 'placeholder:text-muted-foreground', 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', 'disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive focus-visible:ring-destructive', isPassword && 'pr-10', className), ref: ref, ...props }), isPassword && (_jsx("button", { type: "button", onClick: () => {
                            setVisible(!visible);
                        }, className: cn('absolute inset-y-0 right-0 flex w-9 items-center justify-center', 'text-muted-foreground hover:text-foreground transition-colors'), "aria-label": visible ? 'Hide password' : 'Show password', tabIndex: -1, children: visible ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) }))] }), error && _jsx("p", { className: "text-sm text-destructive", children: error })] }));
});
Input.displayName = 'Input';
export { Input };
//# sourceMappingURL=input.js.map