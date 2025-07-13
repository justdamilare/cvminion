import React, { useState, useEffect } from 'react';
import { Crown, CreditCard, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { subscriptionPlans } from '../../config/stripe';
import { useCredits } from '../../hooks/useCredits';
import { StripePaymentModal } from '../payments/StripePaymentModal';
import { toast } from 'react-hot-toast';

interface SubscriptionManagerProps {
  userId: string;
}

interface SubscriptionInfo {
  tier: keyof typeof subscriptionPlans;
  billing_cycle_end: string;
  is_active: boolean;
  stripe_subscription_id?: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const { subscriptionTier, billingCycleEnd, loading, refreshCredits } = useCredits(userId);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof subscriptionPlans | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchSubscriptionInfo();
    }
  }, [userId]);

  const fetchSubscriptionInfo = async () => {
    try {
      setLoadingSubscription(true);
      const supabase = (await import('../../lib/supabase')).getSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, billing_cycle_end, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      setSubscriptionInfo(data as SubscriptionInfo || {
        tier: 'free',
        billing_cycle_end: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleUpgrade = (planKey: keyof typeof subscriptionPlans) => {
    setSelectedPlan(planKey);
    setShowPaymentModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionInfo?.stripe_subscription_id) {
      toast.error('No active subscription to cancel');
      return;
    }

    setCancelling(true);
    try {
      const supabase = (await import('../../lib/supabase')).getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call Edge Function to cancel subscription
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscriptionInfo.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      await fetchSubscriptionInfo();
      await refreshCredits();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || loadingSubscription) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading subscription details...</span>
      </div>
    );
  }

  const currentPlan = subscriptionPlans[subscriptionTier];

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-dark-light rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-white">Current Subscription</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscriptionTier === 'free' ? 'bg-gray-700 text-gray-300' :
            subscriptionTier === 'plus' ? 'bg-blue-600 text-white' :
            'bg-purple-600 text-white'
          }`}>
            {currentPlan.name}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-2">Plan Details</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                {currentPlan.credits} credits per month
              </li>
                             {currentPlan.features.slice(0, 3).map((feature: string, index: number) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2">Billing Information</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {subscriptionTier === 'free' 
                    ? 'Free plan' 
                    : `$${(currentPlan.price / 100).toFixed(2)}/month`
                  }
                </span>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                <span>
                  Next billing: {subscriptionTier === 'free' ? 'N/A' : formatDate(billingCycleEnd)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {subscriptionTier !== 'free' && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-dark-light rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Available Plans</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(subscriptionPlans)
            .filter(([key]) => key !== subscriptionTier && key !== 'free')
            .map(([key, plan]) => (
              <div key={key} className="border border-gray-600 rounded-lg p-6 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                    <p className="text-gray-400">{plan.credits} credits/month</p>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-bold text-2xl">
                      ${(plan.price / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-2 text-gray-400 mb-6">
                  {plan.features.slice(0, 4).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(key as keyof typeof subscriptionPlans)}
                  className="w-full bg-primary text-dark py-2 px-4 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  {subscriptionTier === 'free' ? 'Upgrade' : 'Switch Plan'}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Payment Modal */}
      <StripePaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }}
        userId={userId}
        mode="subscription"
        selectedPlan={selectedPlan || undefined}
        onSuccess={async () => {
          await fetchSubscriptionInfo();
          await refreshCredits();
          toast.success('Subscription updated successfully!');
        }}
      />
    </div>
  );
}; 
