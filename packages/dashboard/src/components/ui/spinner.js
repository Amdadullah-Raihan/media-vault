import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';
const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};
export function Spinner({ size = 'md', className }) {
    return (_jsx(Loader2, { className: cn('animate-spin text-muted-foreground', sizeClasses[size], className) }));
}
export function PageSpinner() {
    return (_jsx("div", { className: "flex h-[50vh] items-center justify-center", children: _jsx(Spinner, { size: "lg" }) }));
}
//# sourceMappingURL=spinner.js.map