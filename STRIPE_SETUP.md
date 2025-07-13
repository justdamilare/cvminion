# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for credit purchases and subscriptions in CVMinion.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Supabase project with Edge Functions enabled
3. CVMinion application deployed

## Step 1: Stripe Dashboard Configuration

### 1.1 Create Products and Prices

In your Stripe Dashboard, create the following products and prices:

#### Subscription Plans
- **Plus Plan**: $12.99/month recurring
- **Pro Plan**: $39.99/month recurring

#### Credit Packages (One-time payments)
- **5 Credits**: $9.99 one-time
- **10 Credits**: $17.99 one-time  
- **25 Credits**: $39.99 one-time
- **50 Credits**: $69.99 one-time

### 1.2 Get Your API Keys

1. Go to Developers → API keys in your Stripe Dashboard
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

### 1.3 Set Up Webhooks

1. Go to Developers → Webhooks in your Stripe Dashboard
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret (starts with `whsec_`)

## Step 2: Environment Variables

### 2.1 Frontend Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Price IDs (get these from your Stripe Dashboard)
VITE_STRIPE_PLUS_PRICE_ID=price_1abc123def456
VITE_STRIPE_PRO_PRICE_ID=price_1ghi789jkl012

VITE_STRIPE_5_CREDITS_PRICE_ID=price_1mno345pqr678
VITE_STRIPE_10_CREDITS_PRICE_ID=price_1stu901vwx234
VITE_STRIPE_25_CREDITS_PRICE_ID=price_1yza567bcd890
VITE_STRIPE_50_CREDITS_PRICE_ID=price_1efg123hij456
```

### 2.2 Supabase Edge Functions Environment Variables

In your Supabase Dashboard, go to Settings → Edge Functions and add these secrets:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

## Step 3: Deploy Edge Functions

Deploy the Stripe-related Edge Functions to your Supabase project:

```bash
# Deploy the create payment intent function
supabase functions deploy create-payment-intent

# Deploy the webhook handler
supabase functions deploy stripe-webhook

# Deploy the cancel subscription function (optional)
supabase functions deploy cancel-subscription
```

## Step 4: Update Your Application

### 4.1 Add Payment Components

The following components are now available:

1. **StripePaymentModal**: Handles both credit purchases and subscription upgrades
2. **SubscriptionManager**: Comprehensive subscription management interface
3. **PaymentForm**: Stripe Elements integration for secure payments

### 4.2 Example Usage

```tsx
import { StripePaymentModal } from './components/payments/StripePaymentModal';
import { SubscriptionManager } from './components/billing/SubscriptionManager';

// For credit purchases
<StripePaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  userId={user.id}
  mode="credits"
  selectedCredits={25}
  onSuccess={() => {
    // Handle successful purchase
    refreshCredits();
  }}
/>

// For subscription management
<SubscriptionManager userId={user.id} />
```

## Step 5: Testing

### 5.1 Test Mode

Use Stripe's test mode with these test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

### 5.2 Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Step 6: Production Deployment

### 6.1 Switch to Live Mode

1. In Stripe Dashboard, toggle to "Live mode"
2. Create new products and prices (or activate existing ones)
3. Update your environment variables with live API keys
4. Update webhook endpoint URL to your production domain

### 6.2 Security Checklist

- ✅ Use HTTPS for all webhook endpoints
- ✅ Verify webhook signatures
- ✅ Never expose secret keys in frontend code
- ✅ Set up proper CORS headers
- ✅ Enable Row Level Security (RLS) in Supabase
- ✅ Test all payment flows thoroughly

## Troubleshooting

### Common Issues

1. **"Stripe is not configured"**
   - Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
   - Ensure the key starts with `pk_`

2. **Payment Intent creation fails**
   - Verify `STRIPE_SECRET_KEY` is set in Supabase Edge Functions
   - Check Edge Function logs for detailed errors

3. **Webhooks not working**
   - Verify webhook URL is accessible
   - Check webhook signing secret is correct
   - Ensure selected events match the handler

4. **Subscription not updating**
   - Check webhook events are being received
   - Verify user metadata is correctly set in Stripe
   - Check Supabase logs for database errors

### Debug Commands

```bash
# Check Edge Function logs
supabase functions logs create-payment-intent
supabase functions logs stripe-webhook

# Test webhook locally
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

## Support

For additional help:

1. Check Stripe Documentation: https://stripe.com/docs
2. Check Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
3. Open an issue in the CVMinion repository

---

🎉 **Congratulations!** You now have a fully functional payment system with Stripe integration for your CVMinion application. 
