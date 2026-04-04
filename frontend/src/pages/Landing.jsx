import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Trophy, Heart, Users, TrendingUp, ChevronDown, Star, Check, Play, LayoutDashboard } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

// ── Animated counter ────────────────────────────────────────
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

// ── FAQ Accordion ────────────────────────────────────────────
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-medium text-slate-100">{question}</span>
        <ChevronDown className={`w-5 h-5 text-teal-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-5 text-slate-400 leading-relaxed"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}

// ── Fade-up variant ──────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const faqs = [
    {
      question: 'How does the draw work?',
      answer: 'Every month, 5 numbers between 1–45 are drawn. If your last 5 entered golf scores match 3, 4, or all 5 of those numbers, you win a prize. The more you play, the better your chances.',
    },
    {
      question: 'How are charity contributions calculated?',
      answer: 'At minimum 10% of your subscription fee goes directly to your chosen charity every month. You can increase this percentage up to 100% in your profile settings. Contributions are tracked and visible in your dashboard.',
    },
    {
      question: 'Can I change my charity anytime?',
      answer: 'Yes! You can switch your chosen charity at any time in your dashboard settings. The change applies from your next billing cycle.',
    },
    {
      question: "What if no one matches all 5 numbers?",
      answer: "If no player matches all 5 numbers, 40% of that month's jackpot rolls over and is added to the following month's 5-match prize pool — making it even bigger.",
    },
    {
      question: 'How do I claim a prize?',
      answer: 'After a draw is published, winning members receive an email. You upload a screenshot of your golf score from your golf platform as proof. Our admin team reviews it within 48 hours and processes payment on approval.',
    },
    {
      question: 'Is there a lock-in period?',
      answer: 'No. You can cancel your subscription at any time. You retain access until the end of your billing period. Yearly subscribers are not eligible for refunds after 14 days.',
    },
  ];

  const charities = [
    { name: 'Green Earth Foundation', category: 'Environment', tagline: 'Reforesting India, one score at a time', color: 'from-green-500/20 to-emerald-500/10', icon: '🌱', raised: '₹4.2L' },
    { name: 'Child Education Trust', category: 'Education', tagline: 'Quality education for 3,200+ children', color: 'from-blue-500/20 to-indigo-500/10', icon: '📚', raised: '₹6.8L' },
    { name: 'Women Empowerment Fund', category: 'Social', tagline: 'Funding 800+ women entrepreneurs', color: 'from-purple-500/20 to-pink-500/10', icon: '💪', raised: '₹3.1L' },
  ];

  const steps = [
    { n: '01', title: 'Subscribe', body: 'Choose a monthly or yearly plan. A portion of every subscription feeds the prize pool and your chosen charity.', icon: '🎯' },
    { n: '02', title: 'Enter Scores', body: 'Log up to 5 golf scores (1–45) per month. The newest 5 are always your active entries for the draw.', icon: '⛳' },
    { n: '03', title: 'Win & Give', body: 'Match 3, 4, or 5 draw numbers to win prizes. Your charity contribution goes out automatically every cycle.', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 overflow-x-hidden">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 sm:pt-20">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="section relative z-10 py-10 sm:py-16 lg:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp}>
                <span className="badge-teal mb-6">
                  🇮🇳 India's Premier Golf Draw Platform
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl lg:text-7xl font-bold font-display leading-tight text-white mb-4 sm:mb-6">
                Play Golf.<br />
                <span className="gradient-text">Win Big.</span><br />
                <span className="gradient-text-amber">Change Lives.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-10 max-w-lg leading-relaxed">
                Subscribe monthly, enter your golf scores, and participate in prize draws — while automatically supporting charities that matter to you.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-12">
                {user ? (
                  <Link to="/dashboard" className="btn-primary text-base px-8 py-4">
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link to="/signup" className="btn-primary text-base px-8 py-4">
                    Join Now — ₹499/mo
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/charities" className="btn-secondary text-base px-8 py-4">
                  <Heart className="w-5 h-5" />
                  See Charities
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-3 gap-0 divide-x divide-white/10">
                {[
                  { label: 'Total Donated', value: 14200000, prefix: '₹', suffix: '+' },
                  { label: 'Prize Pool', value: 520000, prefix: '₹', suffix: '' },
                  { label: 'Members', value: 2400, prefix: '', suffix: '+' },
                ].map(({ label, value, prefix, suffix }, i) => (
                  <div key={label} className={`${i === 0 ? 'pr-3 sm:pr-8' : i === 2 ? 'pl-3 sm:pl-8' : 'px-3 sm:px-8'}`}>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white">
                      <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: animated prize card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="glass p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent" />

                {/* Prize pool display */}
                <div className="text-center mb-8">
                  <p className="text-slate-400 text-sm font-medium mb-2">THIS MONTH'S JACKPOT</p>
                  <div className="text-5xl font-bold font-display gradient-text">
                    ₹2,40,000
                  </div>
                  <p className="text-slate-500 text-sm mt-1">5-number match prize</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: '5 Match', amount: '₹2.4L', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                    { label: '4 Match', amount: '₹84K', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                    { label: '3 Match', amount: '₹60K', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  ].map(({ label, amount, color, bg }) => (
                    <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
                      <div className={`font-bold text-lg ${color}`}>{amount}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Draw numbers preview */}
                <div>
                  <p className="text-slate-400 text-xs mb-3 text-center">LAST DRAW NUMBERS</p>
                  <div className="flex justify-center gap-3">
                    {[7, 14, 23, 38, 41].map((n) => (
                      <div key={n} className="draw-number bg-teal-500/20 border border-teal-500/30 text-teal-400">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charity bar */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">💚 Charity Impact this month</span>
                    <span className="text-green-400 font-semibold">₹1,19,760</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '72%' }}
                      transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 glass px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2"
              >
                <span className="text-amber-400">🔔</span>
                <span className="text-xs sm:text-sm font-medium">Draw in 12 days</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-6 h-6 text-slate-500" />
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="section section-py">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Simple Process
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold font-display text-white">
            How It Works
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 mt-4 max-w-xl mx-auto">
            Three simple steps to play, win, and contribute to causes that matter.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map(({ n, title, body, icon }) => (
            <motion.div key={n} variants={fadeUp} className="card relative group hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-teal-500 text-navy-950 rounded-lg flex items-center justify-center text-xs font-bold">
                {n}
              </div>
              <div className="text-4xl mb-4 mt-2">{icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Charity spotlight ─────────────────────────────────── */}
      <section className="section section-py border-t border-white/5">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Real Impact
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold font-display text-white">
            Your Play. Their Future.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 mt-4 max-w-xl mx-auto">
            Every subscription automatically funds one of our verified partner charities. You choose who benefits.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          {charities.map(({ name, category, tagline, color, icon, raised }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className="card group hover:border-white/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{icon}</span>
                  <span className="badge-teal text-xs">{category}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
                <p className="text-slate-400 text-sm mb-4">{tagline}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-slate-500 text-xs">Total Raised</span>
                  <span className="text-green-400 font-semibold">{raised}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link to="/charities" className="btn-secondary">
            View All Charities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Prize breakdown ───────────────────────────────────── */}
      <section className="section section-py border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Prize Pool
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold font-display text-white mb-6">
              A Fair, Transparent Pool — Built From Every Subscription
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 mb-8 leading-relaxed">
              20% of every ₹499 subscription (₹99.80) enters the monthly prize pool. The more members, the bigger the prizes.
            </motion.p>

            <motion.div variants={stagger} className="space-y-4">
              {[
                { label: '5 Numbers Matched — Jackpot', pct: '40%', color: 'bg-amber-400', text: 'text-amber-400' },
                { label: '4 Numbers Matched', pct: '35%', color: 'bg-teal-500', text: 'text-teal-400' },
                { label: '3 Numbers Matched', pct: '25%', color: 'bg-blue-500', text: 'text-blue-400' },
              ].map(({ label, pct, color, text }) => (
                <motion.div key={label} variants={fadeUp} className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className={`font-bold ${text}`}>{pct}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: pct }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass p-5 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Example with 2,000 Members</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Pool', value: '₹1,99,600', sub: '2,000 × ₹99.80', highlight: true },
                { label: '5-Match Jackpot', value: '₹79,840', sub: '40% of pool', color: 'text-amber-400' },
                { label: '4-Match Prize', value: '₹69,860', sub: '35% — split among 4-match winners', color: 'text-teal-400' },
                { label: '3-Match Prize', value: '₹49,900', sub: '25% — split among 3-match winners', color: 'text-blue-400' },
                { label: 'Charity Fund (10%)', value: '₹99,800', sub: 'Minimum to charities', color: 'text-green-400' },
              ].map(({ label, value, sub, highlight, color }) => (
                <div key={label} className={`flex items-start justify-between py-3 border-b border-white/10 ${highlight ? 'text-white' : ''}`}>
                  <div>
                    <div className={`font-medium ${color || 'text-slate-300'}`}>{label}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
                  </div>
                  <div className={`font-bold text-lg ${color || 'text-white'}`}>{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="section section-py border-t border-white/5" id="pricing">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold font-display text-white">
            Simple, Transparent Plans
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 mt-4">
            No hidden fees. Cancel anytime.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
        >
          {/* Monthly */}
          <motion.div variants={fadeUp} className="card">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Monthly</h3>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-bold font-display text-white">₹499</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {['Monthly draw participation', 'Up to 5 scores per month', 'Min. 10% to charity', 'Prize pool contribution', 'Cancel anytime'].map(f => (
                <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {user ? (
              <Link to="/dashboard" className="btn-secondary w-full justify-center">
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup?plan=monthly" className="btn-secondary w-full justify-center">
                Get Started
              </Link>
            )}
          </motion.div>

          {/* Yearly */}
          <motion.div variants={fadeUp} className="card relative border-teal-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500 text-navy-950 text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              SAVE ₹989
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Yearly</h3>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-bold font-display gradient-text">₹4,999</span>
                <span className="text-slate-400">/year</span>
              </div>
              <p className="text-teal-400 text-sm mt-1">~₹417/month</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Everything in Monthly', 'Priority draw entry', 'Yearly impact report', 'Min. 10% to charity', 'Best value — 2 months free'].map(f => (
                <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/signup?plan=yearly" className="btn-primary w-full justify-center">
              Join Yearly
              <Star className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section section-py border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-bold font-display text-white">Common Questions</h2>
          </div>
          <div className="glass p-4 sm:p-8">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="section py-12 sm:py-24 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass p-6 sm:p-12 lg:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-amber-500/10" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold font-display text-white mb-4 sm:mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-10 max-w-xl mx-auto">
              Join 2,400+ members who play golf, win prizes, and fund charities every month.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-amber text-base px-10 py-4">
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/signup" className="btn-amber text-base px-10 py-4">
                  Start Playing Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link to="/charities" className="btn-secondary text-base px-10 py-4">
                <Heart className="w-5 h-5" />
                Explore Charities
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="section">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⛳</span>
                <span className="font-bold font-display text-white">Digital Heroes</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                India's premier subscription golf draw platform. Play, win, and give back.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['How it Works', 'Pricing', 'Draws', 'Leaderboard'] },
              { title: 'Charities', links: ['All Charities', 'Charity Partners', 'Impact Reports', 'Donate'] },
              { title: 'Support', links: ['FAQ', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}>
                      <Link to="/" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2024 Digital Heroes Golf. All rights reserved.</p>
            <p className="text-slate-600 text-sm">Made with ♥ for a better India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
