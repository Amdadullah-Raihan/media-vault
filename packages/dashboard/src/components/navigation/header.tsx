import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setTheme, toggleMobileMenu } from '@/redux/slices/ui.slice';
import { useLogoutMutation } from '@/services/auth.service';
import { Button } from '@/components/ui';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui';
import { Sun, Moon, Monitor, LogOut, User, Settings, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export function Header() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout().unwrap();
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    } finally {
      setLoggingOut(false);
    }
  };

  const themeIcon =
    theme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : theme === 'light' ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleMobileMenu())}
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              {themeIcon}
            </Button>
          }
          align="end"
        >
          <DropdownItem onClick={() => dispatch(setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownItem>
          <DropdownItem onClick={() => dispatch(setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownItem>
          <DropdownItem onClick={() => dispatch(setTheme('system'))}>
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownItem>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="User menu">
              <User className="h-4 w-4" />
            </Button>
          }
          align="end"
        >
          <DropdownItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={handleLogout} destructive disabled={loggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </DropdownItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
