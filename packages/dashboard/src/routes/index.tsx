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
const NotFoundPage = lazy(() => import('@/pages/not-found'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      {
        path: '/login',
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          {
            index: true,
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: 'projects',
            element: (
              <LazyPage>
                <ProjectsListPage />
              </LazyPage>
            ),
          },
          {
            path: 'projects/new',
            element: (
              <LazyPage>
                <ProjectCreatePage />
              </LazyPage>
            ),
          },
          {
            path: 'projects/:id',
            element: (
              <LazyPage>
                <ProjectDetailPage />
              </LazyPage>
            ),
          },
          {
            path: 'files',
            element: (
              <LazyPage>
                <FilesPage />
              </LazyPage>
            ),
          },
          {
            path: 'files/:id',
            element: (
              <LazyPage>
                <FileDetailPage />
              </LazyPage>
            ),
          },
          {
            path: 'upload',
            element: (
              <LazyPage>
                <UploadPage />
              </LazyPage>
            ),
          },
          {
            path: 'api-keys',
            element: (
              <LazyPage>
                <ApiKeysPage />
              </LazyPage>
            ),
          },
          {
            path: 'settings',
            element: (
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            ),
          },
          {
            path: 'logs',
            element: (
              <LazyPage>
                <LogsPage />
              </LazyPage>
            ),
          },
          {
            path: 'users',
            element: (
              <LazyPage>
                <UsersListPage />
              </LazyPage>
            ),
          },
          {
            path: 'users/new',
            element: (
              <LazyPage>
                <UserCreatePage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/404',
    element: (
      <LazyPage>
        <NotFoundPage />
      </LazyPage>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
