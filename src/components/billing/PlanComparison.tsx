import React, { useState } from 'react';
import { 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Zap, 
  Star,
  Calculator,
  Clock,
  ArrowRight
} from 'lucide-react';
import { subscriptionPlans } from '../../config/stripe';
import { SubscriptionTier } from '../../types/credits';
import { formatCurrency, getTierUpgradeInfo } from '../../types/billing';

interface PlanComparisonProps {
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
  onDowngrade: (tier: SubscriptionTier) => void;
  loading?: boolean;
}

interface PlanFeatureComparison {
  feature: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
}

const featureComparisons: PlanFeatureComparison[] = [
  {
    feature: 'Monthly CV Generation Credits',
    free: '3 credits',
    plus: '30 credits',
    pro: '100 credits'
  },
  {
    feature: 'ATS Optimization',
    free: 'Basic',
    plus: 'Advanced',
    pro: 'Enterprise'
  },
  {
    feature: 'Template Library',
    free: 'Standard templates',
    plus: 'Premium templates',
    pro: 'All templates + custom'
  },
  {
    feature: 'Credit Rollover',
    free: 'Up to 6 credits',
    plus: 'Up to 60 credits',
    pro: 'Up to 200 credits'
  },
  {
    feature: 'Support',
    free: 'Email support',
    plus: 'Priority support',
    pro: 'Dedicated support'
  },
  {
    feature: 'Custom Branding',
    free: false,
    plus: true,
    pro: true
  },
  {
    feature: 'Export Formats',
    free: 'PDF only',
    plus: 'PDF, DOCX, ATS',
    pro: 'All formats'
  },
  {
    feature: 'Team Collaboration',
    free: false,
    plus: false,
    pro: true
  },
  {
    feature: 'Advanced Analytics',
    free: false,
    plus: false,
    pro: true
  },
  {
    feature: 'API Access',
    free: false,
    plus: false,
    pro: true
  }
];

export const PlanComparison: React.FC<PlanComparisonProps> = ({
  currentTier,
  onUpgrade,
  onDowngrade,
  loading = false
}) => {
  const [selectedComparison, setSelectedComparison] = useState<SubscriptionTier | null>(null);
  const [changeType, setChangeType] = useState<'immediate' | 'end_of_cycle'>('immediate');

  const handlePlanChange = (targetTier: SubscriptionTier) => {
    const { isUpgrade, isDowngrade } = getTierUpgradeInfo(currentTier, targetTier);
    
    // Check if Stripe Price ID is available for subscription upgrades
    if (isUpgrade && !subscriptionPlans[targetTier].stripePriceId) {
      alert(`Subscription upgrade to ${subscriptionPlans[targetTier].name} is temporarily unavailable. Please contact support for assistance.`);
      return;
    }
    
    if (isUpgrade) {
      onUpgrade(targetTier);
    } else if (isDowngrade) {
      onDowngrade(targetTier);
    }
  };

  const calculateSavings = (fromTier: SubscriptionTier, toTier: SubscriptionTier) => {
    const fromPrice = subscriptionPlans[fromTier].price;
    const toPrice = subscriptionPlans[toTier].price;
    const savings = fromPrice - toPrice;
    const percentage = fromPrice > 0 ? (savings / fromPrice) * 100 : 0;
    return { amount: savings, percentage };
  };

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return <Zap className="w-5 h-5" />;
      case 'plus': return <TrendingUp className="w-5 h-5" />;
      case 'pro': return <Crown className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'text-gray-400 border-gray-600';
      case 'plus': return 'text-blue-400 border-blue-500';
      case 'pro': return 'text-purple-400 border-purple-500';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="w-4 h-4 text-green-400" />
      ) : (
        <span className="text-gray-500 text-sm">—</span>
      );
    }
    return <span className="text-gray-300 text-sm">{value}</span>;
  };

  return (
    <div className="bg-dark-light rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Plan Comparison</h2>
        <p className="text-gray-400">Compare plans and upgrade or downgrade your subscription</p>
        
        {/* Temporary notice */}
        <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <span className="font-medium">Note:</span> Subscription upgrades are currently being configured. 
            Credit purchases are fully functional. Contact support for assistance with plan upgrades.
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {(Object.entries(subscriptionPlans) as [SubscriptionTier, typeof subscriptionPlans[SubscriptionTier]][]).map(([tier, plan]) => {
            const isCurrentPlan = tier === currentTier;
            const { isUpgrade, isDowngrade } = getTierUpgradeInfo(currentTier, tier);
            const planColor = getPlanColor(tier);
            const isUpgradeUnavailable = isUpgrade && !subscriptionPlans[tier].stripePriceId;
            
            return (
              <div 
                key={tier}
                className={`relative rounded-lg border-2 p-6 transition-all duration-200 ${
                  isCurrentPlan 
                    ? 'border-primary bg-primary/5' 
                    : `${planColor} hover:border-opacity-80 bg-gray-800/50 hover:bg-gray-800/70`
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-dark px-3 py-1 rounded-full text-sm font-bold">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Popular Badge for Plus */}
                {tier === 'plus' && !isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                    isCurrentPlan ? 'bg-primary text-dark' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {getPlanIcon(tier)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">
                      {tier === 'free' ? 'Free' : formatCurrency(plan.price)}
                    </span>
                    {tier !== 'free' && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {plan.credits} credits per month
                  </p>
                </div>

                {/* Key Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 5).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="text-center">
                  {isCurrentPlan ? (
                    <button 
                      disabled
                      className="w-full py-3 px-4 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlanChange(tier)}
                      disabled={loading || isUpgradeUnavailable}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        isUpgradeUnavailable
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : isUpgrade 
                          ? 'bg-primary text-dark hover:bg-primary-dark' 
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {loading ? (
                        'Processing...'
                      ) : isUpgradeUnavailable ? (
                        'Coming Soon'
                      ) : isUpgrade ? (
                        <span className="flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Upgrade to {plan.name}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 mr-2" />
                          Downgrade to {plan.name}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Savings Indicator */}
                {!isCurrentPlan && tier !== 'free' && (
                  <div className="mt-3 text-center">
                    {isUpgrade ? (
                      <p className="text-green-400 text-sm">
                        +{((plan.credits - subscriptionPlans[currentTier].credits) / subscriptionPlans[currentTier].credits * 100).toFixed(0)}% 
                        more credits
                      </p>
                    ) : currentTier !== 'free' && (
                      <p className="text-yellow-400 text-sm">
                        Save {formatCurrency(subscriptionPlans[currentTier].price - plan.price)}/month
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Feature Comparison */}
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Detailed Feature Comparison
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-gray-300 font-medium">Feature</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Free</th>
                  <th className="text-center p-4 text-blue-400 font-medium">Plus</th>
                  <th className="text-center p-4 text-purple-400 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {featureComparisons.map((comparison, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="p-4 text-gray-300 font-medium">{comparison.feature}</td>
                    <td className="p-4 text-center">{renderFeatureValue(comparison.free)}</td>
                    <td className="p-4 text-center">{renderFeatureValue(comparison.plus)}</td>
                    <td className="p-4 text-center">{renderFeatureValue(comparison.pro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Benefits */}
        {currentTier !== 'pro' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-2">Why Upgrade?</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Generate more CVs with higher credit limits</li>
                  <li>• Access premium templates and advanced ATS optimization</li>
                  <li>• Get priority support and faster response times</li>
                  {currentTier === 'free' && <li>• Custom branding and multiple export formats</li>}
                  {currentTier !== 'pro' && <li>• Team collaboration and advanced analytics (Pro only)</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};