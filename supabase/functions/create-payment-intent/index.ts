import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentIntentRequest {
  mode: 'credits' | 'subscription';
  selectedData: {
    name: string;
    price: number;
    credits: number;
    stripePriceId?: string;
  };
  userId: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      }
    );

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Parse request body
    const { mode, selectedData, userId }: CreatePaymentIntentRequest = await req.json();

    if (!mode || !selectedData || !userId) {
      throw new Error('Missing required parameters');
    }

    // Get user profile for customer info
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error getting profile:', profileError);
    }

    let customer;
    try {
      // Try to find existing customer
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: user.email!,
          name: profile?.full_name || user.email,
          metadata: {
            supabase_user_id: userId,
          },
        });
      }
    } catch (error) {
      console.error('Error handling customer:', error);
      throw new Error('Failed to handle customer');
    }

    let paymentIntent;

    if (mode === 'credits') {
      // One-time payment for credits
      paymentIntent = await stripe.paymentIntents.create({
        amount: selectedData.price,
        currency: 'usd',
        customer: customer.id,
        description: `Purchase ${selectedData.credits} credits`,
        metadata: {
          mode: 'credits',
          user_id: userId,
          credits: selectedData.credits.toString(),
          package_name: selectedData.name,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } else {
      // Subscription payment
      if (!selectedData.stripePriceId) {
        throw new Error('Stripe Price ID required for subscription');
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: selectedData.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          mode: 'subscription',
          user_id: userId,
          tier: selectedData.name.toLowerCase(),
        },
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    }

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 
