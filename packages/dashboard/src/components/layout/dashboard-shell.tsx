import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/sidebar';
import { Header } from '@/components/navigation/header';
import { useAppSelector } from '@/redux/store';
import { cn } from '@/utils';

export function DashboardShell() {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="flex min-h-screen min-w-0">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200 min-w-0',
          'ml-0 md:ml-16',
          sidebarOpen && 'md:ml-60',
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
