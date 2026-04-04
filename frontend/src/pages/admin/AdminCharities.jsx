import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, Star, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../lib/api.js';
import AdminLayout from '../../components/AdminLayout.jsx';
import toast from 'react-hot-toast';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', featured: false, active: true, events: [] });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' });

  useEffect(() => { fetchCharities(); }, []);

  async function fetchCharities() {
    setLoading(true);
    try {
      const { data } = await adminAPI.getCharities();
      setCharities(data || []);
    } catch (err) {
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(c) {
    setEditId(c.id);
    setForm({ name: c.name, description: c.description || '', featured: c.featured, active: c.active, events: Array.isArray(c.events) ? c.events : [] });
    setShowForm(true);
  }

  function startCreate() {
    setEditId(null);
    setForm({ name: '', description: '', featured: false, active: true, events: [] });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return toast.error('Charity name is required');
    try {
      if (editId) {
        await adminAPI.updateCharity(editId, form);
        toast.success('Charity updated!');
      } else {
        await adminAPI.createCharity(form);
        toast.success('Charity created!');
      }
      setShowForm(false);
      fetchCharities();
    } catch (err) {
      toast.error(err.message || 'Failed to save charity');
    }
  }

  async function toggleActive(id, currentActive) {
    try {
      await adminAPI.updateCharity(id, { active: !currentActive });
      toast.success(currentActive ? 'Charity deactivated' : 'Charity activated');
      fetchCharities();
    } catch (err) {
      toast.error('Failed to update charity');
    }
  }

  async function toggleFeatured(id, currentFeatured) {
    try {
      await adminAPI.updateCharity(id, { featured: !currentFeatured });
      toast.success(currentFeatured ? 'Removed from featured' : 'Marked as featured');
      fetchCharities();
    } catch (err) {
      toast.error('Failed to update charity');
    }
  }

  async function deleteCharity(id, name) {
    if (!confirm(`Deactivate "${name}"? This will hide it from public view.`)) return;
    try {
      await adminAPI.deleteCharity(id);
      toast.success('Charity deactivated');
      fetchCharities();
    } catch (err) {
      toast.error(err.message || 'Failed to delete charity');
    }
  }

  function addEvent() {
    if (!newEvent.title || !newEvent.date) return toast.error('Event title and date required');
    setForm(f => ({ ...f, events: [...f.events, { ...newEvent }] }));
    setNewEvent({ title: '', date: '', location: '', description: '' });
  }

  function removeEvent(i) {
    setForm(f => ({ ...f, events: f.events.filter((_, idx) => idx !== i) }));
  }

  return (
    <AdminLayout title="Charity Management" subtitle={`${charities.length} charities in system`}>
        <div className="flex items-center justify-end mb-6">
          <button onClick={startCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Charity
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold">{editId ? 'Edit Charity' : 'Add New Charity'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Charity Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Green Earth Foundation" required />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-amber-400" />
                    <span className="text-slate-300 text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-teal-400" />
                    <span className="text-slate-300 text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input resize-none" placeholder="Describe the charity's mission and impact..." />
              </div>

              {/* Events section */}
              <div>
                <label className="label">Events</label>
                {form.events.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.events.map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="flex-1 text-sm text-slate-300">
                          <span className="font-medium">{ev.title}</span> · {ev.date}
                          {ev.location && <span className="text-slate-500"> · {ev.location}</span>}
                        </div>
                        <button type="button" onClick={() => removeEvent(i)} className="text-red-400 hover:text-red-300">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3 p-4 bg-white/3 rounded-xl border border-white/5">
                  <input type="text" value={newEvent.title} onChange={e => setNewEvent(f => ({ ...f, title: e.target.value }))} placeholder="Event title" className="input text-sm" />
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(f => ({ ...f, date: e.target.value }))} className="input text-sm" />
                  <input type="text" value={newEvent.location} onChange={e => setNewEvent(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="input text-sm" />
                  <button type="button" onClick={addEvent} className="btn-secondary text-sm justify-center">
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  <Check className="w-4 h-4" /> {editId ? 'Update' : 'Create'} Charity
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Charities list */}
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass h-20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {charities.map(c => (
              <div key={c.id} className={`glass p-5 flex items-center gap-4 ${!c.active ? 'opacity-50' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {c.featured && <span className="badge-amber">⭐ Featured</span>}
                    {!c.active && <span className="badge-slate">Inactive</span>}
                    <span className="text-white font-medium">{c.name}</span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-1">{c.description}</p>
                  <p className="text-slate-500 text-xs mt-1">{(Array.isArray(c.events) ? c.events : []).length} events</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleFeatured(c.id, c.featured)} title={c.featured ? 'Remove featured' : 'Mark featured'}
                    className={`p-2 rounded-lg transition-colors ${c.featured ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'}`}>
                    <Star className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(c.id, c.active)} title={c.active ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition-colors ${c.active ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-teal-400 hover:bg-teal-500/10'}`}>
                    {c.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(c)}
                    className="p-2 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {c.active && (
                    <button onClick={() => deleteCharity(c.id, c.name)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </AdminLayout>
  );
}
