import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from '@/redux/store';
import { router } from '@/routes';
import { useTheme } from '@/hooks';
function ThemeProvider({ children }) {
    useTheme();
    return _jsx(_Fragment, { children: children });
}
export default function App() {
    return (_jsx(Provider, { store: store, children: _jsxs(ThemeProvider, { children: [_jsx(RouterProvider, { router: router }), _jsx(Toaster, { position: "bottom-right", toastOptions: {
                        className: '!bg-card !text-foreground !border !border-border !shadow-lg',
                        duration: 4000,
                    } })] }) }));
}
//# sourceMappingURL=App.js.map