import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useGetSessionQuery } from '@/services/auth.service';
import { PageSpinner } from '@/components/ui';
export function AuthGuard() {
    const { data, isLoading, isError } = useGetSessionQuery();
    if (isLoading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsx(PageSpinner, {}) }));
    }
    if (isError || !data?.success) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(Outlet, {});
}
export function GuestGuard() {
    const { data, isLoading } = useGetSessionQuery();
    if (isLoading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsx(PageSpinner, {}) }));
    }
    if (data?.success) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(Outlet, {});
}
//# sourceMappingURL=guards.js.map