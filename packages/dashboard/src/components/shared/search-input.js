import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui';
import { Search, X } from 'lucide-react';
import { DEBOUNCE_MS } from '@/constants';
export function SearchInput({ placeholder = 'Search...', value, onChange, className, }) {
    const [localValue, setLocalValue] = useState(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedOnChange = useCallback(debounce((val) => onChange(val), DEBOUNCE_MS), [onChange]);
    useEffect(() => {
        setLocalValue(value);
    }, [value]);
    const handleChange = (e) => {
        const val = e.target.value;
        setLocalValue(val);
        debouncedOnChange(val);
    };
    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };
    return (_jsx("div", { className: className, children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { value: localValue, onChange: handleChange, placeholder: placeholder, className: "pl-9 pr-8" }), localValue && (_jsx("button", { onClick: handleClear, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": "Clear search", children: _jsx(X, { className: "h-4 w-4" }) }))] }) }));
}
function debounce(fn, delay) {
    let timeoutId;
    return ((...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    });
}
//# sourceMappingURL=search-input.js.map