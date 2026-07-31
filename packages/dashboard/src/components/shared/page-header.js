import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
export function PageHeader({ title, description, actions, className }) {
    return (_jsxs("div", { className: cn('flex items-start justify-between', className), children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: title }), description && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] }));
}
export function SectionHeader({ title, description, actions, className }) {
    return (_jsxs("div", { className: cn('flex items-center justify-between', className), children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold", children: title }), description && _jsx("p", { className: "text-sm text-muted-foreground", children: description })] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] }));
}
//# sourceMappingURL=page-header.js.map