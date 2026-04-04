import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Heart, ExternalLink } from 'lucide-react';
import { charitiesAPI } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';
import toast from 'react-hot-toast';

export default function CharityProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonateForm, setShowDonateForm] = useState(false);

  useEffect(() => {
    charitiesAPI.getById(id)
      .then(r => setCharity(r.data))
      .catch(() => navigate('/charities'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDonate() {
    if (!user) return navigate('/login');
    if (!donationAmount || parseFloat(donationAmount) < 10) return toast.error('Minimum donation is ₹10');
    setDonating(true);
    try {
      await charitiesAPI.donate(id, { amount: parseFloat(donationAmount) });
      toast.success(`₹${donationAmount} donated to ${charity.name}!`);
      setShowDonateForm(false);
      setDonationAmount('');
    } catch (err) {
      toast.error(err.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!charity) return null;

  const events = Array.isArray(charity.events) ? charity.events : (charity.events ? JSON.parse(charity.events) : []);

  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />

      <div className="section pt-28 pb-20">
        <Link to="/charities" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Charities
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div className="glass p-8 mb-6">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-navy-800 flex items-center justify-center text-4xl flex-shrink-0">
                    💚
                  </div>
                  <div>
                    {charity.featured && <span className="badge-amber mb-2">⭐ Featured Partner</span>}
                    <h1 className="text-3xl font-bold font-display text-white mt-2">{charity.name}</h1>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{charity.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                  <div>
                    <div className="stat-value text-2xl text-green-400">
                      ₹{(charity.totalRaised || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="stat-label">Total Raised</div>
                  </div>
                  <div>
                    <div className="stat-value text-2xl">{events.length}</div>
                    <div className="stat-label">Events</div>
                  </div>
                  <div>
                    <div className="stat-value text-2xl text-amber-400">Active</div>
                    <div className="stat-label">Status</div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {charity.images?.length > 0 && (
                <div className="glass p-6 mb-6">
                  <h2 className="text-lg font-bold text-white mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {charity.images.slice(0, 4).map((img, i) => (
                      <img key={i} src={img} alt={`${charity.name} ${i + 1}`} className="rounded-xl w-full h-36 object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {events.length > 0 && (
                <div className="glass p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Upcoming Events</h2>
                  <div className="space-y-4">
                    {events.map((event, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                            {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                          </div>
                          {event.description && <p className="text-slate-400 text-sm mt-2">{event.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Donate card */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-2">Support This Charity</h3>
              <p className="text-slate-400 text-sm mb-6">Make a one-off donation or select this charity as your subscription beneficiary.</p>

              {!showDonateForm ? (
                <div className="space-y-3">
                  <button onClick={() => setShowDonateForm(true)} className="btn-primary w-full justify-center">
                    <Heart className="w-4 h-4" /> Donate Now
                  </button>
                  <Link to="/signup" className="btn-secondary w-full justify-center text-sm">
                    Choose via Subscription
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map(amt => (
                      <button key={amt} onClick={() => setDonationAmount(String(amt))}
                        className={`py-2 rounded-xl text-sm font-medium transition-all ${donationAmount === String(amt) ? 'bg-teal-500 text-navy-950' : 'glass text-slate-300 hover:text-white'}`}>
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    placeholder="Custom amount (₹)"
                    className="input"
                    min="10"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowDonateForm(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                    <button onClick={handleDonate} disabled={donating} className="btn-primary flex-1 justify-center">
                      {donating ? 'Donating...' : `Donate ₹${donationAmount || '0'}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Impact */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold text-white mb-4">Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-slate-400 text-sm">Total Raised</span>
                  <span className="text-green-400 font-semibold">₹{charity.totalRaised?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-slate-400 text-sm">Events Hosted</span>
                  <span className="text-white font-semibold">{events.length}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-400 text-sm">Partner Status</span>
                  <span className="badge-green">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
