import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCheckoutSessionRequest {
  mode: 'payment' | 'subscription';
  selectedData: {
    name: string;
    price: number;
    credits: number;
    stripePriceId?: string;
  };
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      }
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const { mode, selectedData, userId }: CreateCheckoutSessionRequest = await req.json();

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .single();

    let customer;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
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

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (mode === 'payment') {
      // One-time payment for credits
      sessionParams = {
        ui_mode: 'embedded',
        mode: 'payment',
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: selectedData.price,
              product_data: {
                name: selectedData.name,
                description: `${selectedData.credits} credits for CVMinion`,
              },
            },
            quantity: 1,
          },
        ],
        return_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          mode: 'credits',
          user_id: userId,
          credits: selectedData.credits.toString(),
          package_name: selectedData.name,
        },
      };
    } else {
      // Subscription
      if (!selectedData.stripePriceId) {
        throw new Error('Stripe Price ID required for subscription');
      }

      sessionParams = {
        ui_mode: 'embedded',
        mode: 'subscription',
        customer: customer.id,
        line_items: [
          {
            price: selectedData.stripePriceId,
            quantity: 1,
          },
        ],
        return_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          mode: 'subscription',
          user_id: userId,
          tier: selectedData.name.toLowerCase(),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        client_secret: session.client_secret,
        session_id: session.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
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
