import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Key,
  Upload,
  Settings,
  Activity,
  Users,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { toggleSidebar } from '@/redux/slices/ui.slice';
import { APP_NAME } from '@/constants';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Files', href: '/files', icon: FileText },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'API Keys', href: '/api-keys', icon: Key },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Logs', href: '/logs', icon: Activity },
];

export function Sidebar() {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-card transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <span className="text-sm font-bold text-primary-foreground">MV</span>
        </div>
        {sidebarOpen && <span className="font-semibold tracking-tight">{APP_NAME}</span>}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            'ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            !sidebarOpen && 'ml-0',
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">MediaVault v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
