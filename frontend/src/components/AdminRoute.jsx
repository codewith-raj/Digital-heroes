import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p className="text-slate-400 text-sm">Checking permissions...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/admin/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
