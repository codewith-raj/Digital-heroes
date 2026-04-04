const Stripe = require('stripe');
const { supabaseAdmin } = require('../lib/supabase.js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function resolveUser(subscription) {
  // Primary: userId in subscription metadata (set since the metadata fix)
  const userId = subscription.metadata?.userId;
  if (userId) {
    const { data } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
    if (data) return data;
  }
  // Fallback: match by Stripe customer ID (handles subscriptions created before the fix)
  if (subscription.customer) {
    const { data } = await supabaseAdmin.from('users').select('*').eq('stripe_customer_id', subscription.customer).single();
    if (data) return data;
  }
  return null;
}

async function handleSubscriptionCreated(subscription) {
  const user = await resolveUser(subscription);
  if (!user) {
    console.warn(`⚠️ Could not resolve user for subscription ${subscription.id}`);
    return;
  }
  const plan = subscription.metadata?.plan || 'monthly';
  await supabaseAdmin.from('users').update({
    subscription_status: 'active',
    subscription_plan: plan,
    subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
  }).eq('id', user.id);
  console.log(`✅ Subscription activated for user ${user.id}`);
}

async function handleSubscriptionDeleted(subscription) {
  // Try by subscription_id first, then by customer
  const { data: bySubId } = await supabaseAdmin.from('users')
    .update({ subscription_status: 'cancelled', subscription_id: null })
    .eq('subscription_id', subscription.id)
    .select();
  if (!bySubId?.length && subscription.customer) {
    await supabaseAdmin.from('users')
      .update({ subscription_status: 'cancelled', subscription_id: null })
      .eq('stripe_customer_id', subscription.customer);
  }
}

async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;

  // Try to resolve user by subscription_id first, then by customer
  let user = null;
  const { data: bySubId } = await supabaseAdmin.from('users').select('*').eq('subscription_id', invoice.subscription).single();
  if (bySubId) {
    user = bySubId;
  } else if (invoice.customer) {
    const { data: byCust } = await supabaseAdmin.from('users').select('*').eq('stripe_customer_id', invoice.customer).single();
    if (byCust) user = byCust;
  }
  if (!user) {
    console.warn(`⚠️ handleInvoicePaid: no user found for subscription ${invoice.subscription}`);
    return;
  }

  await supabaseAdmin.from('users').update({
    subscription_status: 'active',
    subscription_id: invoice.subscription,
  }).eq('id', user.id);

  // Record charity contribution
  if (user.charity_id && user.charity_percent) {
    const planAmount = user.subscription_plan === 'yearly' ? 4999 / 12 : 499;
    const charityAmount = parseFloat((planAmount * (user.charity_percent / 100)).toFixed(2));
    const now = new Date();
    await supabaseAdmin.from('charity_contributions').insert({
      user_id: user.id,
      charity_id: user.charity_id,
      amount: charityAmount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    console.log(`💚 Charity contribution ₹${charityAmount} for user ${user.id}`);
  } else {
    console.log(`ℹ️ User ${user.id} has no charity set — skipping contribution recording`);
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
