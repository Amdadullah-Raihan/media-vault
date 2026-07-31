import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from './button';
export function EmptyState({ icon, title, description, action, className }) {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center rounded-lg border border-dashed px-8 py-16 text-center', className), children: [_jsx("div", { className: "mb-4 rounded-full bg-muted p-3 text-muted-foreground", children: icon ?? _jsx(Inbox, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-lg font-semibold", children: title }), description && _jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: description }), action && (_jsx(Button, { className: "mt-4", onClick: action.onClick, children: action.label }))] }));
}
export function ErrorState({ title = 'Something went wrong', message = 'An unexpected error occurred. Please try again.', onRetry, className, }) {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5 px-8 py-16 text-center', className), children: [_jsx("div", { className: "mb-4 rounded-full bg-destructive/10 p-3 text-destructive", children: _jsx(AlertCircle, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-lg font-semibold", children: title }), _jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: message }), onRetry && (_jsx(Button, { variant: "outline", className: "mt-4", onClick: onRetry, children: "Try again" }))] }));
}
//# sourceMappingURL=empty-state.js.map