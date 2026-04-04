import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink, Filter } from 'lucide-react';
import { adminAPI } from '../../lib/api.js';
import AdminLayout from '../../components/AdminLayout.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = { pending: 'amber', approved: 'green', rejected: 'red' };
const payoutColors = { pending: 'slate', paid: 'green' };

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [payoutFilter, setPayoutFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchWinners(); }, [statusFilter, payoutFilter]);

  async function fetchWinners() {
    setLoading(true);
    try {
      const { data } = await adminAPI.getWinners(
        Object.fromEntries([statusFilter && ['status', statusFilter], payoutFilter && ['payoutStatus', payoutFilter]].filter(Boolean))
      );
      setWinners(data || []);
    } catch (err) {
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  }

  async function update(id, updates) {
    setUpdating(id);
    try {
      await adminAPI.updateVerification(id, updates);
      toast.success('Updated successfully');
      fetchWinners();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminLayout title="Winner Verifications" subtitle="Review proof submissions and process payouts">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: 'All Proofs', value: '', state: statusFilter, set: setStatusFilter },
            { label: 'Pending', value: 'pending', state: statusFilter, set: setStatusFilter },
            { label: 'Approved', value: 'approved', state: statusFilter, set: setStatusFilter },
            { label: 'Rejected', value: 'rejected', state: statusFilter, set: setStatusFilter },
          ].map(({ label, value, state, set }) => (
            <button key={label} onClick={() => set(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${state === value ? 'bg-teal-500 text-navy-950' : 'glass text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
          <div className="border-l border-white/10 pl-3 flex gap-2">
            {[
              { label: 'All Payouts', value: '', state: payoutFilter, set: setPayoutFilter },
              { label: 'Unpaid', value: 'pending', state: payoutFilter, set: setPayoutFilter },
              { label: 'Paid', value: 'paid', state: payoutFilter, set: setPayoutFilter },
            ].map(({ label, value, state, set }) => (
              <button key={label} onClick={() => set(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${state === value ? 'bg-amber-500 text-navy-950' : 'glass text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Winners list */}
        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass h-32 animate-pulse" />)}</div>
        ) : winners.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-white font-bold mb-2">No verifications found</h3>
            <p className="text-slate-400 text-sm">Verifications appear here after draws are published and winners are notified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map(v => {
              const entry = v.draw_entries;
              const user = entry?.users;
              const draw = entry?.draws;

              return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* Winner info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`badge-${entry?.matched === 5 ? 'amber' : entry?.matched === 4 ? 'teal' : 'slate'}`}>
                          🏆 {entry?.matched}-Match
                        </span>
                        <span className={`badge-${statusColors[v.status]}`}>{v.status}</span>
                        <span className={`badge-${payoutColors[v.payout_status]}`}>
                          {v.payout_status === 'paid' ? '✓ Paid' : 'Payout Pending'}
                        </span>
                      </div>
                      <div className="font-semibold text-white">{user?.name || 'Unknown'}</div>
                      <div className="text-slate-400 text-sm">{user?.email}</div>
                      <div className="text-slate-500 text-sm mt-1">
                        {draw && `Draw: ${new Date(0, draw.month - 1).toLocaleString('default', { month: 'long' })} ${draw.year}`}
                        {entry?.prize_amount && ` · Prize: ₹${parseFloat(entry.prize_amount).toLocaleString('en-IN')}`}
                      </div>
                      {v.created_at && (
                        <div className="text-slate-600 text-xs mt-1">Submitted: {format(new Date(v.created_at), 'dd MMM yyyy')}</div>
                      )}
                    </div>

                    {/* Proof */}
                    <div className="flex flex-col items-start gap-2 flex-shrink-0">
                      {v.proof_url ? (
                        <a href={v.proof_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                          <ExternalLink className="w-3 h-3" /> View Proof
                        </a>
                      ) : (
                        <span className="badge-slate text-xs">No proof yet</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {v.status === 'pending' && (
                        <>
                          <button
                            onClick={() => update(v.id, { status: 'approved' })}
                            disabled={updating === v.id || !v.proof_url}
                            title={!v.proof_url ? 'No proof uploaded yet' : 'Approve'}
                            className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => update(v.id, { status: 'rejected' })}
                            disabled={updating === v.id}
                            className="btn-danger text-sm px-3 py-1.5 flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                      {v.status === 'approved' && v.payout_status === 'pending' && (
                        <button
                          onClick={() => update(v.id, { payoutStatus: 'paid' })}
                          disabled={updating === v.id}
                          className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
    </AdminLayout>
  );
}
