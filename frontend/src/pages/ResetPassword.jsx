import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { authAPI } from '../lib/api.js';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sends the user back with a hash fragment containing the access_token
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        // Clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
    }

    // Also check for Supabase session from PKCE flow
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (!accessToken) return toast.error('Invalid reset session');

    setLoading(true);
    try {
      await authAPI.resetPassword({ accessToken, newPassword: password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      // Sign out to clear any stale session
      await supabase.auth.signOut();
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 sm:p-10 w-full max-w-md"
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">Password Reset!</h2>
            <p className="text-slate-400 mb-6">Your password has been updated. You can now log in with your new password.</p>
            <Link to="/login" className="btn-primary inline-flex justify-center">
              Go to Login
            </Link>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Link Expired</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link to="/forgot-password" className="btn-primary inline-flex justify-center">
              Request New Link
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold font-display text-white mb-2">Reset Password</h1>
              <p className="text-slate-400 text-sm">Enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
