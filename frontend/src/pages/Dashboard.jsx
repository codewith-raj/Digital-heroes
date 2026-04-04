import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Heart, Trophy, Settings,
  CreditCard, LogOut, Menu, X, Plus, Pencil, Trash2,
  ChevronRight, Calendar, Check, Upload, AlertCircle, Home, User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { scoresAPI, drawsAPI, charitiesAPI, subscriptionsAPI, winnersAPI } from '../lib/api.js';
import { useSubscription } from '../hooks/useSubscription.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'scores', label: 'My Scores', icon: Target },
  { id: 'draws', label: 'Draws', icon: Trophy },
  { id: 'charity', label: 'Charity', icon: Heart },
  { id: 'winnings', label: 'Winnings', icon: Trophy },
];

// ── Score ball color ─────────────────────────────────────────
function scoreBg(s) {
  if (s <= 15) return 'bg-green-500/20 border border-green-500/30 text-green-400';
  if (s <= 30) return 'bg-teal-500/20 border border-teal-500/30 text-teal-400';
  return 'bg-amber-500/20 border border-amber-500/30 text-amber-400';
}

// ── Overview tab ─────────────────────────────────────────────
function OverviewTab({ profile, subStatus }) {
  const { createCheckout, loading: subLoading } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Sub status banner */}
      <div className={`glass p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        subStatus.subscriptionStatus === 'active' ? 'border-teal-500/30' :
        subStatus.subscriptionStatus === 'lapsed' ? 'border-amber-500/30' : 'border-red-500/20'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge-${subStatus.statusColor}`}>{subStatus.statusLabel}</span>
            {subStatus.plan && <span className="text-slate-400 text-sm capitalize">{subStatus.plan} plan</span>}
          </div>
          <h3 className="text-white font-semibold">Subscription Status</h3>
          {subStatus.subscriptionStatus === 'inactive' && (
            <p className="text-slate-400 text-sm mt-1">Subscribe to start entering draws and winning prizes.</p>
          )}
          {subStatus.subscriptionStatus === 'lapsed' && (
            <p className="text-amber-400 text-sm mt-1">Your last payment failed. Update payment to restore access.</p>
          )}
        </div>
        {subStatus.subscriptionStatus !== 'active' && (
          <div className="flex gap-3">
            <button onClick={() => createCheckout('monthly')} disabled={subLoading} className="btn-primary text-sm">
              {subLoading ? 'Loading...' : 'Subscribe ₹499/mo'}
            </button>
            <button onClick={() => createCheckout('yearly')} disabled={subLoading} className="btn-secondary text-sm">
              ₹4,999/yr
            </button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Subscription', value: subStatus.statusLabel, sub: subStatus.plan || 'No plan', color: 'text-teal-400' },
          { label: 'Charity %', value: `${profile?.charity_percent || 10}%`, sub: profile?.charities?.name || 'No charity', color: 'text-green-400' },
          { label: 'My Charity', value: profile?.charities?.name?.split(' ')[0] || 'None', sub: 'Selected charity', color: 'text-amber-400' },
          { label: 'Member Since', value: profile?.created_at ? format(new Date(profile.created_at), 'MMM yy') : 'N/A', sub: 'Join date', color: 'text-slate-300' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="glass p-5">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-white text-sm font-medium mt-1">{label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="glass p-4 sm:p-6">
        <h3 className="text-white font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
          {[
            { label: 'Enter a Score', to: '?tab=scores', icon: '⛳', color: 'border-teal-500/30 hover:bg-teal-500/5' },
            { label: 'View Draws', to: '?tab=draws', icon: '🎯', color: 'border-amber-500/30 hover:bg-amber-500/5' },
            { label: 'My Charity', to: '?tab=charity', icon: '💚', color: 'border-green-500/30 hover:bg-green-500/5' },
            { label: 'My Winnings', to: '?tab=winnings', icon: '🏆', color: 'border-purple-500/30 hover:bg-purple-500/5' },
          ].map(({ label, to, icon, color }) => (
            <Link key={label} to={to} className={`glass p-3 sm:p-4 flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-200 ${color}`}>
              <span className="text-xl sm:text-2xl">{icon}</span>
              <span className="font-medium text-sm">{label}</span>
              <ChevronRight className="w-4 h-4 ml-auto text-slate-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Scores tab ───────────────────────────────────────────────
function ScoresTab() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ score: '', playedOn: '' });

  useEffect(() => { fetchScores(); }, []);

  async function fetchScores() {
    try {
      const { data } = await scoresAPI.getAll();
      setScores(data || []);
    } catch (err) {
      toast.error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.score || !form.playedOn) return toast.error('Fill in all fields');
    const s = parseInt(form.score);
    if (s < 1 || s > 45) return toast.error('Score must be between 1 and 45');

    try {
      if (editId) {
        await scoresAPI.update(editId, { score: s, playedOn: form.playedOn });
        toast.success('Score updated!');
      } else {
        await scoresAPI.add({ score: s, playedOn: form.playedOn });
        toast.success('Score added! ' + (scores.length >= 5 ? 'Oldest score removed.' : ''));
      }
      setForm({ score: '', playedOn: '' });
      setAdding(false);
      setEditId(null);
      fetchScores();
    } catch (err) {
      toast.error(err.message || 'Failed to save score');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this score?')) return;
    try {
      await scoresAPI.delete(id);
      toast.success('Score deleted');
      fetchScores();
    } catch (err) {
      toast.error('Failed to delete score');
    }
  }

  function startEdit(s) {
    setEditId(s.id);
    setForm({ score: String(s.score), playedOn: s.played_on });
    setAdding(true);
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">My Scores</h2>
          <p className="text-slate-400 text-sm mt-1">Up to 5 scores. Adding a 6th removes the oldest.</p>
        </div>
        {!adding && (
          <button onClick={() => { setAdding(true); setEditId(null); setForm({ score: '', playedOn: '' }); }} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Score
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {adding && (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
          <h3 className="text-white font-semibold mb-4">{editId ? 'Edit Score' : 'Add New Score'}</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Score (1–45)</label>
              <input type="number" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} min="1" max="45" className="input" placeholder="e.g. 23" required />
            </div>
            <div>
              <label className="label">Date Played</label>
              <input type="date" value={form.playedOn} onChange={e => setForm(f => ({ ...f, playedOn: e.target.value }))} className="input" max={format(new Date(), 'yyyy-MM-dd')} required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setAdding(false); setEditId(null); }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editId ? 'Update Score' : 'Add Score'}</button>
          </div>
        </motion.form>
      )}

      {/* Score capacity indicator */}
      <div className="glass p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Score slots used</span>
            <span className="text-white font-medium">{scores.length}/5</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${scores.length >= 5 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${(scores.length / 5) * 100}%` }} />
          </div>
        </div>
        {scores.length >= 5 && (
          <span className="badge-amber text-xs">Full — next adds removes oldest</span>
        )}
      </div>

      {/* Scores list */}
      {scores.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-3">⛳</div>
          <h3 className="text-white font-bold mb-2">No scores yet</h3>
          <p className="text-slate-400 text-sm">Add your first score to start qualifying for draws.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass p-4 flex items-center gap-4">
              <div className={`score-ball ${scoreBg(s.score)}`}>{s.score}</div>
              <div className="flex-1">
                <div className="text-white font-medium">Score: {s.score}</div>
                <div className="text-slate-400 text-sm flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(s.played_on), 'dd MMM yyyy')}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Draws tab ────────────────────────────────────────────────
function DrawsTab() {
  const [draws, setDraws] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      drawsAPI.getAll().then(r => setDraws(r.data || [])),
      drawsAPI.getMyEntries().then(r => setEntries(r.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="space-y-6">
      {/* Current/upcoming draw */}
      {draws.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Latest Draw</h2>
          {draws.slice(0, 1).map(draw => (
            <div key={draw.id} className="glass p-6 border-teal-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge-green mb-2">Published</span>
                  <h3 className="text-white font-bold text-lg mt-1">
                    {new Date(0, draw.month - 1).toLocaleString('default', { month: 'long' })} {draw.year} Draw
                  </h3>
                </div>
                {draw.prize_pools && (
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">₹{parseFloat(draw.prize_pools.pool_5match || 0).toLocaleString('en-IN')}</div>
                    <div className="text-slate-400 text-xs">Jackpot (5 match)</div>
                  </div>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-4">Draw numbers:</p>
              <div className="flex gap-3 flex-wrap">
                {(draw.draw_numbers || []).map(n => (
                  <div key={n} className="draw-number bg-teal-500/20 border border-teal-500/30 text-teal-400">{n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My draw history */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">My Draw History</h2>
        {entries.length === 0 ? (
          <div className="glass p-10 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-white font-bold mb-2">No draw participations yet</h3>
            <p className="text-slate-400 text-sm">Your draw entries will appear here once draws are published.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="glass p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.matched ? (
                      <span className="badge-amber">🏆 {entry.matched} Match — ₹{parseFloat(entry.prize_amount || 0).toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="badge-slate">No Match</span>
                    )}
                  </div>
                  <div className="text-white font-medium">
                    {entry.draws && `${new Date(0, entry.draws.month - 1).toLocaleString('default', { month: 'long' })} ${entry.draws.year}`}
                  </div>
                  {entry.draws?.draw_numbers && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {entry.draws.draw_numbers.map(n => (
                        <span key={n} className="w-7 h-7 rounded-full bg-white/10 text-slate-300 text-xs flex items-center justify-center">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
                {entry.matched && entry.winner_verifications?.length > 0 && (
                  <span className={`badge-${entry.winner_verifications[0].status === 'approved' ? 'green' : entry.winner_verifications[0].status === 'rejected' ? 'red' : 'amber'}`}>
                    {entry.winner_verifications[0].status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Charity tab ──────────────────────────────────────────────
function CharityTab({ profile, refreshProfile }) {
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(profile?.charity_id || '');
  const [percent, setPercent] = useState(profile?.charity_percent || 10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    charitiesAPI.getAll().then(r => setCharities(r.data || [])).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      await charitiesAPI.updateUserCharity({ charityId: selectedCharity, charityPercent: percent });
      await refreshProfile();
      toast.success('Charity settings updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Charity Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Choose where your subscription contribution goes.</p>
      </div>

      {/* Current charity */}
      {profile?.charities && (
        <div className="glass p-5 border-green-500/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-xl">💚</div>
          <div>
            <div className="text-slate-400 text-xs">Currently supporting</div>
            <div className="text-white font-bold">{profile.charities.name}</div>
          </div>
        </div>
      )}

      {/* Charity picker */}
      <div className="glass p-6">
        <label className="label">Select Charity</label>
        <select
          value={selectedCharity}
          onChange={e => setSelectedCharity(e.target.value)}
          className="input mb-1"
        >
          <option value="">Choose a charity...</option>
          {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Percent slider */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="label mb-0">Charity contribution</label>
          <span className="text-teal-400 font-bold text-xl">{percent}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={percent}
          onChange={e => setPercent(parseInt(e.target.value))}
          className="w-full accent-teal-400"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>10% (minimum)</span>
          <span>100% (all in)</span>
        </div>
        <p className="text-slate-400 text-sm mt-4">
          Based on your <strong className="text-white">₹499/month</strong> plan, you'll contribute{' '}
          <strong className="text-green-400">₹{(499 * percent / 100).toFixed(0)}</strong> per month.
        </p>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// ── Winnings tab ─────────────────────────────────────────────
function WinningsTab() {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    winnersAPI.getMyWins().then(r => setWins(r.data || [])).finally(() => setLoading(false));
  }, []);

  async function uploadProof(entryId, file) {
    const form = new FormData();
    form.append('proof', file);
    setUploading(entryId);
    try {
      await winnersAPI.uploadProof(entryId, form);
      toast.success('Proof uploaded! Admin will review within 48 hours.');
      const { data } = await winnersAPI.getMyWins();
      setWins(data || []);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const totalWon = wins.reduce((s, w) => s + parseFloat(w.prize_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">My Winnings</h2>
        {wins.length > 0 && (
          <p className="text-slate-400 text-sm mt-1">Total won: <span className="text-green-400 font-semibold">₹{totalWon.toLocaleString('en-IN')}</span></p>
        )}
      </div>

      {wins.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-white font-bold mb-2">No wins yet</h3>
          <p className="text-slate-400 text-sm">Keep entering scores! Your winnings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wins.map(win => {
            const verification = win.winner_verifications?.[0];
            return (
              <div key={win.id} className="glass p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="badge-amber mb-2">🏆 {win.matched} Numbers Matched</div>
                    <div className="text-2xl font-bold gradient-text-amber">₹{parseFloat(win.prize_amount || 0).toLocaleString('en-IN')}</div>
                    <div className="text-slate-400 text-sm mt-1">
                      {win.draws && `${new Date(0, win.draws.month - 1).toLocaleString('default', { month: 'long' })} ${win.draws.year} Draw`}
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div>
                      {verification ? (
                        <span className={`badge-${verification.status === 'approved' ? 'green' : verification.status === 'rejected' ? 'red' : 'amber'}`}>
                          Proof: {verification.status}
                        </span>
                      ) : (
                        <span className="badge-slate">No proof uploaded</span>
                      )}
                    </div>
                    <div>
                      {verification?.payout_status === 'paid' ? (
                        <span className="badge-green">✓ Paid</span>
                      ) : (
                        <span className="badge-slate">Payout Pending</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload proof */}
                {!verification?.proof_url && (
                  <label className={`btn-secondary text-sm cursor-pointer w-full justify-center ${uploading === win.id ? 'opacity-60 cursor-wait' : ''}`}>
                    <Upload className="w-4 h-4" />
                    {uploading === win.id ? 'Uploading...' : 'Upload Score Screenshot'}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={uploading === win.id}
                      onChange={e => e.target.files[0] && uploadProof(win.id, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { profile, loading, signOut, refreshProfile } = useAuth();
  const subStatus = useSubscription();

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTab = searchParams.get('tab') || 'overview';

  function setTab(tab) {
    setSearchParams({ tab });
    setSidebarOpen(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 border-r border-white/5 flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-white/5">
          <span className="text-2xl">⛳</span>
          <span className="font-bold font-display text-white">Digital Heroes</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={activeTab === id ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {profile?.role === 'admin' && (
            <Link to="/admin" className="sidebar-item w-full block">
              <Settings className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
          <Link to="/" className="sidebar-item w-full flex items-center gap-2 text-slate-400 hover:text-white">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button onClick={signOut} className="sidebar-item w-full text-red-400">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold">{tabs.find(t => t.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3" ref={userMenuRef}>
            <span className="text-slate-400 text-sm hidden sm:block">{profile?.name || profile?.email}</span>
            {/* User avatar button */}
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-sm font-bold hover:bg-teal-500/30 hover:border-teal-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                aria-label="User menu"
              >
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-navy-900 border border-white/10 shadow-2xl shadow-black/60 overflow-hidden z-50"
                  >
                    {/* Profile info */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
                          {profile?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-sm font-semibold truncate">{profile?.name || 'User'}</div>
                          <div className="text-slate-400 text-xs truncate">{profile?.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Home className="w-4 h-4 text-slate-400" />
                        Back to Home
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview'  && <OverviewTab profile={profile} subStatus={subStatus} />}
              {activeTab === 'scores'    && <ScoresTab />}
              {activeTab === 'draws'     && <DrawsTab />}
              {activeTab === 'charity'   && <CharityTab profile={profile} refreshProfile={refreshProfile} />}
              {activeTab === 'winnings'  && <WinningsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
