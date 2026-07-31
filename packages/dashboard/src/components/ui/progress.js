import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};
const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
};
export function Progress({ value, max = 100, size = 'md', variant = 'default', showLabel = false, className, }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (_jsxs("div", { className: cn('space-y-1', className), children: [_jsx("div", { role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, className: cn('w-full overflow-hidden rounded-full bg-muted', sizeClasses[size]), children: _jsx("div", { className: cn('h-full rounded-full transition-all duration-300', variantClasses[variant]), style: { width: `${percentage}%` } }) }), showLabel && _jsxs("p", { className: "text-xs text-muted-foreground", children: [Math.round(percentage), "%"] })] }));
}
//# sourceMappingURL=progress.js.map