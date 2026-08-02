import { Navigate, Outlet } from 'react-router-dom';
import { useGetSessionQuery } from '@/services/auth.service';
import { PageSpinner } from '@/components/ui';

export function AuthGuard() {
  const { data, isLoading, isFetching, isError } = useGetSessionQuery();

  if (isLoading || isFetching) {
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
  const { data, isLoading, isFetching, isError } = useGetSessionQuery();

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  // Only redirect if the session query succeeded with a valid session.
  // If errored or data.success is false, let the user reach the login page.
  if (!isError && data?.success) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
