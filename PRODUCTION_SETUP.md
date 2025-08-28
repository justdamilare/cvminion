# 🚀 CVMinion Production Setup Guide

## Overview
This guide covers the complete setup process for deploying CVMinion to production.

## 🔐 Environment Variables Setup

### 1. Copy and Configure Environment
```bash
cp .env.example .env.production
```

### 2. Required Production Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_BACKEND_URL=your_production_supabase_functions_url

# Stripe Configuration (Production Keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Stripe Price IDs (Production)
VITE_STRIPE_PLUS_PRICE_ID=price_1RkU7oIYMvDzjcYzvNniR34d
VITE_STRIPE_PRO_PRICE_ID=price_1RkU8SIYMvDzjcYzD0jkmVq5

# Environment
NODE_ENV=production
ENVIRONMENT=production
```

## 💳 Stripe Production Setup

### Current Products & Pricing:
- **CVMinion Plus**: $12.99/month (price_1RkU7oIYMvDzjcYzvNniR34d)
- **CVMinion Pro**: $39.99/month (price_1RkU8SIYMvDzjcYzD0jkmVq5)
- **Credits**: 5 ($9.99), 10, 25, 50 credit packages

### 1. Activate Live Mode
```bash
stripe login
stripe config --set live_mode=true
```

### 2. Create Production Webhook Endpoint
```bash
stripe listen --forward-to https://your-domain.com/functions/v1/stripe-webhook
```

### 3. Set Webhook Secret in Supabase
Add webhook secret to Supabase Edge Functions environment:
```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Configure Webhook Events
Required events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🏗️ Deployment Checklist

### Frontend Deployment (Vercel/Netlify)
1. Set environment variables in deployment platform
2. Configure domain and SSL
3. Set up redirects for SPA routing

### Backend Setup (Supabase)
1. Deploy all edge functions:
```bash
supabase functions deploy --project-ref your-project-ref
```

2. Set production environment variables:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_secret_key --project-ref your-project-ref
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret --project-ref your-project-ref
supabase secrets set OPENAI_API_KEY=your_openai_key --project-ref your-project-ref
supabase secrets set ENVIRONMENT=production --project-ref your-project-ref
```

## 🔍 Production Health Checks

### 1. Test Stripe Integration
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=timestamp,v1=signature" \
  -d '{"test": "webhook"}'
```

### 2. Test Payment Flow
- Create test subscription
- Verify webhook processing
- Test credit purchases
- Confirm database updates

### 3. Test Core Features
- Resume generation
- PDF export
- Template selection
- Profile management

## 🛡️ Security Considerations

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong webhook secrets
- ✅ Rotate API keys regularly
- ✅ Use different keys for different environments

### 2. Stripe Security
- ✅ Webhook signature verification enabled (production only)
- ✅ Demo mode disabled in production
- ✅ Rate limiting on payment endpoints
- ✅ Proper error handling

### 3. Database Security
- ✅ RLS policies enabled
- ✅ User data isolation
- ✅ Backup strategy in place

## 📊 Monitoring Setup

### 1. Error Tracking
Add to production environment:
```env
VITE_SENTRY_DSN=your_sentry_dsn
```

### 2. Analytics
```env
VITE_POSTHOG_KEY=your_posthog_key
```

### 3. Performance Monitoring
- Vercel Analytics enabled
- Supabase monitoring dashboard
- Stripe dashboard monitoring

## 🚦 Go-Live Checklist

- [ ] Environment variables configured
- [ ] Stripe live mode activated
- [ ] Webhook endpoints configured
- [ ] All edge functions deployed
- [ ] Domain and SSL configured
- [ ] Error tracking setup
- [ ] Payment flow tested
- [ ] Core features tested
- [ ] Backup strategy implemented
- [ ] Monitoring dashboards configured

## 🔄 Maintenance

### Daily
- Monitor error rates
- Check payment processing
- Review webhook logs

### Weekly
- Review user metrics
- Check system performance
- Update dependencies if needed

### Monthly
- Rotate API keys
- Review security logs
- Update documentation

## 🆘 Troubleshooting

### Common Issues

1. **Webhook Signature Failures**
   - Verify webhook secret matches
   - Check Stripe endpoint URL
   - Review webhook logs

2. **Payment Processing Errors**
   - Check Stripe dashboard
   - Review edge function logs
   - Verify price IDs

3. **Authentication Issues**
   - Check Supabase configuration
   - Verify JWT tokens
   - Review RLS policies

### Support Contacts
- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support
- OpenAI Support: https://help.openai.com

---

**Production deployment complete! 🎉**

Monitor the system closely for the first 24-48 hours after launch.