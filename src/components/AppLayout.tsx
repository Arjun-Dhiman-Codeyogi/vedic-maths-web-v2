import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';
import AuthGuard from './AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/lib/logActivity';

const PAGE_NAMES: Record<string, string> = {
  '/': 'dashboard',
  '/learn': 'learn',
  '/practice': 'practice',
  '/abacus': 'abacus',
  '/solver': 'solver',
  '/profile': 'profile',
  '/videos': 'videos',
  '/sutras': 'sutras',
  '/about': 'about',
};

const AppLayout = () => {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const pageName = PAGE_NAMES[location.pathname];
    if (!pageName || lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        logActivity(session.user.id, 'page_visit', pageName);
      }
    });
  }, [location.pathname]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default AppLayout;
