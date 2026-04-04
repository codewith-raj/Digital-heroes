import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Eye, EyeOff, ArrowLeft, Lock, Mail,
  AlertCircle, RefreshCw, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn({ email, password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center relative overflow-hidden p-4">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/4 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/4 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to site
        </Link>

        {/* Card */}
        <div className="glass p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-center mb-5"
            >
              <div className="relative">
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Shield className="w-9 h-9 text-amber-400" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-2xl border border-amber-500/20 animate-ping opacity-30" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Digital Heroes — Restricted Access
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Authorized Personnel Only
            </div>
          </div>

          {/* Evaluator Credentials Note (To be removed later) */}
          <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-teal-400" />
              <p className="text-teal-400 text-sm font-semibold">Demo Admin Credentials</p>
            </div>
            <p className="text-slate-300 text-xs font-mono mb-1">
              Email: ritikrajunique111@gmail.com
            </p>
            <p className="text-slate-300 text-xs font-mono">
              Password: pass12345@
            </p>
            <p className="text-teal-500/70 text-[10px] mt-2 italic">
              Note: This is provided for evaluation purposes and will be removed later.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="admin@digitalherosgolf.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  id="admin-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-11"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading || !email || !password}
              className="btn-primary w-full justify-center bg-amber-500 hover:bg-amber-400 shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed mt-1 group"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Access Admin Panel'}
              {!loading && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Not an admin? Regular user login →
            </Link>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="text-center text-slate-700 text-xs mt-6">
          Digital Heroes Golf Platform · Admin v2.0
        </p>
      </motion.div>
    </div>
  );
}
