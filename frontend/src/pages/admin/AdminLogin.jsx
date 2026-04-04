import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowLeft, Zap, Lock, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';
import api from '../../lib/api.js';
import Logo from '../../components/Logo.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();

  const [email, setEmail]       = useState('ritikrajunique111@gmail.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [setupMsg, setSetupMsg] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupDone, setSetupDone]       = useState(false);
  const [step, setStep]         = useState('login'); // 'login' | 'setup'

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn({ email, password });
      // Navigate immediately — AdminRoute will wait for profile load
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Check your email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSetup() {
    setSetupLoading(true);
    setSetupMsg('');
    try {
      const { data } = await api.post('/auth/admin-setup', { secret: 'dh_admin_setup_2024' });
      setSetupMsg(data.message || 'Admin role assigned! You can now log in.');
      setSetupDone(true);
    } catch (err) {
      setSetupMsg(err.message || 'Setup failed. Make sure backend is running.');
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center relative overflow-hidden p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>

        {/* Card */}
        <div className="glass p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-1">Digital Heroes — Restricted Access</p>
            <span className="badge-amber text-xs mt-3 inline-flex">🔐 Admin Only</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
            {[
              { id: 'login', label: 'Sign In' },
              { id: 'setup', label: 'First-Time Setup' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStep(tab.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  step === tab.id
                    ? 'bg-amber-500 text-navy-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {/* Credential hint box */}
                <div className="mb-6 p-4 rounded-xl border border-teal-500/20 bg-teal-500/5">
                  <p className="text-teal-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Admin Credentials
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Email</span>
                      <span className="text-slate-300 text-xs font-mono">ritikrajunique111@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Password</span>
                      <span className="text-slate-300 text-xs font-mono">pass12345@</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        id="admin-email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input pl-10"
                        placeholder="admin@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        id="admin-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input pl-10 pr-11"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                      className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p>{error}</p>
                        {error.includes('role') || error.includes('not found') ? (
                          <button
                            type="button"
                            onClick={() => setStep('setup')}
                            className="underline text-xs mt-1 text-red-300 hover:text-red-200"
                          >
                            Run first-time setup →
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    id="admin-login-btn"
                    disabled={loading}
                    className="btn-primary w-full justify-center bg-amber-500 hover:bg-amber-400 shadow-amber-500/25 hover:shadow-amber-500/40 mt-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    {loading ? 'Signing in...' : 'Access Admin Panel'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <Link to="/login" className="text-slate-500 hover:text-slate-400 text-xs transition-colors">
                    Regular user login →
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="setup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> First-Time Setup
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      This step assigns the <strong className="text-slate-300">admin role</strong> to{' '}
                      <span className="font-mono text-teal-400">ritikrajunique111@gmail.com</span> in the Supabase database.
                      Run this once after the account is created in Supabase.
                    </p>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl bg-white/3 border border-white/5">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Steps</p>
                    {[
                      'Make sure the backend server is running (npm run dev in /backend)',
                      'Ensure the admin account is registered in Supabase Auth',
                      'Click "Assign Admin Role" below',
                      'Then return to Sign In tab and log in',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          setupDone && i < 3 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-400'
                        }`}>
                          {setupDone && i < 3 ? '✓' : i + 1}
                        </span>
                        <p className="text-slate-400 text-xs leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  {setupMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                        setupDone
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}
                    >
                      {setupDone ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <p>{setupMsg}</p>
                    </motion.div>
                  )}

                  <button
                    id="admin-setup-btn"
                    onClick={handleAdminSetup}
                    disabled={setupLoading || setupDone}
                    className="btn-primary w-full justify-center bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {setupLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : setupDone ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {setupLoading ? 'Setting up...' : setupDone ? 'Role Assigned ✓' : 'Assign Admin Role'}
                  </button>

                  {setupDone && (
                    <button
                      onClick={() => setStep('login')}
                      className="btn-secondary w-full justify-center text-sm"
                    >
                      Go to Sign In →
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Digital Heroes Golf Platform · Admin v1.0
        </p>
      </motion.div>
    </div>
  );
}
