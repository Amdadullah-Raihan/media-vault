import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import { useState, useRef, useEffect } from 'react';
export function DropdownMenu({ trigger, children, align = 'start', className }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { ref: ref, className: "relative inline-block", children: [_jsx("div", { onClick: () => setOpen(!open), className: "cursor-pointer", children: trigger }), open && (_jsx("div", { className: cn('absolute z-50 mt-1 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-slide-up dark:bg-gray-900 dark:text-gray-100', align === 'end' ? 'right-0' : 'left-0', className), children: children }))] }));
}
export function DropdownItem({ children, onClick, destructive = false, disabled = false, className, }) {
    return (_jsx("button", { className: cn('relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-popover-foreground', 'hover:bg-accent hover:text-accent-foreground', 'data-[disabled]:pointer-events-none data-[disabled]:opacity-50', destructive && 'text-destructive hover:bg-destructive/10 hover:text-destructive', className), onClick: onClick, disabled: disabled, children: children }));
}
export function DropdownSeparator({ className }) {
    return _jsx("div", { className: cn('my-1 h-px bg-border', className) });
}
//# sourceMappingURL=dropdown-menu.js.map