import React, { useCallback } from 'react';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  mode: 'credits' | 'subscription';
  selectedData: {
    name: string;
    price: number;
    credits: number;
    stripePriceId?: string;
  };
  userId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  mode,
  selectedData,
  userId,
  onSuccess,
  onError
}) => {
  const fetchClientSecret = useCallback(async () => {
    try {
      console.log('PaymentForm - fetchClientSecret called with:', { mode, selectedData, userId });
      
      // Get Supabase session for auth
      const supabase = (await import('../../lib/supabase')).getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('PaymentForm - Session available:', !!session);
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const requestPayload = {
        mode: mode === 'credits' ? 'payment' : 'subscription',
        selectedData,
        userId,
      };
      
      console.log('PaymentForm - Sending request:', JSON.stringify(requestPayload, null, 2));

      // Create checkout session via Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { client_secret } = await response.json();
      return client_secret;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError(new Error(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  }, [mode, selectedData, userId, onError]);

  const options = {
    fetchClientSecret,
    onComplete: () => {
      toast.success(
        mode === 'credits' 
          ? `Successfully purchased ${selectedData.credits} credits!`
          : `Successfully upgraded to ${selectedData.name}!`
      );
      onSuccess();
    },
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}; 
