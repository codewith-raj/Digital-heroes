const express = require('express');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, charityId } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      // Give a clear message if email already registered
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      }
      return res.status(400).json({ error: error.message });
    }

    // UPSERT the profile row — works whether the DB trigger fired or not
    const profileData = { id: data.user.id, email: data.user.email };
    if (name) profileData.name = name;
    if (charityId) profileData.charity_id = charityId;

    await supabaseAdmin.from('users').upsert(profileData, { onConflict: 'id' });

    res.status(201).json({
      user: { id: data.user.id, email: data.user.email },
      message: 'Account created successfully.',
    });
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

    // Always return success to prevent email enumeration
    if (error) console.error('Password reset error:', error.message);
    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { accessToken, newPassword } = req.body;
    if (!accessToken || !newPassword) {
      return res.status(400).json({ error: 'Access token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !user) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
