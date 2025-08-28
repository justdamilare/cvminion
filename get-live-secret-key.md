# Get Live Stripe Secret Key

To complete the live mode setup, I need your live Stripe secret key:

## Steps:
1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Toggle to LIVE mode** (top right - should show "Live")
3. **Navigate to**: Developers → API keys
4. **Find**: "Secret key" (starts with `sk_live_`)
5. **Copy the key**

## Once you have it, I'll run:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
```

## Security Note:
- This key has full access to your Stripe account
- Never share it or commit it to code
- It will be stored securely in Supabase Edge Functions

Please paste the live secret key when you have it!