import React, { useState } from 'react';
import { Crown, Star, CreditCard, X, Check } from 'lucide-react';
import { subscriptionPlans, SubscriptionTier } from '../../config/stripe';
import { StripePaymentModal } from '../payments/StripePaymentModal';

interface SubscriptionSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  selectedPlan: SubscriptionTier | null;
}

export const SubscriptionSetupModal: React.FC<SubscriptionSetupModalProps> = ({
  isOpen,
  onComplete,
  onSkip,
  selectedPlan: initialSelectedPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(
    initialSelectedPlan || 'plus'
  );
  const [showPayment, setShowPayment] = useState(false);

  if (!isOpen) return null;

  const handleSetupSubscription = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onComplete();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <StripePaymentModal
        isOpen={true}
        onClose={handlePaymentCancel}
        mode="subscription"
        selectedData={{
          name: subscriptionPlans[selectedPlan].name,
          price: subscriptionPlans[selectedPlan].price,
          credits: subscriptionPlans[selectedPlan].credits,
          stripePriceId: subscriptionPlans[selectedPlan].stripePriceId
        }}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-light rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Complete Your Subscription Setup
              </h2>
              <p className="text-gray-400">
                You selected the <span className="text-primary font-semibold capitalize">{selectedPlan}</span> plan. 
                Set up your subscription to get started.
              </p>
            </div>
            <button
              onClick={onSkip}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {Object.entries(subscriptionPlans)
              .filter(([key]) => key !== 'free')
              .map(([key, plan]) => {
                const planKey = key as SubscriptionTier;
                const isSelected = selectedPlan === planKey;
                const isPro = planKey === 'pro';
                const isPlus = planKey === 'plus';
                
                return (
                  <div
                    key={planKey}
                    onClick={() => setSelectedPlan(planKey)}
                    className={`
                      relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/10 scale-105' 
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }
                      ${isPro ? 'ring-2 ring-amber-400/30' : ''}
                    `}
                  >
                    {isPlus && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          RECOMMENDED
                        </span>
                      </div>
                    )}
                    
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-dark text-xs font-bold px-3 py-1 rounded-full">
                          ENTERPRISE
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {isPro ? (
                          <Crown className="w-8 h-8 text-amber-400" />
                        ) : (
                          <Star className="w-8 h-8 text-purple-400" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-bold text-white">
                              {formatPrice(plan.price)}
                            </span>
                            <span className="text-gray-400">/month</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-center py-2 px-4 bg-primary/20 rounded-lg border border-primary/30">
                          <span className="text-primary font-semibold text-lg">
                            {plan.credits} credits/month
                          </span>
                        </div>
                        
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {isSelected && (
                        <div className="w-full py-2 px-4 bg-primary text-dark font-semibold rounded-lg text-center">
                          Selected Plan
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Trial Information */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6 mb-8 border border-green-500/30">
            <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>14-Day Free Trial</span>
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Start using {subscriptionPlans[selectedPlan].name} plan immediately</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>No charges for 14 days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Cancel anytime during trial with no charges</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Full access to all {subscriptionPlans[selectedPlan].name} features</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              I'll do this later
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-semibold">
                  {formatPrice(subscriptionPlans[selectedPlan].price)}/month
                </div>
                <div className="text-xs text-green-400">
                  14-day free trial
                </div>
              </div>
              <button
                onClick={handleSetupSubscription}
                className="bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              By starting your trial, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};