import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/sidebar';
import { Header } from '@/components/navigation/header';
import { useAppSelector } from '@/redux/store';
import { cn } from '@/utils';
export function DashboardShell() {
    const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
    return (_jsxs("div", { className: "flex min-h-screen", children: [_jsx(Sidebar, {}), _jsxs("div", { className: cn('flex flex-1 flex-col transition-all duration-200', sidebarOpen ? 'ml-60' : 'ml-16'), children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-auto p-6", children: _jsx(Outlet, {}) })] })] }));
}
//# sourceMappingURL=dashboard-shell.js.map