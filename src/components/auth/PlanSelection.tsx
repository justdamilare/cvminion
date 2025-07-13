import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { subscriptionPlans, SubscriptionTier } from '../../config/stripe';

interface PlanSelectionProps {
  selectedPlan: SubscriptionTier;
  onPlanSelect: (plan: SubscriptionTier) => void;
  onContinue: () => void;
}

const PlanIcon = ({ plan }: { plan: SubscriptionTier }) => {
  switch (plan) {
    case 'free':
      return <Zap className="w-6 h-6 text-blue-400" />;
    case 'plus':
      return <Star className="w-6 h-6 text-purple-400" />;
    case 'pro':
      return <Crown className="w-6 h-6 text-amber-400" />;
    default:
      return <Zap className="w-6 h-6 text-blue-400" />;
  }
};

const formatPrice = (price: number) => {
  return `$${(price / 100).toFixed(2)}`;
};

export const PlanSelection: React.FC<PlanSelectionProps> = ({
  selectedPlan,
  onPlanSelect,
  onContinue
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">Select the plan that works best for you</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(subscriptionPlans).map(([key, plan]) => {
          const planKey = key as SubscriptionTier;
          const isSelected = selectedPlan === planKey;
          const isPro = planKey === 'pro';
          const isPlus = planKey === 'plus';
          
          return (
            <div
              key={planKey}
              onClick={() => onPlanSelect(planKey)}
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
                    POPULAR
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

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <PlanIcon plan={planKey} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2">
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold text-primary">Free</span>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-white">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-400">/month</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="text-center">
                    <span className="text-primary font-semibold">
                      {plan.credits} credits/month
                    </span>
                  </div>
                  
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.features.length > 3 && (
                    <div className="text-center text-xs text-gray-400 mt-2">
                      +{plan.features.length - 3} more features
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {isSelected ? (
                    <div className="w-full py-2 px-4 bg-primary text-dark font-semibold rounded-lg text-center">
                      Selected
                    </div>
                  ) : (
                    <div className="w-full py-2 px-4 border border-gray-600 text-gray-300 font-semibold rounded-lg text-center hover:border-primary transition-colors">
                      Select Plan
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={onContinue}
          className="w-full md:w-auto px-8 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          Continue with {subscriptionPlans[selectedPlan].name} Plan
        </button>
        
        <p className="text-xs text-gray-400 mt-3">
          {selectedPlan === 'free' 
            ? 'You can upgrade anytime' 
            : 'Start your 14-day free trial • Cancel anytime'
          }
        </p>
      </div>
    </div>
  );
};