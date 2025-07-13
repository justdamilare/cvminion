import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  apiVersion: '2023-10-16' as const,
};

// Initialize Stripe
export const stripePromise = stripeConfig.publishableKey 
  ? loadStripe(stripeConfig.publishableKey)
  : null;

// Subscription tiers with Stripe Price IDs
export const subscriptionPlans = {
  free: {
    name: 'Free',
    credits: 3,
    price: 0,
    stripePriceId: '', // No Stripe price for free tier
    features: [
      '3 AI-generated CVs per month',
      'Basic ATS optimization',
      'Standard templates',
      'Up to 6 credits rollover',
      'Email support'
    ]
  },
  plus: {
    name: 'Plus',
    credits: 30,
    price: 1299, // $12.99 in cents
    stripePriceId: import.meta.env.VITE_STRIPE_PLUS_PRICE_ID || '',
    features: [
      '30 AI-generated CVs per month',
      'Advanced ATS optimization',
      'Premium templates',
      'Up to 60 credits rollover',
      'Priority support',
      'Custom branding',
      'Export formats'
    ]
  },
  pro: {
    name: 'Pro',
    credits: 100,
    price: 3999, // $39.99 in cents
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
    features: [
      '100 AI-generated CVs per month',
      'Enterprise ATS optimization',
      'All premium templates',
      'Up to 200 credits rollover',
      'Dedicated support',
      'Team collaboration',
      'Advanced analytics',
      'API access'
    ]
  }
} as const;

// Credit packages with Stripe Price IDs
export const creditPackages = [
  {
    id: '5-credits',
    name: '5 Credits',
    credits: 5,
    price: 999, // $9.99 in cents
    stripePriceId: import.meta.env.VITE_STRIPE_5_CREDITS_PRICE_ID || '',
    description: 'Perfect for occasional use',
    popular: false
  },
  {
    id: '10-credits',
    name: '10 Credits', 
    credits: 10,
    price: 1799, // $17.99 in cents
    stripePriceId: import.meta.env.VITE_STRIPE_10_CREDITS_PRICE_ID || '',
    description: 'Great for regular users',
    popular: false
  },
  {
    id: '25-credits',
    name: '25 Credits',
    credits: 25,
    price: 3999, // $39.99 in cents
    stripePriceId: import.meta.env.VITE_STRIPE_25_CREDITS_PRICE_ID || '',
    description: 'Best value for active users',
    popular: true
  },
  {
    id: '50-credits',
    name: '50 Credits',
    credits: 50,
    price: 6999, // $69.99 in cents
    stripePriceId: import.meta.env.VITE_STRIPE_50_CREDITS_PRICE_ID || '',
    description: 'Premium pack for heavy users',
    popular: false
  }
] as const;

export type SubscriptionTier = keyof typeof subscriptionPlans;
export type CreditPackageId = typeof creditPackages[number]['id']; 
