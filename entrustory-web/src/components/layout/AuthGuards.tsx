import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Wrapper for pages only logged-in users should see (Dashboard, Workspace, etc)
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B1120]">
        <Loader2 className="animate-spin text-cyan-500 w-10 h-10" />
      </div>
    );
  }

  // If no user, kick to login. Otherwise, render the requested page.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Wrapper for pages logged-in users SHOULD NOT see (Login, Landing page)
export const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B1120]">
        <Loader2 className="animate-spin text-cyan-500 w-10 h-10" />
      </div>
    );
  }

  // If user exists, force them to the dashboard. Otherwise, let them see the public page.
  return user ? <Navigate to="/app/dashboard" replace /> : <Outlet />;
};
