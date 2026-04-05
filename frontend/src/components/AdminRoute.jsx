import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Shield } from 'lucide-react';

export default function AdminRoute() {
  const { user, profile, loading } = useAuth();

  // Wait only while auth is being resolved; once loading=false we decide immediately
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium">Verifying access</p>
            <p className="text-slate-600 text-xs mt-1">Checking admin permissions…</p>
          </div>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
