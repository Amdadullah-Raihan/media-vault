import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
export function Skeleton({ className }) {
    return _jsx("div", { className: cn('animate-pulse rounded-md bg-muted', className) });
}
export function CardSkeleton() {
    return (_jsxs("div", { className: "rounded-lg border bg-card p-4 space-y-3", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-3 w-1/2" }), _jsx(Skeleton, { className: "h-20 w-full" })] }));
}
export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "flex gap-4", children: Array.from({ length: cols }).map((_, i) => (_jsx(Skeleton, { className: "h-8 flex-1" }, `h-${i}`))) }), Array.from({ length: rows }).map((_, r) => (_jsx("div", { className: "flex gap-4", children: Array.from({ length: cols }).map((_, c) => (_jsx(Skeleton, { className: "h-6 flex-1" }, `${r}-${c}`))) }, r)))] }));
}
export function StatCardSkeleton() {
    return (_jsxs("div", { className: "rounded-lg border bg-card p-4 space-y-3", children: [_jsx(Skeleton, { className: "h-3 w-24" }), _jsx(Skeleton, { className: "h-8 w-16" })] }));
}
export function PageSkeleton() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Skeleton, { className: "h-8 w-48" }), _jsx(Skeleton, { className: "h-9 w-24" })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: Array.from({ length: 4 }).map((_, i) => (_jsx(StatCardSkeleton, {}, i))) }), _jsx(TableSkeleton, {})] }));
}
//# sourceMappingURL=skeleton.js.map