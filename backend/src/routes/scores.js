const express = require('express');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');
const requireSubscription = require('../middleware/requireSubscription.js');

const router = express.Router();
router.use(requireAuth, requireSubscription);

// GET /api/scores
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// POST /api/scores
router.post('/', async (req, res) => {
  try {
    const { score, playedOn } = req.body;
    if (!score || !playedOn) return res.status(400).json({ error: 'Score and date are required' });
    const s = parseInt(score);
    if (s < 1 || s > 45) return res.status(400).json({ error: 'Score must be between 1 and 45' });

    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert({ user_id: req.user.id, score: s, played_on: playedOn })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add score' });
  }
});

// PUT /api/scores/:id
router.put('/:id', async (req, res) => {
  try {
    const { score, playedOn } = req.body;
    const updates = {};
    if (score !== undefined) updates.score = parseInt(score);
    if (playedOn !== undefined) updates.played_on = playedOn;

    const { data, error } = await supabaseAdmin
      .from('scores')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Score not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// DELETE /api/scores/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

module.exports = router;
