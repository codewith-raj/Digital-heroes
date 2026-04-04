import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Heart, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { charitiesAPI } from '../lib/api.js';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import Logo from '../components/Logo.jsx';


const steps = ['Account', 'Charity', 'Plan'];

export default function Signup() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '', charityId: '', plan: 'monthly' });
  const [showPassword, setShowPassword] = useState(false);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get('plan')) setForm(f => ({ ...f, plan: params.get('plan') }));
    charitiesAPI.getAll({ featured: 'true' }).then(r => setCharities(r.data?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const nextStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields');
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    }
    if (step === 1 && !form.charityId) return toast.error('Please choose a charity');
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Call backend API — uses admin.createUser() with email_confirm:true (no email verification needed)
      await api.post('/auth/signup', {
        email: form.email,
        password: form.password,
        name: form.name,
        charityId: form.charityId || null,
      });
      // Auto-login immediately after account creation
      await signIn({ email: form.email, password: form.password });
      toast.success('Account created! Welcome to Digital Heroes 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center mb-6 sm:mb-10">
          <Logo size="lg" />
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6 sm:mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${i < step ? 'bg-teal-500 text-navy-950' : i === step ? 'bg-teal-500/20 border border-teal-500 text-teal-400' : 'bg-white/5 text-slate-500'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium transition-colors ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
              </div>
              {i < 2 && <div className="h-px bg-white/10 mt-1" />}
            </div>
          ))}
        </div>

        {/* Step 0: Account */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold font-display text-white mb-1">Create your account</h1>
              <p className="text-slate-400">Start playing and giving in minutes.</p>
            </div>
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Raj Malhotra" className="input pl-11" required />
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input pl-11" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" className="input pl-11 pr-11" required />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="step0-next" onClick={nextStep} className="btn-primary w-full justify-center">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 1: Choose charity */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <h2 className="text-3xl font-bold font-display text-white mb-1">Choose your charity</h2>
              <p className="text-slate-400">At least 10% of your subscription goes here every month.</p>
            </div>
            <div className="space-y-3">
              {charities.length === 0 && (
                <div className="text-slate-400 text-sm text-center py-6">Loading charities...</div>
              )}
              {charities.map(c => (
                <button
                  key={c.id}
                  onClick={() => setForm(f => ({ ...f, charityId: c.id }))}
                  className={`w-full glass p-4 flex items-center gap-4 text-left transition-all duration-200 hover:border-teal-500/30
                    ${form.charityId === c.id ? 'border-teal-500 bg-teal-500/10' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${form.charityId === c.id ? 'bg-teal-500 text-navy-950' : 'bg-white/10'}`}>
                    {form.charityId === c.id ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-slate-400 text-sm truncate">{c.description?.slice(0, 80)}...</div>
                  </div>
                </button>
              ))}
              {charities.length > 0 && (
                <p className="text-slate-500 text-xs text-center">You can change this anytime in settings.</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">Back</button>
              <button id="step1-next" onClick={nextStep} className="btn-primary flex-1 justify-center">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <h2 className="text-3xl font-bold font-display text-white mb-1">Choose your plan</h2>
              <p className="text-slate-400">You can change or cancel anytime.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: 'monthly', label: 'Monthly', price: '₹499', per: 'per month', badge: null },
                { value: 'yearly', label: 'Yearly', price: '₹4,999', per: 'per year', badge: 'SAVE ₹989' },
              ].map(({ value, label, price, per, badge }) => (
                <button
                  key={value}
                  onClick={() => setForm(f => ({ ...f, plan: value }))}
                  className={`glass p-5 text-left relative overflow-hidden transition-all duration-200 hover:border-teal-500/30
                    ${form.plan === value ? 'border-teal-500 bg-teal-500/10' : ''}`}
                >
                  {badge && (
                    <span className="absolute top-0 right-0 bg-teal-500 text-navy-950 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">{badge}</span>
                  )}
                  <div className="font-semibold text-white mb-2">{label}</div>
                  <div className="text-2xl font-bold font-display gradient-text">{price}</div>
                  <div className="text-slate-400 text-sm">{per}</div>
                  {form.plan === value && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-navy-950" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="glass p-4 text-sm">
              <p className="text-slate-300">
                <span className="text-teal-400 font-semibold">Note:</span> You'll create your account now. After signing in, go to your dashboard to complete the payment via Stripe.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Back</button>
              <button
                id="create-account-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        <p className="text-slate-400 text-sm text-center mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}
