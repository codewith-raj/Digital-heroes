import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, CheckCircle, Eye, X, RefreshCw, Zap } from 'lucide-react';
import { adminAPI } from '../../lib/api.js';
import AdminLayout from '../../components/AdminLayout.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = { draft: 'slate', simulated: 'amber', published: 'green' };

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random', rolloverAmount: 0 });
  const [simulating, setSimulating] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [resultsModal, setResultsModal] = useState(null);

  useEffect(() => { fetchDraws(); }, []);

  async function fetchDraws() {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDraws();
      setDraws(data || []);
    } catch (err) {
      toast.error('Failed to load draws');
    } finally {
      setLoading(false);
    }
  }

  async function createDraw(e) {
    e.preventDefault();
    try {
      await adminAPI.createDraw(form);
      toast.success('Draw created!');
      setCreating(false);
      fetchDraws();
    } catch (err) {
      toast.error(err.message || 'Failed to create draw');
    }
  }

  async function simulate(drawId, drawType) {
    setSimulating(drawId);
    try {
      const { data } = await adminAPI.simulateDraw(drawId, { drawType });
      setSimResult({ drawId, ...data });
      toast.success('Simulation complete! Review before publishing.');
      fetchDraws();
    } catch (err) {
      toast.error(err.message || 'Simulation failed');
    } finally {
      setSimulating(null);
    }
  }

  async function publish(drawId) {
    if (!confirm('Publish this draw? This will notify all winners via email and cannot be undone.')) return;
    setPublishing(drawId);
    try {
      const { data } = await adminAPI.publishDraw(drawId);
      toast.success(`Draw published! ${data.totalWinners} winner(s). ${data.jackpotRollover ? '🔄 Jackpot rolls over.' : ''}`);
      fetchDraws();
    } catch (err) {
      toast.error(err.message || 'Failed to publish draw');
    } finally {
      setPublishing(null);
    }
  }

  async function viewResults(drawId) {
    try {
      const { data } = await adminAPI.getDrawResults(drawId);
      setResultsModal(data);
    } catch (err) {
      toast.error('Failed to load results');
    }
  }

  return (
    <AdminLayout title="Draw Management" subtitle="Configure, simulate, and publish monthly draws">
        <div className="flex items-center justify-end mb-6">
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Draw
          </button>
        </div>

        {/* Create draw form */}
        {creating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Create New Draw</h3>
              <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createDraw} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Month</label>
                <select value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))} className="input">
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} className="input" min="2024" max="2030" />
              </div>
              <div>
                <label className="label">Draw Type</label>
                <select value={form.drawType} onChange={e => setForm(f => ({ ...f, drawType: e.target.value }))} className="input">
                  <option value="random">Random</option>
                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>
              <div>
                <label className="label">Rollover (₹)</label>
                <input type="number" value={form.rolloverAmount} onChange={e => setForm(f => ({ ...f, rolloverAmount: parseFloat(e.target.value) }))} className="input" min="0" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                <button type="button" onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Draw</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Sim result */}
        {simResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 mb-6 border-amber-500/30">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-bold">🔍 Simulation Result — Review Before Publishing</h3>
              <button onClick={() => setSimResult(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Draw Numbers:</p>
              <div className="flex gap-3">
                {(simResult.drawNumbers || []).map(n => (
                  <div key={n} className="draw-number bg-amber-500/20 border border-amber-500/30 text-amber-400">{n}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[5, 4, 3].map(m => (
                <div key={m} className="glass p-3 text-center">
                  <div className="text-white font-bold">{simResult.entries?.filter(e => e.matched === m).length || 0}</div>
                  <div className="text-slate-400 text-xs">{m}-Match Winners</div>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">Prize pool: <span className="text-teal-400 font-semibold">₹{simResult.pool?.total?.toLocaleString('en-IN') || 0}</span></p>
          </motion.div>
        )}

        {/* Draws list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="glass h-24 animate-pulse" />)}
          </div>
        ) : draws.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-white font-bold mb-2">No draws yet</h3>
            <p className="text-slate-400 text-sm">Create your first draw to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {draws.map(draw => (
              <div key={draw.id} className="glass p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge-${statusColors[draw.status] || 'slate'} capitalize`}>{draw.status}</span>
                    <span className="text-white font-bold">
                      {new Date(0, draw.month - 1).toLocaleString('default', { month: 'long' })} {draw.year}
                    </span>
                    <span className="badge-slate capitalize">{draw.draw_type}</span>
                  </div>
                  {draw.draw_numbers?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {draw.draw_numbers.map(n => (
                        <span key={n} className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">{n}</span>
                      ))}
                    </div>
                  )}
                  {draw.prize_pools && (
                    <p className="text-slate-400 text-sm mt-1">Pool: ₹{parseFloat(draw.prize_pools.total_pool || 0).toLocaleString('en-IN')}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {draw.status !== 'published' && (
                    <>
                      <button
                        onClick={() => simulate(draw.id, draw.draw_type)}
                        disabled={simulating === draw.id}
                        className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
                      >
                        {simulating === draw.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Simulate
                      </button>
                      {draw.status === 'simulated' && (
                        <button
                          onClick={() => publish(draw.id)}
                          disabled={publishing === draw.id}
                          className="btn-primary text-sm px-3 py-2 flex items-center gap-2"
                        >
                          {publishing === draw.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Publish
                        </button>
                      )}
                    </>
                  )}
                  {draw.status === 'published' && (
                    <button onClick={() => viewResults(draw.id)} className="btn-secondary text-sm px-3 py-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results modal */}
        {resultsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 w-full max-w-2xl my-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Draw Results</h3>
                <button onClick={() => setResultsModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex gap-3 mb-4">
                {(resultsModal.draw?.draw_numbers || []).map(n => (
                  <span key={n} className="draw-number bg-teal-500/20 border border-teal-500/30 text-teal-400">{n}</span>
                ))}
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(resultsModal.winners || []).length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No winners this draw.</p>
                ) : (
                  resultsModal.winners.map(w => (
                    <div key={w.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <span className={`badge-${w.matched === 5 ? 'amber' : w.matched === 4 ? 'teal' : 'slate'}`}>{w.matched}✓</span>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{w.users?.name || 'Unknown'}</div>
                        <div className="text-slate-400 text-xs">{w.users?.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold">₹{parseFloat(w.prize_amount || 0).toLocaleString('en-IN')}</div>
                        <div className="text-slate-500 text-xs">{w.winner_verifications?.[0]?.status || 'pending'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
    </AdminLayout>
  );
}
