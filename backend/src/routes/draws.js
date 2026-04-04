const express = require('express');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');

const router = express.Router();

// GET /api/draws
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*, prize_pools(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
});

// GET /api/draws/my-entries
router.get('/my-entries', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draw_entries')
      .select('*, draws(id, month, year, draw_numbers, status), winner_verifications(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draw entries' });
  }
});

module.exports = router;
