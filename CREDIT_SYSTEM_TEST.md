# CVMinion Credit System Test Guide

## Updated Tests for Recent Fixes

### 1. Test Credit UI Updates (Real-time)

**Issue**: Database credit updates weren't reflecting in the UI immediately.

**Test Steps**:
1. Open CVMinion and note your current credit balance in the navbar
2. Open a new browser tab and go to your Supabase dashboard
3. Navigate to Table Editor → `profiles` table
4. Find your user record and manually update the `available_credits` field (e.g., change from 3 to 10)
5. Save the changes in Supabase
6. Go back to CVMinion tab (don't refresh the page)
7. **Expected**: The credit balance in the navbar should update automatically within 1-2 seconds

**✅ PASS**: Credits update automatically in UI without page refresh
**❌ FAIL**: Need to refresh page to see updated credits

### 2. Test Credit Consumption on Resume Generation

**Issue**: Credits weren't being consumed when generating resumes.

**Test Steps**:
1. Log in and note your current available credits (should show in navbar)
2. Go to Dashboard and open any job application
3. Make sure you have job description filled in
4. Click "Generate Resume"
5. **Expected**: 
   - If you have 0 credits: Should show "Insufficient credits" error
   - If you have credits: Should consume 1 credit and show "Resume generated successfully! 1 credit consumed."
6. Check the navbar - your credit count should decrease by 1

**✅ PASS**: Credits are consumed before generation, UI updates accordingly
**❌ FAIL**: Credits not consumed or UI doesn't update

## Original System Tests

### Database Schema Verification

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_subscriptions', 'credits', 'credit_transactions', 'credit_packages');

-- Check credit packages are loaded
SELECT * FROM credit_packages ORDER BY credits;

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('consume_credits', 'add_credits', 'calculate_user_credits');
```

### 1. New User Credit Initialization

**Test**: When a new user signs up, they should automatically receive 3 free credits.

**Steps**:
1. Sign up with a new email
2. Complete profile setup
3. Check navbar shows "3 credits" with "Free" tier

**Expected**: New users start with 3 credits, free tier subscription

### 2. Credit Balance Display

**Test**: Credit balance should be visible in the navbar.

**Steps**:
1. Log in to CVMinion
2. Check top navigation bar

**Expected**: Should see credit count (e.g., "3 credits") and tier (e.g., "Free")

### 3. Credit Purchase Flow

**Test**: Users should be able to purchase additional credits.

**Steps**:
1. Click "Buy Credits" button in navbar
2. Select a credit package (e.g., 5 credits for $9.99)
3. Click "Purchase Credits"
4. Verify successful purchase message
5. Check credit balance increases

**Expected**: Credits added to account, balance updated in UI

### 4. Resume Generation Credit Consumption

**Test**: Generating a resume should consume 1 credit.

**Steps**:
1. Note current credit balance
2. Go to Dashboard → Open job application
3. Add job description if not present
4. Click "Generate Resume"
5. Wait for completion
6. Check credit balance

**Expected**: Balance decreases by 1 credit after successful generation

### 5. Insufficient Credits Handling

**Test**: Users with 0 credits should not be able to generate resumes.

**Steps**:
1. Use all available credits (generate resumes until 0)
2. Try to generate another resume
3. Check error message

**Expected**: Should show "Insufficient credits" error, suggest purchasing more

### 6. Credit Transaction History

**Test**: All credit transactions should be logged.

**Database Query**:
```sql
-- Check transaction history for a user
SELECT * FROM credit_transactions 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC;
```

**Expected**: Should see records for:
- Initial credit allocation
- Credit purchases
- Credit consumption for CV generation

### 7. Monthly Credit Reset (Free Tier)

**Test**: Free tier users should get fresh credits each month.

**Manual Test** (requires database access):
```sql
-- Simulate monthly reset
SELECT reset_monthly_credits();

-- Check credits were refreshed
SELECT available_credits FROM profiles WHERE user_id = 'your-user-id';
```

**Expected**: Monthly credits refreshed based on tier

### 8. Credit Rollover Limits

**Test**: Users should be able to roll over unused credits up to tier limits.

**Example Scenarios**:
- Free tier: Max 6 credits total (3 monthly + 3 rollover)
- Pro tier: Max 60 credits total (30 monthly + 30 rollover)
- Enterprise: Max 200 credits total (100 monthly + 100 rollover)

### 9. Edge Function Operations

**Test**: All credit operations should work through Edge Functions.

**API Endpoints to Test**:
- `POST /functions/v1/consume-credits` - Consume credits for CV generation
- `POST /functions/v1/purchase-credits` - Purchase credit packages
- `GET /functions/v1/get-credit-status` - Get current credit status
- `POST /functions/v1/upgrade-subscription` - Upgrade subscription tier

### 10. Subscription Tier Features

**Test**: Different tiers should have appropriate credit allocations.

**Monthly Allocations**:
- Free: 3 credits/month
- Pro: 30 credits/month  
- Enterprise: 100 credits/month

### Error Handling Tests

1. **Network Errors**: Test with poor network conditions
2. **Invalid Payments**: Test with invalid payment methods
3. **Database Errors**: Test edge cases with database constraints
4. **Rate Limiting**: Test rapid successive credit operations

### Performance Tests

1. **Real-time Updates**: Credit balance should update within 2 seconds
2. **Concurrent Purchases**: Multiple users purchasing credits simultaneously
3. **Heavy Usage**: Users consuming many credits in short time

## Debugging Common Issues

### Credits Not Updating in UI
1. Check browser console for real-time subscription errors
2. Verify Supabase connection is active
3. Check if user is authenticated

### Credit Consumption Failing
1. Check Edge Function logs: `supabase functions logs consume-credits`
2. Verify user has sufficient credits
3. Check database function permissions

### Purchase Flow Issues
1. Verify credit packages are loaded: `SELECT * FROM credit_packages;`
2. Check Edge Function logs: `supabase functions logs purchase-credits`
3. Verify payment processing (currently in demo mode)

### Database Consistency
```sql
-- Check for credit inconsistencies
SELECT 
  p.user_id,
  p.available_credits as profile_credits,
  calculate_user_credits(p.user_id) as calculated_credits
FROM profiles p
WHERE p.available_credits != calculate_user_credits(p.user_id);
```

## Production Readiness Checklist

- [ ] All database migrations applied
- [ ] All Edge Functions deployed
- [ ] Credit packages populated
- [ ] Row Level Security enabled
- [ ] Real-time subscriptions working
- [ ] Payment processing configured (currently demo mode)
- [ ] Error handling implemented
- [ ] Transaction logging active
- [ ] Monthly reset cron job configured
- [ ] Credit rollover limits enforced

## Next Steps

1. **Payment Integration**: Replace demo payment with real payment processor (Stripe)
2. **Admin Dashboard**: Build admin interface for credit management
3. **Analytics**: Track credit usage patterns
4. **Notifications**: Email alerts for low credits
5. **Bulk Operations**: Admin tools for bulk credit adjustments
6. **Reporting**: Generate credit usage reports

---

**Status**: ✅ Core credit system implemented and tested
**Last Updated**: January 2025 
