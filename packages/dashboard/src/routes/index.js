import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthGuard, GuestGuard } from './guards';
import { PageSpinner } from '@/components/ui';
// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/login'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ProjectsListPage = lazy(() => import('@/pages/projects/list'));
const ProjectCreatePage = lazy(() => import('@/pages/projects/create'));
const ProjectDetailPage = lazy(() => import('@/pages/projects/detail'));
const FilesPage = lazy(() => import('@/pages/files/list'));
const UploadPage = lazy(() => import('@/pages/files/upload'));
const FileDetailPage = lazy(() => import('@/pages/files/detail'));
const ApiKeysPage = lazy(() => import('@/pages/api-keys/list'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const LogsPage = lazy(() => import('@/pages/logs'));
const UsersListPage = lazy(() => import('@/pages/users/list'));
const UserCreatePage = lazy(() => import('@/pages/users/create'));
const RolesListPage = lazy(() => import('@/pages/roles/list'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));
function LazyPage({ children }) {
    return _jsx(Suspense, { fallback: _jsx(PageSpinner, {}), children: children });
}
export const router = createBrowserRouter([
    {
        element: _jsx(GuestGuard, {}),
        children: [
            {
                path: '/login',
                element: (_jsx(LazyPage, { children: _jsx(LoginPage, {}) })),
            },
        ],
    },
    {
        element: _jsx(AuthGuard, {}),
        children: [
            {
                element: _jsx(DashboardShell, {}),
                children: [
                    {
                        index: true,
                        element: (_jsx(LazyPage, { children: _jsx(DashboardPage, {}) })),
                    },
                    {
                        path: 'projects',
                        element: (_jsx(LazyPage, { children: _jsx(ProjectsListPage, {}) })),
                    },
                    {
                        path: 'projects/new',
                        element: (_jsx(LazyPage, { children: _jsx(ProjectCreatePage, {}) })),
                    },
                    {
                        path: 'projects/:id',
                        element: (_jsx(LazyPage, { children: _jsx(ProjectDetailPage, {}) })),
                    },
                    {
                        path: 'files',
                        element: (_jsx(LazyPage, { children: _jsx(FilesPage, {}) })),
                    },
                    {
                        path: 'files/:id',
                        element: (_jsx(LazyPage, { children: _jsx(FileDetailPage, {}) })),
                    },
                    {
                        path: 'upload',
                        element: (_jsx(LazyPage, { children: _jsx(UploadPage, {}) })),
                    },
                    {
                        path: 'api-keys',
                        element: (_jsx(LazyPage, { children: _jsx(ApiKeysPage, {}) })),
                    },
                    {
                        path: 'settings',
                        element: (_jsx(LazyPage, { children: _jsx(SettingsPage, {}) })),
                    },
                    {
                        path: 'logs',
                        element: (_jsx(LazyPage, { children: _jsx(LogsPage, {}) })),
                    },
                    {
                        path: 'users',
                        element: (_jsx(LazyPage, { children: _jsx(UsersListPage, {}) })),
                    },
                    {
                        path: 'users/new',
                        element: (_jsx(LazyPage, { children: _jsx(UserCreatePage, {}) })),
                    },
                    {
                        path: 'roles',
                        element: (_jsx(LazyPage, { children: _jsx(RolesListPage, {}) })),
                    },
                ],
            },
        ],
    },
    {
        path: '/404',
        element: (_jsx(LazyPage, { children: _jsx(NotFoundPage, {}) })),
    },
    {
        path: '*',
        element: _jsx(Navigate, { to: "/404", replace: true }),
    },
]);
//# sourceMappingURL=index.js.map