export type SubscriptionTier = 'free' | 'plus' | 'pro';
export type CreditType = 'monthly' | 'purchased' | 'bonus';
export type TransactionType = 'earned' | 'consumed' | 'purchased' | 'expired';

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  billing_cycle_start: string;
  billing_cycle_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  user_id: string;
  credit_type: CreditType;
  amount: number;
  expires_at?: string;
  billing_cycle_start?: string;
  billing_cycle_end?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  credit_id?: string;
  transaction_type: TransactionType;
  amount: number;
  balance_after: number;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreditSummary {
  total_credits: number;
  available_credits: number;
  monthly_credits: number;
  purchased_credits: number;
  subscription_tier: SubscriptionTier;
  billing_cycle_end: string;
  next_reset_date: string;
}

export interface TierLimits {
  monthly_credits: number;
  max_rollover: number;
  price_per_month?: number;
  features: string[];
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    monthly_credits: 3,
    max_rollover: 6,
    features: [
      '3 AI-generated CVs per month',
      'Basic ATS optimization',
      'Standard templates',
      'Basic support'
    ]
  },
  plus: {
    monthly_credits: 30,
    max_rollover: 60,
    price_per_month: 12,
    features: [
      '30 AI-generated CVs per month',
      'Advanced ATS optimization',
      'Premium templates',
      'Priority support',
      'Custom branding',
      'Export formats'
    ]
  },
  pro: {
    monthly_credits: 100,
    max_rollover: 200,
    price_per_month: 39,
    features: [
      '100 AI-generated CVs per month',
      'Enterprise ATS optimization',
      'All premium templates',
      'Dedicated support',
      'Custom branding',
      'Advanced analytics',
      'Team collaboration',
      'API access'
    ]
  }
};

export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const getTierDisplayName = (tier: SubscriptionTier): string => {
  switch (tier) {
    case 'free':
      return 'Free';
    case 'plus':
      return 'Plus';
    case 'pro':
      return 'Pro';
    default:
      return 'Free';
  }
};

export const getTierColor = (tier: SubscriptionTier): string => {
  switch (tier) {
    case 'free':
      return 'text-gray-400';
    case 'plus':
      return 'text-primary';
    case 'pro':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}; 
