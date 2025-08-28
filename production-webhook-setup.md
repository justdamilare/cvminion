# Production Webhook Setup Instructions

## Stripe Webhook Configuration

### Webhook Endpoint URL
```
https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook
```

### Required Events
- `checkout.session.completed`
- `invoice.payment_succeeded` 
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Setup Steps

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Click "Add endpoint"**
3. **Enter endpoint URL**: `https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook`
4. **Select events**: Add all the events listed above
5. **Click "Add endpoint"**
6. **Copy the webhook signing secret** (starts with `whsec_`)
7. **Add the secret to Supabase**:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here
   ```

### Alternative: Using Stripe CLI
```bash
# Create webhook endpoint
stripe endpoints create \
  --url "https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook" \
  --enabled-events checkout.session.completed,invoice.payment_succeeded,invoice.payment_failed,customer.subscription.updated,customer.subscription.deleted \
  --description "CVMinion Production Webhook"
```

### Test the webhook
```bash
curl -X POST https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Vercel Production URL

Your application is deployed at:
**https://cvminion-dt85ml86l-srevana.vercel.app**

### Custom Domain Setup (Optional)
To set up a custom domain like `cvminion.com`:

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Domains" 
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Supabase Auth URLs**:
   - Update `site_url` in Supabase Auth settings
   - Add production domain to `additional_redirect_urls`

3. **Update Stripe webhook URL** to use custom domain if configured