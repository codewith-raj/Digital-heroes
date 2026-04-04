import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, Shield, BarChart3, TrendingUp, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import Logo from './Logo.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draws', icon: Trophy },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Shield },
];

export default function AdminLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  function isActive(link) {
    return link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to) && link.to !== '/admin';
  }

  const adminEmail = profile?.email || 'ritikrajunique111@gmail.com';
  const adminName  = profile?.name || 'Admin';
  const initials   = adminName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 border-r border-white/5 flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

        {/* Logo + badge */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <Link to="/admin" onClick={() => setSidebarOpen(false)}>
              <Logo size="sm" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <span className="badge-amber text-xs">🛡️ Admin Panel</span>
        </div>

        {/* Admin profile card */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-amber-400 text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{adminName}</p>
              <p className="text-slate-500 text-xs truncate">{adminEmail}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive({ to, exact });
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={active ? 'sidebar-item-active flex' : 'sidebar-item flex'}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-4 h-4 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="sidebar-item flex"
          >
            <TrendingUp className="w-4 h-4" />
            <span>User View</span>
          </Link>
          <button
            id="admin-signout-btn"
            onClick={handleSignOut}
            className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/5 flex"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — mobile */}
        <header className="sticky top-0 z-20 bg-navy-950/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white shrink-0">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="badge-amber text-[10px] px-2 py-0.5">Admin</span>
              <h1 className="text-white font-bold text-sm truncate">{title || 'Admin Panel'}</h1>
            </div>
            {subtitle && <p className="text-slate-400 text-xs truncate mt-0.5">{subtitle}</p>}
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <span className="text-amber-400 text-xs font-bold">{initials}</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-8 py-4 items-center justify-between">
          <div>
            {title && <h1 className="text-xl font-bold font-display text-white">{title}</h1>}
            {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-amber text-xs">🛡️ Admin</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

