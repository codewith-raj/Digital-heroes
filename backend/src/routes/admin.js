const express = require('express');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');
const requireAdmin = require('../middleware/requireAdmin.js');
const { runDrawEngine } = require('../services/drawEngine.js');
const { calculatePrizePool } = require('../services/prizePool.js');
const { sendWinnerNotificationEmail } = require('../services/emailService.js');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// ── USERS ──────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = supabaseAdmin.from('users').select('*, charities(name)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    if (status) query = query.eq('subscription_status', status);
    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ users: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const allowed = ['name', 'subscription_status', 'subscription_plan', 'charity_id', 'charity_percent', 'role'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ── DRAWS ──────────────────────────────────────────────────────
router.get('/draws', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('draws').select('*, prize_pools(*)').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
});

router.post('/draws', async (req, res) => {
  try {
    const { month, year, drawType = 'random', rolloverAmount = 0 } = req.body;
    if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });
    const { data, error } = await supabaseAdmin.from('draws')
      .insert({ month: parseInt(month), year: parseInt(year), draw_type: drawType, rollover_amount: parseFloat(rolloverAmount) })
      .select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create draw' });
  }
});

router.post('/draws/:id/simulate', async (req, res) => {
  try {
    const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', req.params.id).single();
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    const type = req.body.drawType || draw.draw_type;
    const { drawNumbers, entries, pool } = await runDrawEngine(req.params.id, type);
    await supabaseAdmin.from('draws').update({ draw_numbers: drawNumbers, draw_type: type, status: 'simulated' }).eq('id', req.params.id);
    res.json({ drawNumbers, entries, pool, message: 'Simulation complete — review before publishing' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to simulate draw' });
  }
});

router.post('/draws/:id/publish', async (req, res) => {
  try {
    const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', req.params.id).single();
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ error: 'Draw already published' });

    let drawNumbers = draw.draw_numbers;
    if (!drawNumbers || drawNumbers.length === 0) {
      const result = await runDrawEngine(req.params.id, draw.draw_type);
      drawNumbers = result.drawNumbers;
      await supabaseAdmin.from('draws').update({ draw_numbers: drawNumbers }).eq('id', req.params.id);
    }

    const { entries, pool } = await runDrawEngine(req.params.id, draw.draw_type, drawNumbers);
    const jackpotRollover = entries.filter(e => e.matched === 5).length === 0;

    await supabaseAdmin.from('draws').update({ status: 'published', jackpot_rollover: jackpotRollover }).eq('id', req.params.id);

    for (const entry of entries) {
      if (entry.matched >= 3) {
        await supabaseAdmin.from('winner_verifications')
          .upsert({ draw_entry_id: entry.id, status: 'pending', payout_status: 'pending' }, { onConflict: 'draw_entry_id' });
        await sendWinnerNotificationEmail(entry.user_email, entry.user_name, entry.matched, entry.prize_amount);
      }
    }

    res.json({ message: 'Draw published successfully', jackpotRollover, totalWinners: entries.filter(e => e.matched >= 3).length, pool });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to publish draw' });
  }
});

router.get('/draws/:id/results', async (req, res) => {
  try {
    const { data: draw } = await supabaseAdmin.from('draws').select('*, prize_pools(*)').eq('id', req.params.id).single();
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    const { data: entries } = await supabaseAdmin.from('draw_entries')
      .select('*, users(name, email), winner_verifications(*)')
      .eq('draw_id', req.params.id).not('matched', 'is', null).order('matched', { ascending: false });
    res.json({ draw, winners: entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draw results' });
  }
});

// ── CHARITIES ─────────────────────────────────────────────────
router.get('/charities', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('charities').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charities' });
  }
});

router.post('/charities', async (req, res) => {
  try {
    const { name, description, featured = false, active = true, events = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Charity name is required' });
    const { data, error } = await supabaseAdmin.from('charities').insert({ name, description, featured, active, events }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create charity' });
  }
});

router.put('/charities/:id', async (req, res) => {
  try {
    const { name, description, featured, active, events, images } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (featured !== undefined) updates.featured = featured;
    if (active !== undefined) updates.active = active;
    if (events !== undefined) updates.events = events;
    if (images !== undefined) updates.images = images;
    const { data, error } = await supabaseAdmin.from('charities').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update charity' });
  }
});

router.delete('/charities/:id', async (req, res) => {
  try {
    // Soft-delete: deactivate the charity instead of hard-deleting
    // (users may still reference it via FK)
    const { data, error } = await supabaseAdmin.from('charities')
      .update({ active: false })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Charity not found' });
    res.json({ message: 'Charity deactivated', charity: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete charity' });
  }
});

// ── ADMIN SCORE MANAGEMENT ────────────────────────────────────
router.get('/users/:userId/scores', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('scores')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user scores' });
  }
});

router.put('/users/:userId/scores', async (req, res) => {
  try {
    const { scores } = req.body;
    if (!Array.isArray(scores)) return res.status(400).json({ error: 'Scores array is required' });

    const results = [];
    for (const s of scores) {
      if (!s.id) continue;
      const updates = {};
      if (s.score !== undefined) {
        const val = parseInt(s.score);
        if (val < 1 || val > 45) continue;
        updates.score = val;
      }
      if (s.played_on !== undefined) updates.played_on = s.played_on;
      if (Object.keys(updates).length === 0) continue;

      const { data, error } = await supabaseAdmin.from('scores')
        .update(updates)
        .eq('id', s.id)
        .eq('user_id', req.params.userId)
        .select()
        .single();
      if (!error && data) results.push(data);
    }
    res.json({ updated: results.length, scores: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user scores' });
  }
});

// ── WINNERS ───────────────────────────────────────────────────
router.get('/winners', async (req, res) => {
  try {
    const { status, payoutStatus } = req.query;
    let query = supabaseAdmin.from('winner_verifications')
      .select('*, draw_entries(*, users(name, email), draws(month, year, draw_numbers))')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (payoutStatus) query = query.eq('payout_status', payoutStatus);
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
});

router.put('/winners/:id', async (req, res) => {
  try {
    const { status, payoutStatus } = req.body;
    const updates = { reviewed_by: req.user.id };
    if (status) updates.status = status;
    if (payoutStatus) updates.payout_status = payoutStatus;
    const { data, error } = await supabaseAdmin.from('winner_verifications').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update winner verification' });
  }
});

// ── REPORTS ───────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: activeSubscribers },
      { data: charityTotals },
      { data: draws },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabaseAdmin.from('charity_contributions').select('charity_id, amount, charities(name)'),
      supabaseAdmin.from('draws').select('*').eq('status', 'published'),
    ]);

    const charityMap = {};
    (charityTotals || []).forEach(c => {
      const name = c.charities?.name || 'Unknown';
      charityMap[name] = (charityMap[name] || 0) + parseFloat(c.amount);
    });

    const estimatedPool = (activeSubscribers || 0) * 499 * 0.20;

    res.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      totalDraws: draws?.length || 0,
      estimatedMonthlyPool: estimatedPool,
      charityTotals: charityMap,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

module.exports = router;
