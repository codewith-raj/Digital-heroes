import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { authAPI } from '../lib/api.js';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return toast.error('Enter your email address');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
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
        <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              If an account exists for <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <p className="text-slate-500 text-sm">Didn't get the email? Check your spam folder or try again.</p>
            <button onClick={() => setSent(false)} className="btn-secondary mt-4 mx-auto">
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold font-display text-white mb-2">Forgot Password?</h1>
              <p className="text-slate-400 text-sm">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
