import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { 
  SubscriptionDetails, 
  BillingHistory, 
  PaymentMethod, 
  UsageStats, 
  CreditBalance,
  SubscriptionChange
} from '../types/billing';
import { SubscriptionTier } from '../types/credits';
import { toast } from 'react-hot-toast';

interface UseSubscriptionReturn {
  // Subscription data
  subscription: SubscriptionDetails | null;
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  usageStats: UsageStats | null;
  creditBalance: CreditBalance | null;
  pendingChanges: SubscriptionChange[];
  
  // Loading states
  loading: boolean;
  billingHistoryLoading: boolean;
  paymentMethodsLoading: boolean;
  usageStatsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshSubscription: () => Promise<void>;
  refreshBillingHistory: () => Promise<void>;
  refreshPaymentMethods: () => Promise<void>;
  refreshUsageStats: () => Promise<void>;
  refreshCreditBalance: () => Promise<void>;
  
  // Subscription management
  cancelSubscription: (cancelAtPeriodEnd?: boolean) => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  updateSubscription: (newTier: SubscriptionTier) => Promise<void>;
  
  // Payment method management
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  
  // Billing
  downloadInvoice: (invoiceId: string) => Promise<void>;
  retryPayment: (invoiceId: string) => Promise<void>;
}

export const useSubscription = (userId?: string): UseSubscriptionReturn => {
  // State
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [pendingChanges, setPendingChanges] = useState<SubscriptionChange[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [usageStatsLoading, setUsageStatsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Refresh functions
  const refreshSubscription = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          stripe_subscription_id,
          stripe_customer_id
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data as SubscriptionDetails);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshBillingHistory = useCallback(async () => {
    if (!userId) return;

    try {
      setBillingHistoryLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBillingHistory(data || []);
    } catch (err) {
      console.error('Error fetching billing history:', err);
      toast.error('Failed to load billing history');
    } finally {
      setBillingHistoryLoading(false);
    }
  }, [userId]);

  const refreshPaymentMethods = useCallback(async () => {
    if (!userId) return;

    try {
      setPaymentMethodsLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      toast.error('Failed to load payment methods');
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, [userId]);

  const refreshUsageStats = useCallback(async () => {
    if (!userId) return;

    try {
      setUsageStatsLoading(true);
      const supabase = getSupabaseClient();
      
      // Get current billing period usage
      const { data, error } = await supabase.rpc('get_usage_stats', {
        user_uuid: userId
      });

      if (error) throw error;
      setUsageStats(data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      toast.error('Failed to load usage statistics');
    } finally {
      setUsageStatsLoading(false);
    }
  }, [userId]);

  const refreshCreditBalance = useCallback(async () => {
    if (!userId) return;

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.rpc('get_credit_balance', {
        user_uuid: userId
      });

      if (error) throw error;
      setCreditBalance(data);
    } catch (err) {
      console.error('Error fetching credit balance:', err);
      toast.error('Failed to load credit balance');
    }
  }, [userId]);

  // Subscription management functions
  const cancelSubscription = useCallback(async (cancelAtPeriodEnd: boolean = true) => {
    if (!subscription?.stripe_subscription_id || !userId) {
      toast.error('No active subscription to cancel');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
          cancel_at_period_end: cancelAtPeriodEnd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success(
        cancelAtPeriodEnd 
          ? 'Subscription will be canceled at the end of the billing period'
          : 'Subscription canceled immediately'
      );
      
      await refreshSubscription();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast.error('Failed to cancel subscription');
    }
  }, [subscription, userId, refreshSubscription]);

  const reactivateSubscription = useCallback(async () => {
    if (!subscription?.stripe_subscription_id || !userId) {
      toast.error('No subscription to reactivate');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      toast.success('Subscription reactivated successfully');
      await refreshSubscription();
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      toast.error('Failed to reactivate subscription');
    }
  }, [subscription, userId, refreshSubscription]);

  const updateSubscription = useCallback(async (newTier: SubscriptionTier) => {
    if (!subscription?.stripe_subscription_id || !userId) {
      toast.error('No active subscription to update');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/update-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
          new_tier: newTier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      toast.success(`Subscription updated to ${newTier} plan`);
      await refreshSubscription();
    } catch (err) {
      console.error('Error updating subscription:', err);
      toast.error('Failed to update subscription');
    }
  }, [subscription, userId, refreshSubscription]);

  // Payment method management
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!userId) return;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/set-default-payment-method`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }

      toast.success('Default payment method updated');
      await refreshPaymentMethods();
    } catch (err) {
      console.error('Error setting default payment method:', err);
      toast.error('Failed to update default payment method');
    }
  }, [userId, refreshPaymentMethods]);

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!userId) return;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/remove-payment-method`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }

      toast.success('Payment method removed');
      await refreshPaymentMethods();
    } catch (err) {
      console.error('Error removing payment method:', err);
      toast.error('Failed to remove payment method');
    }
  }, [userId, refreshPaymentMethods]);

  // Billing functions
  const downloadInvoice = useCallback(async (invoiceId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/download-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice');
    }
  }, []);

  const retryPayment = useCallback(async (invoiceId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/retry-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry payment');
      }

      toast.success('Payment retry initiated');
      await refreshBillingHistory();
    } catch (err) {
      console.error('Error retrying payment:', err);
      toast.error('Failed to retry payment');
    }
  }, [refreshBillingHistory]);

  // Effects
  useEffect(() => {
    if (userId) {
      refreshSubscription();
      refreshCreditBalance();
    }
  }, [userId, refreshSubscription, refreshCreditBalance]);

  // Real-time subscription updates
  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    const subscription = supabase
      .channel('subscription-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_subscriptions', 
          filter: `user_id=eq.${userId}` 
        }, 
        () => {
          refreshSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, refreshSubscription]);

  return {
    // Data
    subscription,
    billingHistory,
    paymentMethods,
    usageStats,
    creditBalance,
    pendingChanges,
    
    // Loading states
    loading,
    billingHistoryLoading,
    paymentMethodsLoading,
    usageStatsLoading,
    
    // Error state
    error,
    
    // Refresh functions
    refreshSubscription,
    refreshBillingHistory,
    refreshPaymentMethods,
    refreshUsageStats,
    refreshCreditBalance,
    
    // Subscription management
    cancelSubscription,
    reactivateSubscription,
    updateSubscription,
    
    // Payment method management
    setDefaultPaymentMethod,
    removePaymentMethod,
    
    // Billing
    downloadInvoice,
    retryPayment,
  };
};