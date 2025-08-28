# Setup Live Webhook Endpoint

## Quick Setup Required:

### 1. Create Live Webhook Endpoint
**Go to**: https://dashboard.stripe.com/webhooks (make sure you're in **LIVE mode**)

**Click**: "Add endpoint"

**Endpoint URL**: 
```
https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook
```

**Select these events**:
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Click**: "Add endpoint"

### 2. Get Webhook Signing Secret
After creating the endpoint:
1. **Click** on the newly created webhook
2. **Copy** the "Signing secret" (starts with `whsec_`)
3. **Paste it here** so I can update Supabase

## Current Status:
✅ **Live Publishable Key**: Updated  
✅ **Live Price IDs**: All updated  
✅ **Live Secret Key**: Updated in Supabase  
⏳ **Live Webhook**: Needs to be created  

Once you create the webhook and give me the signing secret, I'll:
1. Update the webhook secret in Supabase
2. Redeploy the application  
3. Test the live integration

**This should take about 2 minutes to complete!**