import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Crown, 
  CreditCard, 
  Zap, 
  BarChart3,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import { useSubscription } from '../../hooks/useSubscription';
import { CurrentPlanDisplay } from './CurrentPlanDisplay';
import { PlanComparison } from './PlanComparison';
import { BillingManagement } from './BillingManagement';
import { CreditManagement } from './CreditManagement';
import { StripePaymentModal } from '../payments/StripePaymentModal';
import { subscriptionPlans, creditPackages } from '../../config/stripe';
import { SubscriptionTier, CreditTransaction } from '../../types/credits';
import { toast } from 'react-hot-toast';

interface EnhancedSubscriptionManagerProps {
  userId: string;
}

type TabType = 'overview' | 'plans' | 'billing' | 'credits';

export const EnhancedSubscriptionManager: React.FC<EnhancedSubscriptionManagerProps> = ({ 
  userId 
}) => {
  // Hooks
  const { 
    subscriptionTier, 
    billingCycleEnd, 
    loading: creditsLoading, 
    refreshCredits,
    availableCredits,
    totalCredits
  } = useCredits(userId);
  
  const {
    subscription,
    billingHistory,
    paymentMethods,
    usageStats,
    creditBalance,
    loading: subscriptionLoading,
    billingHistoryLoading,
    paymentMethodsLoading,
    refreshSubscription,
    refreshBillingHistory,
    refreshPaymentMethods,
    refreshUsageStats,
    refreshCreditBalance,
    cancelSubscription,
    reactivateSubscription,
    updateSubscription,
    setDefaultPaymentMethod,
    removePaymentMethod,
    downloadInvoice,
    retryPayment
  } = useSubscription(userId);

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'subscription' | 'credits'>('subscription');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Load additional data on mount
  useEffect(() => {
    if (userId) {
      refreshBillingHistory();
      refreshPaymentMethods();
      refreshUsageStats();
      loadCreditTransactions();
    }
  }, [userId, refreshBillingHistory, refreshPaymentMethods, refreshUsageStats]);

  const loadCreditTransactions = async () => {
    if (!userId) return;
    
    try {
      setTransactionsLoading(true);
      const supabase = (await import('../../lib/supabase')).getSupabaseClient();
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCreditTransactions(data || []);
    } catch (error) {
      console.error('Error loading credit transactions:', error);
      toast.error('Failed to load credit transaction history');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Plan management handlers
  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedPlan(tier);
    setPaymentMode('subscription');
    setShowPaymentModal(true);
  };

  const handleDowngrade = async (tier: SubscriptionTier) => {
    try {
      await updateSubscription(tier);
      await refreshSubscription();
      await refreshCredits();
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await cancelSubscription(true); // Cancel at period end
      await refreshSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscription();
      await refreshSubscription();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  // Credit management handlers
  const handlePurchaseCredits = (packageId: string) => {
    setSelectedCreditPackage(packageId);
    setPaymentMode('credits');
    setShowPaymentModal(true);
  };

  const handleRefreshCredits = async () => {
    await Promise.all([
      refreshCredits(),
      refreshCreditBalance(),
      loadCreditTransactions()
    ]);
  };

  // Payment method handlers
  const handleAddPaymentMethod = () => {
    // This would typically open a payment method setup modal
    toast.info('Payment method setup functionality would be implemented here');
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      await removePaymentMethod(paymentMethodId);
    } catch (error) {
      console.error('Error removing payment method:', error);
    }
  };

  // Payment success handler
  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setSelectedCreditPackage(null);
    
    // Refresh all data
    await Promise.all([
      refreshSubscription(),
      refreshCredits(),
      refreshCreditBalance(),
      refreshBillingHistory(),
      loadCreditTransactions()
    ]);
    
    toast.success(
      paymentMode === 'subscription' 
        ? 'Subscription updated successfully!' 
        : 'Credits purchased successfully!'
    );
  };

  const isLoading = creditsLoading || subscriptionLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading subscription details...</span>
      </div>
    );
  }

  const tabConfig = [
    {
      id: 'overview' as TabType,
      name: 'Overview',
      icon: Crown,
      description: 'Current plan and usage'
    },
    {
      id: 'plans' as TabType,
      name: 'Plans',
      icon: BarChart3,
      description: 'Compare and change plans'
    },
    {
      id: 'billing' as TabType,
      name: 'Billing',
      icon: CreditCard,
      description: 'Payment methods and history'
    },
    {
      id: 'credits' as TabType,
      name: 'Credits',
      icon: Zap,
      description: 'Manage and buy credits'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-light rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Subscription Management</h1>
            <p className="text-gray-400">
              Manage your subscription, billing, and credits all in one place
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Current Plan</p>
              <p className="text-white font-semibold">{subscriptionPlans[subscriptionTier].name}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Available Credits</p>
              <p className="text-primary font-bold text-lg">{availableCredits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-dark-light rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-700">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{tab.name}</p>
                    <p className="text-xs text-gray-500">{tab.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="p-6">
              <CurrentPlanDisplay
                subscription={subscription}
                currentTier={subscriptionTier}
                usageStats={usageStats}
                creditBalance={creditBalance}
                billingCycleEnd={billingCycleEnd}
                onCancelSubscription={handleCancelSubscription}
                onReactivateSubscription={handleReactivateSubscription}
                cancelling={cancelling}
              />
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="p-6">
              <PlanComparison
                currentTier={subscriptionTier}
                onUpgrade={handleUpgrade}
                onDowngrade={handleDowngrade}
                loading={subscriptionLoading}
              />
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="p-6">
              <BillingManagement
                billingHistory={billingHistory}
                paymentMethods={paymentMethods}
                onDownloadInvoice={downloadInvoice}
                onRetryPayment={retryPayment}
                onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
                onRemovePaymentMethod={handleRemovePaymentMethod}
                onAddPaymentMethod={handleAddPaymentMethod}
                billingHistoryLoading={billingHistoryLoading}
                paymentMethodsLoading={paymentMethodsLoading}
              />
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="p-6">
              <CreditManagement
                creditBalance={creditBalance}
                creditTransactions={creditTransactions}
                onPurchaseCredits={handlePurchaseCredits}
                onRefreshCredits={handleRefreshCredits}
                loading={creditsLoading}
                transactionsLoading={transactionsLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <StripePaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
          setSelectedCreditPackage(null);
        }}
        userId={userId}
        mode={paymentMode}
        selectedPlan={selectedPlan || undefined}
        selectedCredits={
          selectedCreditPackage 
            ? creditPackages.find(pkg => pkg.id === selectedCreditPackage)?.credits
            : undefined
        }
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};