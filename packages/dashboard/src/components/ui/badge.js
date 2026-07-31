import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils';
const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-border text-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
};
export function Badge({ children, variant = 'default', className }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors', variantClasses[variant], className), children: children }));
}
//# sourceMappingURL=badge.js.map