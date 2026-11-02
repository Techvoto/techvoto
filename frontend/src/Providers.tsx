import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { Outlet, useHref, useNavigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { AuthProvider } from '@/context/auth';
import { fetcher } from '@/lib/api';

/** Root route element: global providers around every page. Must sit inside the router (auth and HeroUI use navigate). */
export function Providers({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SWRConfig value={{ fetcher, revalidateOnFocus: false, shouldRetryOnError: false }}>
          <AuthProvider>
            <ToastProvider placement="top-right" />
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
            {children ?? <Outlet />}
          </AuthProvider>
        </SWRConfig>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
