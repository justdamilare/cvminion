# Stripe Live Mode Setup Guide

## Current Status
✅ **Live Mode API Keys**: Already configured in Stripe CLI
- **Live Publishable Key**: `pk_live_51OXV9dIQW89PDEnVEmaC2eY2iH6vkcw2HXmIitlhc20EOyVIHaJ8EjfQnb5Gy49CGbqEXMoUXJr4KwpMV5xyId5b00mSzF6Uqj`

## Step 1: Create Products in Stripe Dashboard (REQUIRED)

Since you don't have products in live mode yet, you need to create them:

### Go to Stripe Dashboard (Live Mode)
1. **Visit**: https://dashboard.stripe.com
2. **Toggle to LIVE mode** (top right - make sure you see "Live")
3. **Go to Products**: https://dashboard.stripe.com/products

### Create These Products Manually:

#### 1. CVMinion Plus Subscription
- **Name**: CVMinion Plus
- **Description**: 30 AI-generated CVs per month with advanced ATS optimization and premium templates
- **Type**: Recurring
- **Price**: $12.99 USD / month
- **Copy the Price ID** (starts with `price_`)

#### 2. CVMinion Pro Subscription  
- **Name**: CVMinion Pro
- **Description**: 100 AI-generated CVs per month with enterprise ATS optimization, all templates, and API access
- **Type**: Recurring
- **Price**: $39.99 USD / month
- **Copy the Price ID** (starts with `price_`)

#### 3. Credit Packages (One-time payments)
Create these as one-time products:

- **5 Credits**: $9.99 USD (one-time)
- **10 Credits**: $17.99 USD (one-time) 
- **25 Credits**: $39.99 USD (one-time)
- **50 Credits**: $69.99 USD (one-time)

**Copy all Price IDs** - you'll need them for the next step.

## Step 2: Update Environment Variables

Once you have the live Price IDs, I'll update your Vercel environment variables:

```bash
# Update with your live Stripe keys
vercel env rm VITE_STRIPE_PUBLISHABLE_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_51OXV9dIQW89PDEnVEmaC2eY2iH6vkcw2HXmIitlhc20EOyVIHaJ8EjfQnb5Gy49CGbqEXMoUXJr4KwpMV5xyId5b00mSzF6Uqj

# Update with live Price IDs (you'll get these from Dashboard)
vercel env rm VITE_STRIPE_PLUS_PRICE_ID production
vercel env add VITE_STRIPE_PLUS_PRICE_ID production
# Enter: price_XXXXXXXXX (your live Plus price ID)

vercel env rm VITE_STRIPE_PRO_PRICE_ID production  
vercel env add VITE_STRIPE_PRO_PRICE_ID production
# Enter: price_XXXXXXXXX (your live Pro price ID)

# Update credit package price IDs
vercel env rm VITE_STRIPE_5_CREDITS_PRICE_ID production
vercel env add VITE_STRIPE_5_CREDITS_PRICE_ID production
# Enter: price_XXXXXXXXX (your live 5 credits price ID)

# And so on for 10, 25, 50 credits...
```

## Step 3: Update Supabase Secrets

```bash
# You'll need your live secret key from Dashboard > Developers > API Keys
# It should start with sk_live_
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_actual_live_secret_key_here
```

## Step 4: Create Live Webhook Endpoint

1. **Go to**: https://dashboard.stripe.com/webhooks (in Live mode)
2. **Add endpoint**: `https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copy the webhook signing secret** (starts with `whsec_`)
5. **Update Supabase**: 
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
   ```

## Ready to Proceed?

Once you've created the products in the Stripe Dashboard and have the Price IDs, let me know and I'll:
1. Update all environment variables with live keys
2. Update Supabase secrets
3. Redeploy your application
4. Test the live integration

**Important**: Only do this when you're ready to accept real payments! Test mode is safer for development.