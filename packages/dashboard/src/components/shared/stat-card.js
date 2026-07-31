import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
export function StatCard({ title, value, description, icon: Icon, trend, trendValue, className, }) {
    return (_jsxs("div", { className: cn('rounded-lg border bg-card p-4', className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: title }), Icon && (_jsx("div", { className: "rounded-md bg-muted p-1.5", children: _jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }) }))] }), _jsx("p", { className: "mt-2 text-2xl font-bold", children: value }), (description ?? trendValue) && (_jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [trendValue && (_jsx("span", { className: cn('mr-1', trend === 'up' && 'text-success', trend === 'down' && 'text-destructive'), children: trendValue })), description] }))] }));
}
//# sourceMappingURL=stat-card.js.map