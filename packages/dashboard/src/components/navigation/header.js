import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { setTheme } from '@/redux/slices/ui.slice';
import { useLogoutMutation } from '@/services/auth.service';
import { Button } from '@/components/ui';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui';
import { Sun, Moon, Monitor, LogOut, User, Settings } from 'lucide-react';
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
        }
        catch {
            toast.error('Failed to logout');
        }
        finally {
            setLoggingOut(false);
        }
    };
    const themeIcon = theme === 'dark' ? (_jsx(Moon, { className: "h-4 w-4" })) : theme === 'light' ? (_jsx(Sun, { className: "h-4 w-4" })) : (_jsx(Monitor, { className: "h-4 w-4" }));
    return (_jsxs("header", { className: "flex h-14 items-center justify-between border-b bg-card px-6", children: [_jsx("div", { className: "flex items-center gap-4" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(DropdownMenu, { trigger: _jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Toggle theme", children: themeIcon }), align: "end", children: [_jsxs(DropdownItem, { onClick: () => dispatch(setTheme('light')), children: [_jsx(Sun, { className: "mr-2 h-4 w-4" }), "Light"] }), _jsxs(DropdownItem, { onClick: () => dispatch(setTheme('dark')), children: [_jsx(Moon, { className: "mr-2 h-4 w-4" }), "Dark"] }), _jsxs(DropdownItem, { onClick: () => dispatch(setTheme('system')), children: [_jsx(Monitor, { className: "mr-2 h-4 w-4" }), "System"] })] }), _jsxs(DropdownMenu, { trigger: _jsx(Button, { variant: "ghost", size: "icon", "aria-label": "User menu", children: _jsx(User, { className: "h-4 w-4" }) }), align: "end", children: [_jsxs(DropdownItem, { onClick: () => navigate('/settings'), children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"] }), _jsx(DropdownSeparator, {}), _jsxs(DropdownItem, { onClick: handleLogout, destructive: true, disabled: loggingOut, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), loggingOut ? 'Logging out...' : 'Log out'] })] })] })] }));
}
//# sourceMappingURL=header.js.map