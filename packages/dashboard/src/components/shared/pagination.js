import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Button } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export function Pagination({ page, totalPages, onPageChange, className }) {
    if (totalPages <= 1)
        return null;
    const pages = getPageNumbers(page, totalPages);
    return (_jsxs("nav", { role: "navigation", "aria-label": "Pagination", className: cn('flex items-center justify-center gap-1', className), children: [_jsx(Button, { variant: "outline", size: "icon-sm", onClick: () => onPageChange(page - 1), disabled: page <= 1, "aria-label": "Previous page", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), pages.map((p, i) => p === '...' ? (_jsx("span", { className: "px-2 text-sm text-muted-foreground", children: "..." }, `dots-${i}`)) : (_jsx(Button, { variant: p === page ? 'default' : 'outline', size: "icon-sm", onClick: () => onPageChange(p), "aria-current": p === page ? 'page' : undefined, "aria-label": `Page ${p}`, children: p }, p))), _jsx(Button, { variant: "outline", size: "icon-sm", onClick: () => onPageChange(page + 1), disabled: page >= totalPages, "aria-label": "Next page", children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] }));
}
function getPageNumbers(current, total) {
    if (total <= 7)
        return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3)
        pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    if (current < total - 2)
        pages.push('...');
    pages.push(total);
    return pages;
}
//# sourceMappingURL=pagination.js.map