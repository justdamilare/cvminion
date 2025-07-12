# CVMinion Supabase Edge Functions

This directory contains all the Supabase Edge Functions for the CVMinion credit system.

## Functions Overview

### 1. `purchase-credits`
Handles credit package purchases with payment processing.

**Endpoint**: `POST /functions/v1/purchase-credits`

**Request Body**:
```json
{
  "package_id": "uuid-of-credit-package",
  "payment_method_id": "demo"  // Optional, defaults to "demo"
}
```

**Response**:
```json
{
  "success": true,
  "credits_added": 10,
  "package_name": "10 Credits Pack",
  "amount_charged": 19.99
}
```

### 2. `consume-credits`
Manages credit consumption for CV generation with validation.

**Endpoint**: `POST /functions/v1/consume-credits`

**Request Body**:
```json
{
  "credits_to_consume": 1,
  "description": "CV generation"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "credits_consumed": 1,
  "remaining_credits": 5,
  "description": "CV generation"
}
```

### 3. `get-credit-status`
Provides comprehensive credit information for users.

**Endpoint**: `GET /functions/v1/get-credit-status`

**Response**:
```json
{
  "success": true,
  "user_id": "user-uuid",
  "credit_status": {
    "available_credits": 15,
    "total_credits": 15,
    "credit_breakdown": {
      "monthly": 3,
      "purchased": 12,
      "bonus": 0
    }
  },
  "subscription": {
    "tier": "free",
    "billing_cycle_start": "2025-01-01T00:00:00Z",
    "billing_cycle_end": "2025-02-01T00:00:00Z",
    "is_active": true
  },
  "recent_transactions": [...]
}
```

### 4. `upgrade-subscription`
Handles subscription tier changes and upgrades.

**Endpoint**: `POST /functions/v1/upgrade-subscription`

**Request Body**:
```json
{
  "new_tier": "pro",
  "payment_method_id": "demo"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "previous_tier": "free",
  "new_tier": "pro",
  "monthly_credits": 30,
  "monthly_price": 9.99,
  "current_credits": 30,
  "subscription": {...}
}
```

## Deployment

### Prerequisites
1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
2. Docker (for local development)
3. Supabase project set up

### Local Development

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Serve functions locally**:
   ```bash
   supabase functions serve
   ```

3. **Test individual functions**:
   ```bash
   # Test purchase-credits
   curl -X POST http://localhost:54321/functions/v1/purchase-credits \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"package_id": "package-uuid"}'
   
   # Test consume-credits
   curl -X POST http://localhost:54321/functions/v1/consume-credits \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"credits_to_consume": 1}'
   
   # Test get-credit-status
   curl -X GET http://localhost:54321/functions/v1/get-credit-status \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   
   # Test upgrade-subscription
   curl -X POST http://localhost:54321/functions/v1/upgrade-subscription \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"new_tier": "pro"}'
   ```

### Production Deployment

1. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. **Deploy all functions**:
   ```bash
   supabase functions deploy
   ```

3. **Deploy individual functions**:
   ```bash
   supabase functions deploy purchase-credits
   supabase functions deploy consume-credits
   supabase functions deploy get-credit-status
   supabase functions deploy upgrade-subscription
   ```

4. **Set environment variables** (if needed):
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=your_stripe_key
   ```

### Function URLs

After deployment, your functions will be available at:
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/purchase-credits`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/consume-credits`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-credit-status`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/upgrade-subscription`

## Authentication

All functions require a valid Supabase JWT token passed in the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

The functions automatically extract the user ID from the JWT token for secure operations.

## Error Handling

All functions return consistent error responses:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (validation errors, insufficient credits, etc.)
- `401`: Unauthorized (invalid or missing token)
- `500`: Internal server error

## Database Dependencies

These functions depend on the following database objects:

### Tables
- `profiles` - User profiles with credit information
- `user_subscriptions` - Subscription details
- `credits` - Individual credit records
- `credit_packages` - Available credit packages for purchase
- `credit_transactions` - Transaction history

### Functions
- `calculate_user_credits(uuid)` - Calculate available credits
- `consume_credits(uuid, integer)` - Consume credits
- `add_credits(uuid, integer, credit_type, timestamptz)` - Add credits
- `upgrade_subscription(uuid, subscription_tier)` - Upgrade subscription

## Monitoring and Logs

View function logs:
```bash
# Local
supabase functions logs

# Production
supabase functions logs --project-ref YOUR_PROJECT_REF
```

View specific function logs:
```bash
supabase functions logs consume-credits
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **User authentication** is required for all operations
3. **Payment processing** is currently in demo mode - integrate with Stripe for production
4. **Credit validation** prevents negative balances and unauthorized consumption
5. **CORS headers** are configured for web application access

## Future Enhancements

1. **Real Payment Integration**: Replace demo payment with Stripe
2. **Webhooks**: Add webhook support for external integrations
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Caching**: Add Redis caching for frequently accessed data
5. **Analytics**: Track usage patterns and performance metrics 
