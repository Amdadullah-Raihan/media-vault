import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from '@/redux/store';
import { router } from '@/routes';
import { useTheme } from '@/hooks';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: '!bg-card !text-foreground !border !border-border !shadow-lg',
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}
