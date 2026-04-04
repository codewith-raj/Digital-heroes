import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, Shield, BarChart3, TrendingUp, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import Logo from './Logo.jsx';


const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draws', icon: Trophy },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Shield },
];

export default function AdminLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 border-r border-white/5 flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <Link to="/admin">
              <Logo size="sm" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <span className="badge-amber text-xs">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={location.pathname === to ? 'sidebar-item-active block' : 'sidebar-item block'}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="sidebar-item block mb-1">
            <TrendingUp className="w-5 h-5" />
            User View
          </Link>
          <button onClick={signOut} className="sidebar-item w-full text-red-400">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar - mobile */}
        <header className="sticky top-0 z-20 bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm">{title || 'Admin'}</h1>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {(title || subtitle) && (
            <div className="mb-6 hidden lg:block">
              {title && <h1 className="text-2xl font-bold font-display text-white">{title}</h1>}
              {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
