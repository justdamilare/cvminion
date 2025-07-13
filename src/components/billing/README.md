# Enhanced Subscription Management System

A comprehensive subscription and billing management system for CVMinion that provides users with complete control over their subscription, credits, and billing information.

## Features

### 🏆 Current Plan Display
- **Real-time plan information** with current tier and status
- **Usage statistics** showing credit consumption and remaining credits
- **Billing cycle information** with next billing date and days remaining
- **Status alerts** for past due payments, canceled subscriptions, etc.
- **Quick actions** for subscription cancellation and reactivation

### 📊 Plan Comparison
- **Side-by-side plan comparison** with detailed feature breakdown
- **Smart upgrade/downgrade suggestions** with savings calculations
- **Interactive plan selection** with immediate vs. end-of-cycle changes
- **Feature matrix** showing what's included in each tier
- **Upgrade benefits** highlighting value propositions

### 💳 Billing Management
- **Payment method management** with ability to add, remove, and set default
- **Billing history** with downloadable invoices and payment tracking
- **Failed payment retry** functionality
- **Payment method security** with masked card details
- **Real-time payment status** updates

### ⚡ Credit Management
- **Credit balance tracking** for monthly and purchased credits
- **Usage analytics** with trends and patterns
- **One-time credit purchases** that never expire
- **Credit expiration warnings** for time-sensitive credits
- **Transaction history** with detailed credit flow

## Components

### EnhancedSubscriptionManager
The main component that orchestrates all subscription management functionality.

```tsx
<EnhancedSubscriptionManager userId="user-id" />
```

**Props:**
- `userId` (string): The user's unique identifier

**Features:**
- Tabbed interface for easy navigation
- Real-time data updates via WebSocket connections
- Comprehensive error handling and loading states
- Integration with Stripe for payments

### CurrentPlanDisplay
Shows current subscription details and usage information.

```tsx
<CurrentPlanDisplay
  subscription={subscription}
  currentTier={subscriptionTier}
  usageStats={usageStats}
  creditBalance={creditBalance}
  billingCycleEnd={billingCycleEnd}
  onCancelSubscription={handleCancel}
  onReactivateSubscription={handleReactivate}
  cancelling={false}
/>
```

### PlanComparison
Interactive plan comparison with upgrade/downgrade options.

```tsx
<PlanComparison
  currentTier={subscriptionTier}
  onUpgrade={handleUpgrade}
  onDowngrade={handleDowngrade}
  loading={false}
/>
```

### BillingManagement
Complete billing and payment method management.

```tsx
<BillingManagement
  billingHistory={billingHistory}
  paymentMethods={paymentMethods}
  onDownloadInvoice={downloadInvoice}
  onRetryPayment={retryPayment}
  onSetDefaultPaymentMethod={setDefault}
  onRemovePaymentMethod={removeMethod}
  onAddPaymentMethod={addMethod}
/>
```

### CreditManagement
Comprehensive credit tracking and purchasing.

```tsx
<CreditManagement
  creditBalance={creditBalance}
  creditTransactions={transactions}
  onPurchaseCredits={purchaseCredits}
  onRefreshCredits={refreshCredits}
  loading={false}
/>
```

## Hooks

### useSubscription
Enhanced hook for subscription management with comprehensive billing features.

```tsx
const {
  subscription,
  billingHistory,
  paymentMethods,
  usageStats,
  creditBalance,
  loading,
  refreshSubscription,
  cancelSubscription,
  updateSubscription,
  setDefaultPaymentMethod,
  downloadInvoice
} = useSubscription(userId);
```

## Types

### SubscriptionDetails
```typescript
interface SubscriptionDetails {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  // ... more fields
}
```

### CreditBalance
```typescript
interface CreditBalance {
  monthly_credits: number;
  monthly_used: number;
  monthly_remaining: number;
  purchased_credits: number;
  purchased_remaining: number;
  total_available: number;
  expires_soon: Array<{
    amount: number;
    expires_at: string;
  }>;
}
```

### BillingHistory
```typescript
interface BillingHistory {
  id: string;
  stripe_invoice_id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoice_url?: string;
  created_at: string;
  // ... more fields
}
```

## Integration

### Stripe Integration
The system integrates seamlessly with Stripe for:
- Subscription management (create, update, cancel)
- Payment processing for credit purchases
- Invoice generation and management
- Payment method storage and management
- Webhook handling for real-time updates

### Supabase Integration
Real-time data synchronization with:
- Subscription status updates
- Credit balance changes
- Payment method modifications
- Billing history updates

## Usage Examples

### Basic Implementation
```tsx
import { EnhancedSubscriptionManager } from '@/components/billing';

function BillingPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <EnhancedSubscriptionManager userId={user.id} />
    </div>
  );
}
```

### Custom Implementation with Individual Components
```tsx
import { 
  CurrentPlanDisplay, 
  PlanComparison,
  useSubscription 
} from '@/components/billing';

function CustomBillingPage() {
  const { user } = useAuth();
  const subscriptionData = useSubscription(user.id);
  
  return (
    <div className="space-y-6">
      <CurrentPlanDisplay {...subscriptionData} />
      <PlanComparison {...subscriptionData} />
    </div>
  );
}
```

## Styling

The components use Tailwind CSS with a dark theme optimized for the CVMinion design system:

- **Primary color**: Used for CTAs and active states
- **Dark theme**: Consistent with the overall application design
- **Responsive design**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG compliant with proper contrast ratios

## Error Handling

Comprehensive error handling includes:
- **Network errors**: Graceful degradation with retry mechanisms
- **Stripe errors**: User-friendly error messages for payment issues
- **Validation errors**: Clear feedback for invalid inputs
- **Loading states**: Proper loading indicators for all async operations

## Security

Security measures implemented:
- **Stripe integration**: All payment data handled securely by Stripe
- **Authentication**: All API calls require valid authentication
- **Authorization**: Users can only access their own billing data
- **Data validation**: All inputs validated on both client and server
- **HTTPS only**: All payment operations require secure connections

## Performance

Performance optimizations:
- **Lazy loading**: Components and data loaded on demand
- **Caching**: Intelligent caching of subscription and billing data
- **Real-time updates**: WebSocket connections for instant updates
- **Pagination**: Large datasets properly paginated
- **Code splitting**: Components bundled separately for optimal loading

## Accessibility

Accessibility features:
- **Screen reader support**: Proper ARIA labels and descriptions
- **Keyboard navigation**: Full keyboard accessibility
- **Color contrast**: WCAG AA compliant color combinations
- **Focus management**: Proper focus indicators and management
- **Semantic HTML**: Meaningful HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When contributing to the billing system:

1. Follow the existing component patterns
2. Add proper TypeScript types for new features
3. Include comprehensive error handling
4. Add loading states for async operations
5. Test with different subscription tiers
6. Ensure mobile responsiveness
7. Add proper documentation

## Migration from Legacy SubscriptionManager

The legacy `SubscriptionManager` component has been updated to use the new enhanced system while maintaining backward compatibility. No changes are required for existing implementations.

```tsx
// This still works and now provides enhanced features
<SubscriptionManager userId={userId} />
```

For new implementations, use the enhanced component directly:

```tsx
<EnhancedSubscriptionManager userId={userId} />
```