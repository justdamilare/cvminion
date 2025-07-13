import { SubscriptionTier } from './credits';

export interface BillingHistory {
  id: string;
  user_id: string;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoice_url?: string;
  invoice_pdf?: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
  };
  bank_account?: {
    bank_name?: string;
    last4: string;
    account_type: string;
  };
  is_default: boolean;
  created_at: string;
}

export interface SubscriptionDetails {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_end?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  period_start: string;
  period_end: string;
  credits_used: number;
  credits_allocated: number;
  usage_percentage: number;
  daily_usage: Array<{
    date: string;
    credits_used: number;
  }>;
}

export interface CreditBalance {
  monthly_credits: number;
  monthly_used: number;
  monthly_remaining: number;
  purchased_credits: number;
  purchased_used: number;
  purchased_remaining: number;
  total_available: number;
  expires_soon: Array<{
    amount: number;
    expires_at: string;
  }>;
}

export interface SubscriptionChange {
  id: string;
  user_id: string;
  from_tier: SubscriptionTier;
  to_tier: SubscriptionTier;
  change_type: 'upgrade' | 'downgrade' | 'cancellation';
  effective_date: string;
  proration_amount?: number;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}

export interface PlanComparison {
  tier: SubscriptionTier;
  name: string;
  price: number;
  credits: number;
  features: string[];
  isCurrentPlan: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  savings?: {
    amount: number;
    percentage: number;
  };
}

export interface BillingPreferences {
  currency: string;
  timezone: string;
  invoice_email?: string;
  auto_pay: boolean;
  billing_threshold?: number;
}

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDaysUntil = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getBillingStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
    case 'active':
      return 'text-green-400';
    case 'pending':
    case 'trialing':
      return 'text-yellow-400';
    case 'failed':
    case 'past_due':
    case 'unpaid':
      return 'text-red-400';
    case 'canceled':
    case 'refunded':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
};

export const getTierUpgradeInfo = (currentTier: SubscriptionTier, targetTier: SubscriptionTier) => {
  const tiers = ['free', 'plus', 'pro'] as const;
  const currentIndex = tiers.indexOf(currentTier);
  const targetIndex = tiers.indexOf(targetTier);
  
  return {
    isUpgrade: targetIndex > currentIndex,
    isDowngrade: targetIndex < currentIndex,
    isSameTier: targetIndex === currentIndex,
  };
};