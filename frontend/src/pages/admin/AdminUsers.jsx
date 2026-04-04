import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Pencil, Check, X } from 'lucide-react';
import { adminAPI } from '../../lib/api.js';
import AdminLayout from '../../components/AdminLayout.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => { fetchUsers(); }, [search, statusFilter, page]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search, status: statusFilter, page, limit: 15 });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function saveUser() {
    try {
      await adminAPI.updateUser(editUser, editForm);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  }

  const statusColors = { active: 'green', inactive: 'slate', lapsed: 'amber', cancelled: 'red' };

  return (
    <AdminLayout title="User Management" subtitle={`${total} total users`}>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto min-w-40">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lapsed">Lapsed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Users table */}
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                {['Name', 'Email', 'Status', 'Plan', 'Charity %', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="table-head">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="table-row">
                  <td className="table-cell font-medium text-white">{user.name || '—'}</td>
                  <td className="table-cell text-slate-400">{user.email}</td>
                  <td className="table-cell">
                    <span className={`badge-${statusColors[user.subscription_status] || 'slate'} capitalize`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="table-cell capitalize">{user.subscription_plan || '—'}</td>
                  <td className="table-cell">{user.charity_percent || 10}%</td>
                  <td className="table-cell">{user.created_at ? format(new Date(user.created_at), 'dd MMM yy') : '—'}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => { setEditUser(user.id); setEditForm({ name: user.name, subscription_status: user.subscription_status, subscription_plan: user.subscription_plan, charity_percent: user.charity_percent || 10, role: user.role }); }}
                      className="p-1.5 rounded text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(Math.ceil(total / 15))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded text-sm font-medium ${page === i + 1 ? 'bg-teal-500 text-navy-950' : 'glass text-slate-400 hover:text-white'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Edit modal */}
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold">Edit User</h3>
                <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input type="text" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Subscription Status</label>
                  <select value={editForm.subscription_status} onChange={e => setEditForm(f => ({ ...f, subscription_status: e.target.value }))} className="input">
                    {['active', 'inactive', 'lapsed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Plan</label>
                  <select value={editForm.subscription_plan || ''} onChange={e => setEditForm(f => ({ ...f, subscription_plan: e.target.value }))} className="input">
                    <option value="">None</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="input">
                    <option value="subscriber">Subscriber</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Charity %: {editForm.charity_percent}</label>
                  <input type="range" min="10" max="100" step="5" value={editForm.charity_percent} onChange={e => setEditForm(f => ({ ...f, charity_percent: parseInt(e.target.value) }))} className="w-full accent-teal-400" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditUser(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={saveUser} className="btn-primary flex-1 justify-center">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </AdminLayout>
  );
}
