import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import Logo from '../components/Logo.jsx';


export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error('Please fill in all fields');
    }
    setLoading(true);
    try {
      await signIn({ email: form.email, password: form.password });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center mb-10">
            <Logo size="lg" />
          </Link>

          <h1 className="text-3xl font-bold font-display text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-8">Sign in to your account to continue playing.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-11"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-11 pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <Link to="/forgot-password" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">
              Forgot your password?
            </Link>
          </div>

          <p className="text-slate-400 text-sm text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Create one free →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-navy-800 items-center justify-center">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative z-10 text-center px-12"
        >
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold font-display text-white mb-4">
            Play Golf.<br />Win Prizes.<br />
            <span className="gradient-text">Give Back.</span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Join 2,400+ members making an impact through golf every month.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            {[
              { value: '₹1.4Cr+', label: 'Total Donated' },
              { value: '₹5.2L', label: 'Current Pool' },
            ].map(({ value, label }) => (
              <div key={label} className="glass px-4 py-3 rounded-xl">
                <div className="text-2xl font-bold gradient-text">{value}</div>
                <div className="text-slate-400 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
