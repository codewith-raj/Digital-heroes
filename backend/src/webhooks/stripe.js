const Stripe = require('stripe');
const { supabaseAdmin } = require('../lib/supabase.js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata?.userId;
  const plan   = subscription.metadata?.plan;
  if (!userId) return;
  await supabaseAdmin.from('users').update({
    subscription_status: 'active',
    subscription_plan: plan || 'monthly',
    subscription_id: subscription.id,
  }).eq('id', userId);
  console.log(`✅ Subscription activated for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription) {
  await supabaseAdmin.from('users')
    .update({ subscription_status: 'cancelled', subscription_id: null })
    .eq('subscription_id', subscription.id);
}

async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;
  const { data: user } = await supabaseAdmin.from('users').select('*').eq('subscription_id', invoice.subscription).single();
  if (!user) return;

  await supabaseAdmin.from('users').update({ subscription_status: 'active' }).eq('id', user.id);

  if (user.charity_id && user.charity_percent) {
    const planAmount = user.subscription_plan === 'yearly' ? 4999 / 12 : 499;
    const charityAmount = planAmount * (user.charity_percent / 100);
    const now = new Date();
    await supabaseAdmin.from('charity_contributions').insert({
      user_id: user.id, charity_id: user.charity_id,
      amount: charityAmount, month: now.getMonth() + 1, year: now.getFullYear(),
    });
    console.log(`💚 Charity contribution ₹${charityAmount.toFixed(2)} for user ${user.id}`);
  }
}

async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;
  await supabaseAdmin.from('users').update({ subscription_status: 'lapsed' }).eq('subscription_id', invoice.subscription);
  console.log(`⚠️ Payment failed for subscription ${invoice.subscription}`);
}

async function stripeWebhookHandler(req, res) {
  let event;
  try {
    if (webhookSecret && webhookSecret !== 'whsec_your-webhook-secret') {
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
      console.warn('⚠️ Stripe webhook: no signature verification (dev mode)');
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionCreated(event.data.object); break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object); break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object); break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object); break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

module.exports = stripeWebhookHandler;
