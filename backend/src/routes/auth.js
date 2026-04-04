const express = require('express');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, charityId } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Update profile with name and charity
    const updates = {};
    if (name) updates.name = name;
    if (charityId) updates.charity_id = charityId;
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from('users').update(updates).eq('id', data.user.id);
    }

    res.status(201).json({ user: { id: data.user.id, email: data.user.email }, message: 'Account created. Please sign in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// GET /api/auth/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*, charities(id, name, description)')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const allowed = ['name', 'charity_id', 'charity_percent'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
