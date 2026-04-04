const express = require('express');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');

const router = express.Router();

// GET /api/charities
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    let query = supabaseAdmin.from('charities').select('*').eq('active', true).order('featured', { ascending: false });
    if (featured === 'true') query = query.eq('featured', true);
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charities' });
  }
});

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities').select('*').eq('id', req.params.id).eq('active', true).single();
    if (error) return res.status(404).json({ error: 'Charity not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charity' });
  }
});

// POST /api/charities/:id/donate
router.post('/:id/donate', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) < 10) return res.status(400).json({ error: 'Minimum donation is ₹10' });
    const now = new Date();
    const { data, error } = await supabaseAdmin.from('charity_contributions').insert({
      user_id: req.user.id,
      charity_id: req.params.id,
      amount: parseFloat(amount),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Donation recorded', contribution: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// PUT /api/charities/my-charity
router.put('/my-charity', requireAuth, async (req, res) => {
  try {
    const { charityId, charityPercent } = req.body;
    const updates = {};
    if (charityId !== undefined) updates.charity_id = charityId;
    if (charityPercent !== undefined) updates.charity_percent = parseInt(charityPercent);
    const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', req.user.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update charity settings' });
  }
});

module.exports = router;
