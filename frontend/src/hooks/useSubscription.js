import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../lib/api.js';
import { useAuth } from './useAuth.jsx';

export function useSubscription() {
  const { profile, isSubscribed } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const subscriptionStatus = profile?.subscription_status || 'inactive';
  const plan = profile?.subscription_plan;

  async function createCheckout(selectedPlan) {
    setLoading(true);
    try {
      const { data } = await subscriptionsAPI.createCheckout(selectedPlan);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function cancelSubscription() {
    setLoading(true);
    try {
      await subscriptionsAPI.cancel();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const statusLabel = {
    active: 'Active',
    inactive: 'Inactive',
    lapsed: 'Payment Failed',
    cancelled: 'Cancelled',
  }[subscriptionStatus] || 'Unknown';

  const statusColor = {
    active: 'green',
    inactive: 'slate',
    lapsed: 'amber',
    cancelled: 'red',
  }[subscriptionStatus] || 'slate';

  return {
    subscriptionStatus,
    plan,
    isSubscribed,
    statusLabel,
    statusColor,
    loading,
    createCheckout,
    cancelSubscription,
  };
}

export default useSubscription;
