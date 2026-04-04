import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Trophy, Heart, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/charities', label: 'Charities' },
    { to: '/#pricing', label: 'Pricing' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-white/5">
      <div className="section flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">⛳</span>
          <span className="font-bold font-display text-white">Digital Heroes</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={`text-sm font-medium transition-colors hover:text-teal-400 ${location.pathname === to ? 'text-teal-400' : 'text-slate-400'}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" className="btn-secondary text-sm px-4 py-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn-primary text-sm px-5 py-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button onClick={signOut} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">Sign in</Link>
              <Link to="/signup" id="nav-signup-btn" className="btn-primary text-sm px-5 py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-navy-950/95 backdrop-blur-md"
          >
            <div className="section py-4 space-y-2">
              {links.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} className="block py-2 text-slate-400 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary justify-center">Dashboard</Link>
                    <button onClick={() => { signOut(); setOpen(false); }} className="btn-secondary justify-center">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary justify-center">Sign in</Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary justify-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
