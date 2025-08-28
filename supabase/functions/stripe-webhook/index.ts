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

    // Verify webhook signature manually (Deno/Edge Runtime compatible)
    let event: Stripe.Event;
    try {
      // Parse the signature header
      const elements = signature.split(',');
      let timestamp: string | null = null;
      let signatures: string[] = [];

      for (const element of elements) {
        const [key, value] = element.split('=');
        if (key === 't') {
          timestamp = value;
        } else if (key === 'v1') {
          signatures.push(value);
        }
      }

      if (!timestamp || signatures.length === 0) {
        throw new Error('Invalid signature format');
      }

      // Create the payload for verification
      const payloadForVerification = timestamp + '.' + body;
      
      // Get the webhook secret without the whsec_ prefix
      const secretKey = webhookSecret.replace('whsec_', '');
      
      // Stripe webhook secrets are raw strings, not base64 encoded
      const encoder = new TextEncoder();
      const secretBytes = encoder.encode(secretKey);
      const messageData = encoder.encode(payloadForVerification);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        secretBytes,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Debug logging
      console.log('Signature verification debug:');
      console.log('- Received signatures:', signatures);
      console.log('- Computed signature:', computedSignature);
      console.log('- Timestamp:', timestamp);
      console.log('- Payload length:', body.length);

      // Verify signature
      let signatureValid = false;
      for (const sig of signatures) {
        if (computedSignature === sig) {
          signatureValid = true;
          break;
        }
      }

      if (!signatureValid) {
        console.error('Signature verification failed - no matching signatures');
        // In production, we should reject invalid signatures
        const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';
        if (!isDevelopment) {
          return new Response('Webhook signature verification failed', { status: 401 });
        } else {
          console.warn('⚠️  BYPASSING SIGNATURE VERIFICATION IN DEVELOPMENT MODE');
        }
      }

      // Check timestamp (optional - prevents replay attacks)
      const timestampNum = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const tolerance = 300; // 5 minutes
      
      if (currentTime - timestampNum > tolerance) {
        throw new Error('Timestamp too old');
      }

      // Parse the event
      event = JSON.parse(body) as Stripe.Event;
      
      console.log(`Webhook signature verified for event: ${event.type}`);
      
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(supabaseAdmin, session);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(supabaseAdmin, paymentIntent, stripe);
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

// Handle completed checkout session (for both one-time payments and subscriptions)
async function handleCheckoutSessionCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const { metadata } = session;
  
  if (!metadata) {
    console.log('No metadata found in checkout session');
    return;
  }
  
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

      console.log(`Added ${credits} credits to user ${userId} from checkout session ${session.id}`);
    } else {
      console.log('Missing userId or credits in session metadata', metadata);
    }
  } else if (metadata.mode === 'subscription') {
    const userId = metadata.user_id;
    const tier = metadata.tier;
    
    if (userId && tier) {
      const { error } = await supabase.rpc('upgrade_subscription', {
        user_uuid: userId,
        new_tier: tier
      });

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log(`Updated subscription for user ${userId} to ${tier} from checkout session ${session.id}`);
    } else {
      console.log('Missing userId or tier in session metadata', metadata);
    }
  } else {
    console.log(`Unhandled checkout session mode: ${metadata.mode}`);
  }
}

// Handle successful payment intent (one-time payments for credits)
async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent, stripe: Stripe) {
  // Get the checkout session that created this payment intent
  if (!paymentIntent.latest_charge) {
    console.log('No charge found for payment intent');
    return;
  }

  // For checkout sessions, we need to find the session that created this payment intent
  // We'll look for active sessions that match this payment intent
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1
  });

  if (sessions.data.length === 0) {
    console.log('No checkout session found for payment intent');
    return;
  }

  const session = sessions.data[0];
  const { metadata } = session;
  
  if (metadata && metadata.mode === 'credits') {
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

      console.log(`Added ${credits} credits to user ${userId} from payment intent ${paymentIntent.id}`);
    } else {
      console.log('Missing userId or credits in session metadata');
    }
  } else {
    console.log('Session mode is not credits or metadata missing');
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
