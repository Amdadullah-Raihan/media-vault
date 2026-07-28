import { Navigate, Outlet } from 'react-router-dom';
import { useGetSessionQuery } from '@/services/auth.service';
import { PageSpinner } from '@/components/ui';

export function AuthGuard() {
  const { data, isLoading, isError } = useGetSessionQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (isError || !data?.success) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function GuestGuard() {
  const { data, isLoading } = useGetSessionQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (data?.success) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
