import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Missing webhook secret');
    }

    // Initialize Stripe
    const stripe = new Stripe(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      }
    );

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Get Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(supabaseAdmin, paymentIntent);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabaseAdmin, invoice);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChanged(supabaseAdmin, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabaseAdmin, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 400, headers: corsHeaders }
    );
  }
});

// Handle successful payment intent (one-time payments for credits)
async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  if (metadata.mode === 'credits') {
    const userId = metadata.user_id;
    const credits = parseInt(metadata.credits);
    
    if (userId && credits) {
      // Add credits to user account (expires in 12 months)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await supabase.rpc('add_credits', {
        user_uuid: userId,
        credits_to_add: credits,
        credit_type_param: 'purchased',
        expires_at_param: expiresAt.toISOString()
      });

      if (error) {
        console.error('Error adding credits:', error);
        throw error;
      }

      console.log(`Added ${credits} credits to user ${userId}`);
    }
  }
}

// Handle successful invoice payment (subscriptions)
async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  const subscription = invoice.subscription;
  if (typeof subscription === 'string') {
    // This is a subscription payment, handle subscription renewal
    const { metadata } = invoice;
    const userId = metadata?.user_id;
    
    if (userId) {
      console.log(`Subscription payment succeeded for user ${userId}`);
      // Subscription credits are handled by the monthly reset function
    }
  }
}

// Handle subscription creation/updates
async function handleSubscriptionChanged(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  const tier = subscription.metadata.tier;
  
  if (userId && tier) {
    try {
      // Update user subscription
      const { error } = await supabase.rpc('upgrade_subscription', {
        user_uuid: userId,
        new_tier: tier
      });

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log(`Updated subscription for user ${userId} to ${tier}`);
    } catch (error) {
      console.error('Error handling subscription change:', error);
      throw error;
    }
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  
  if (userId) {
    try {
      // Downgrade to free tier
      const { error } = await supabase.rpc('upgrade_subscription', {
        user_uuid: userId,
        new_tier: 'free'
      });

      if (error) {
        console.error('Error downgrading subscription:', error);
        throw error;
      }

      console.log(`Cancelled subscription for user ${userId}, downgraded to free`);
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
      throw error;
    }
  }
} 
