import { useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
export function useTheme() {
    const theme = useAppSelector((s) => s.ui.theme);
    useEffect(() => {
        const root = document.documentElement;
        let cleanup;
        if (theme === 'system') {
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const applySystem = () => {
                root.classList.toggle('dark', media.matches);
            };
            applySystem();
            media.addEventListener('change', applySystem);
            cleanup = () => {
                media.removeEventListener('change', applySystem);
            };
        }
        else {
            root.classList.toggle('dark', theme === 'dark');
        }
        return cleanup;
    }, [theme]);
}
//# sourceMappingURL=use-theme.js.map