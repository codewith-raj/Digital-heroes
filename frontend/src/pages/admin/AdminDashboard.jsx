import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, Shield, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';

function AdminSidebar() {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/draws', label: 'Draws', icon: Trophy },
    { to: '/admin/charities', label: 'Charities', icon: Heart },
    { to: '/admin/winners', label: 'Winners', icon: Shield },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-white/5 flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⛳</span>
          <span className="font-bold font-display text-white text-sm">Digital Heroes</span>
        </div>
        <span className="badge-amber text-xs">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={location.pathname === to ? 'sidebar-item-active block' : 'sidebar-item block'}>
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <Link to="/dashboard" className="sidebar-item block mb-1">
          <TrendingUp className="w-5 h-5" />
          User View
        </Link>
        <button onClick={signOut} className="sidebar-item w-full text-red-400">
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminDashboard() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReports().then(r => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  const stats = reports ? [
    { label: 'Total Users', value: reports.totalUsers, icon: '👥', color: 'text-blue-400' },
    { label: 'Active Subscribers', value: reports.activeSubscribers, icon: '✅', color: 'text-green-400' },
    { label: 'Draws Completed', value: reports.totalDraws, icon: '🎯', color: 'text-teal-400' },
    { label: 'Est. Monthly Pool', value: `₹${(reports.estimatedMonthlyPool || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'text-amber-400' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-navy-950">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and key metrics</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="glass h-32 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map(({ label, value, icon, color }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-slate-400 text-sm mt-1">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charity totals */}
            {reports?.charityTotals && Object.keys(reports.charityTotals).length > 0 && (
              <div className="glass p-6">
                <h2 className="text-white font-bold mb-4">Charity Contributions</h2>
                <div className="space-y-3">
                  {Object.entries(reports.charityTotals).map(([name, amount]) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-slate-300">{name}</span>
                      <span className="text-green-400 font-semibold">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export { AdminSidebar };
