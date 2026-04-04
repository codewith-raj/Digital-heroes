const express = require('express');
const Stripe = require('stripe');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PLANS = {
  monthly: { priceId: process.env.STRIPE_MONTHLY_PRICE_ID, label: '₹499/month' },
  yearly:  { priceId: process.env.STRIPE_YEARLY_PRICE_ID,  label: '₹4,999/year' },
};

// POST /api/subscriptions/create-checkout
router.post('/create-checkout', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan. Choose monthly or yearly.' });

    let customerId = req.user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?subscribed=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#pricing?cancelled=true`,
      metadata: { userId: req.user.id, plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// GET /api/subscriptions/status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('subscription_status, subscription_plan, subscription_id, charity_percent')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    let renewalDate = null;
    if (data.subscription_id && data.subscription_status === 'active') {
      try {
        const sub = await stripe.subscriptions.retrieve(data.subscription_id);
        renewalDate = new Date(sub.current_period_end * 1000).toISOString();
      } catch (_) {}
    }

    res.json({ ...data, renewalDate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// POST /api/subscriptions/cancel
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabaseAdmin.from('users').select('subscription_id').eq('id', req.user.id).single();
    if (!user?.subscription_id) return res.status(400).json({ error: 'No active subscription to cancel' });

    await stripe.subscriptions.cancel(user.subscription_id);
    await supabaseAdmin.from('users').update({ subscription_status: 'cancelled' }).eq('id', req.user.id);

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
