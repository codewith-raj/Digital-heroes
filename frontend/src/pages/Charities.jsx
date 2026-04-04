import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Heart, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { charitiesAPI } from '../lib/api.js';
import Navbar from '../components/Navbar.jsx';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | featured

  useEffect(() => {
    fetchCharities();
  }, [filter]);

  async function fetchCharities() {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'featured') params.featured = 'true';
      const { data } = await charitiesAPI.getAll(params);
      setCharities(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const icons = ['🌱', '📚', '💧', '💪', '🐾', '🏥', '🎓', '🏘️'];

  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="section relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-teal mb-4">💚 Partner Charities</span>
            <h1 className="text-5xl lg:text-6xl font-bold font-display text-white mt-4 mb-4">
              Choose Your <span className="gradient-text">Impact</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every subscription automatically funds your chosen charity. Browse our verified partners and see the impact your golf game creates.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search charities by name or cause..."
                className="input pl-12 py-4 text-base"
              />
            </div>

            <div className="flex justify-center gap-3 mt-4">
              {['all', 'featured'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-teal-500 text-navy-950' : 'glass text-slate-400 hover:text-white'}`}>
                  {f === 'all' ? 'All Charities' : '⭐ Featured'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Charity grid */}
      <section className="section pb-24">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No charities found</h3>
            <p className="text-slate-400">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/charities/${c.id}`} className="card block group hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300">
                  {/* Image placeholder / gradient */}
                  <div className="h-36 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-teal-500/10 to-navy-800 flex items-center justify-center relative">
                    {c.images?.[0] ? (
                      <img src={c.images[0]} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">{icons[i % icons.length]}</span>
                    )}
                    {c.featured && (
                      <div className="absolute top-3 right-3 badge-amber">⭐ Featured</div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">{c.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{c.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Heart className="w-4 h-4" />
                      <span>{(c.events || []).length} events</span>
                    </div>
                    <span className="text-teal-400 font-medium flex items-center gap-1">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
