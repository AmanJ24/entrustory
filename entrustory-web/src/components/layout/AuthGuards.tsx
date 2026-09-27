import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { setDemoMode } from '../../utils/demoMode';
import { resetMockData } from '../../utils/mockData';
import { Loader2 } from 'lucide-react';

// Wrapper for pages only logged-in users should see (Dashboard, Workspace, etc).
// A visitor with no real session doesn't get redirected to /login — since
// signups are closed, that would be a dead end. Instead they fall through to
// a live "Demo Mode": every page renders normally, but utils/supabase.ts
// quietly swaps onto in-memory mock data (see utils/mockSupabase.ts) so
// nothing they do ever touches the real Supabase project.
export const ProtectedRoute = () => {
  const [status, setStatus] = useState<'checking' | 'ready'>('checking');

  useEffect(() => {
    // Checked directly against the real client (demo mode starts off), not
    // via useAuth() — this is the one place that decides whether demo mode
    // turns on for this visit.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setDemoMode(false);
      } else {
        resetMockData();
        setDemoMode(true);
      }
      setStatus('ready');
    });

    return () => setDemoMode(false);
  }, []);

  if (status === 'checking') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-tertiary w-10 h-10" />
      </div>
    );
  }

  return <Outlet />;
};

// Wrapper for pages logged-in users SHOULD NOT see (Login, Landing page)
export const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-tertiary w-10 h-10" />
      </div>
    );
  }

  // If user exists, force them to the dashboard. Otherwise, let them see the public page.
  return user ? <Navigate to="/app/dashboard" replace /> : <Outlet />;
};
