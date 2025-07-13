import React from 'react';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { subscriptionPlans } from '../../config/stripe';
import { SubscriptionDetails, UsageStats, CreditBalance } from '../../types/billing';
import { SubscriptionTier } from '../../types/credits';
import { formatDate, formatCurrency, getDaysUntil, getBillingStatusColor } from '../../types/billing';

interface CurrentPlanDisplayProps {
  subscription: SubscriptionDetails | null;
  currentTier: SubscriptionTier;
  usageStats: UsageStats | null;
  creditBalance: CreditBalance | null;
  billingCycleEnd: string;
  onCancelSubscription: () => void;
  onReactivateSubscription: () => void;
  cancelling?: boolean;
}

export const CurrentPlanDisplay: React.FC<CurrentPlanDisplayProps> = ({
  subscription,
  currentTier,
  usageStats,
  creditBalance,
  billingCycleEnd,
  onCancelSubscription,
  onReactivateSubscription,
  cancelling = false
}) => {
  const currentPlan = subscriptionPlans[currentTier];
  const daysUntilRenewal = getDaysUntil(billingCycleEnd);
  const isFreePlan = currentTier === 'free';
  const isCanceled = subscription?.cancel_at_period_end;
  const isPastDue = subscription?.status === 'past_due';

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-400';
    return getBillingStatusColor(status);
  };

  const getStatusText = (status?: string) => {
    if (isCanceled) return 'Canceling at period end';
    if (!status) return 'Free Plan';
    
    switch (status) {
      case 'active': return 'Active';
      case 'past_due': return 'Past Due';
      case 'canceled': return 'Canceled';
      case 'unpaid': return 'Payment Required';
      case 'trialing': return 'Trial';
      default: return status;
    }
  };

  const calculateUsagePercentage = () => {
    if (!creditBalance) return 0;
    const totalCredits = creditBalance.monthly_credits;
    const usedCredits = creditBalance.monthly_used;
    return totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;
  };

  const usagePercentage = calculateUsagePercentage();

  return (
    <div className="bg-dark-light rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-white">Current Plan</h2>
              <p className="text-gray-400 text-sm">Manage your subscription and usage</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentTier === 'free' ? 'bg-gray-700 text-gray-300' :
              currentTier === 'plus' ? 'bg-blue-600 text-white' :
              'bg-purple-600 text-white'
            }`}>
              {currentPlan.name}
            </span>
            <p className={`text-sm mt-1 ${getStatusColor(subscription?.status)}`}>
              {getStatusText(subscription?.status)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {isPastDue && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-medium">Payment Past Due</h4>
              <p className="text-red-300 text-sm mt-1">
                Your payment is past due. Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {isCanceled && (
        <div className="mx-6 mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-medium">Subscription Ending</h4>
              <p className="text-yellow-300 text-sm mt-1">
                Your subscription will end on {formatDate(billingCycleEnd)}. You can reactivate it anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Plan Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-4 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Plan Features
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                {currentPlan.credits} credits per month
              </li>
              {currentPlan.features.slice(0, 4).map((feature: string, index: number) => (
                <li key={index} className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Calendar className="w-4 h-4 text-primary mr-2" />
              Billing Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Price</span>
                <span className="text-white font-medium">
                  {isFreePlan ? 'Free' : formatCurrency(currentPlan.price)}
                  {!isFreePlan && <span className="text-gray-400">/month</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Next billing</span>
                <span className="text-white">
                  {isFreePlan ? 'N/A' : formatDate(billingCycleEnd)}
                </span>
              </div>
              {!isFreePlan && daysUntilRenewal >= 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Days remaining</span>
                  <span className="text-white font-medium">
                    {daysUntilRenewal} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {creditBalance && (
          <div>
            <h3 className="text-white font-medium mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 text-primary mr-2" />
              Credit Usage This Period
            </h3>
            
            <div className="space-y-4">
              {/* Monthly Credits Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Monthly Credits</span>
                  <span className="text-white">
                    {creditBalance.monthly_remaining} of {creditBalance.monthly_credits} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage > 90 ? 'bg-red-400' :
                      usagePercentage > 70 ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{creditBalance.monthly_used} used</span>
                  <span>{usagePercentage.toFixed(1)}% used</span>
                </div>
              </div>

              {/* Purchased Credits */}
              {creditBalance.purchased_credits > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Purchased Credits</span>
                    <span className="text-white">
                      {creditBalance.purchased_remaining} available
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {creditBalance.purchased_used} of {creditBalance.purchased_credits} used
                  </div>
                </div>
              )}

              {/* Total Available */}
              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total Available</span>
                  <span className="text-primary font-bold text-lg">
                    {creditBalance.total_available} credits
                  </span>
                </div>
              </div>

              {/* Expiring Credits Warning */}
              {creditBalance.expires_soon.length > 0 && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">Credits Expiring Soon</p>
                      <p className="text-yellow-300 text-xs mt-1">
                        {creditBalance.expires_soon.reduce((sum, item) => sum + item.amount, 0)} credits 
                        expire in the next 30 days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isFreePlan && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {isCanceled ? 'Want to continue your subscription?' : 'Need to cancel your subscription?'}
              </div>
              <div className="flex space-x-3">
                {isCanceled ? (
                  <button
                    onClick={onReactivateSubscription}
                    className="px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={onCancelSubscription}
                    disabled={cancelling}
                    className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};