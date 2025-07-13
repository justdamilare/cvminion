import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Crown, 
  CreditCard, 
  Zap, 
  TrendingUp,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import { PlanComparison } from './PlanComparison';
import { subscriptionPlans } from '../../config/stripe';
import { SubscriptionTier } from '../../types/credits';
import { StripePaymentModal } from '../payments/StripePaymentModal';
import { toast } from 'react-hot-toast';

interface SimpleSubscriptionManagerProps {
  userId: string;
}

type TabType = 'overview' | 'plans';

export const SimpleSubscriptionManager: React.FC<SimpleSubscriptionManagerProps> = ({ 
  userId 
}) => {
  // Hooks
  const { 
    subscriptionTier, 
    billingCycleEnd, 
    loading, 
    refreshCredits,
    availableCredits,
    totalCredits
  } = useCredits(userId);

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  // Plan management handlers
  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedPlan(tier);
    setShowPaymentModal(true);
  };

  const handleDowngrade = async (tier: SubscriptionTier) => {
    // For now, just show a message - this would need proper implementation
    toast.info(`Downgrade to ${tier} - This feature will be implemented with full Stripe integration`);
  };

  // Payment success handler
  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    
    // Refresh credits data
    await refreshCredits();
    
    toast.success('Subscription updated successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading subscription details...</span>
      </div>
    );
  }

  const currentPlan = subscriptionPlans[subscriptionTier];

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
      icon: TrendingUp,
      description: 'Compare and change plans'
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
              Manage your subscription and monitor your usage
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Current Plan</p>
              <p className="text-white font-semibold">{currentPlan.name}</p>
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
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Current Plan Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Details */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Crown className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{currentPlan.name}</p>
                      <p className="text-gray-400">
                        {subscriptionTier === 'free' ? 'Free' : `$${currentPlan.price}/month`}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Monthly Credits</p>
                      <p className="text-lg font-semibold text-white">{currentPlan.credits} credits</p>
                    </div>
                    
                    {billingCycleEnd && (
                      <div>
                        <p className="text-sm text-gray-400">Next Billing Date</p>
                        <p className="text-white">{new Date(billingCycleEnd).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Zap className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-white">Usage Statistics</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Available Credits</p>
                      <p className="text-2xl font-bold text-primary">{availableCredits}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Total Credits Received</p>
                      <p className="text-lg font-semibold text-white">{totalCredits}</p>
                    </div>

                    <div className="pt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min((availableCredits / currentPlan.credits) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {availableCredits} of {currentPlan.credits} monthly credits remaining
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mt-6 bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Plan Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentPlan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade CTA */}
              {subscriptionTier !== 'pro' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium mb-1">Ready to upgrade?</h4>
                      <p className="text-gray-400 text-sm">
                        Get more credits and unlock premium features
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="p-6">
              <PlanComparison
                currentTier={subscriptionTier}
                onUpgrade={handleUpgrade}
                onDowngrade={handleDowngrade}
                loading={upgrading}
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
        }}
        userId={userId}
        mode="subscription"
        selectedPlan={selectedPlan || undefined}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};