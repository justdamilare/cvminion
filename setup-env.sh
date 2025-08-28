#!/bin/bash

echo "Setting up production environment variables on Vercel..."

# Read variables from .env file
source .env

# Set environment variables
echo "$VITE_SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production
echo "$VITE_SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production
echo "$VITE_BACKEND_URL" | vercel env add VITE_BACKEND_URL production
echo "$VITE_STRIPE_PUBLISHABLE_KEY" | vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
echo "$VITE_STRIPE_PLUS_PRICE_ID" | vercel env add VITE_STRIPE_PLUS_PRICE_ID production
echo "$VITE_STRIPE_PRO_PRICE_ID" | vercel env add VITE_STRIPE_PRO_PRICE_ID production
echo "$VITE_STRIPE_5_CREDITS_PRICE_ID" | vercel env add VITE_STRIPE_5_CREDITS_PRICE_ID production
echo "$VITE_STRIPE_10_CREDITS_PRICE_ID" | vercel env add VITE_STRIPE_10_CREDITS_PRICE_ID production
echo "$VITE_STRIPE_25_CREDITS_PRICE_ID" | vercel env add VITE_STRIPE_25_CREDITS_PRICE_ID production
echo "$VITE_STRIPE_50_CREDITS_PRICE_ID" | vercel env add VITE_STRIPE_50_CREDITS_PRICE_ID production
echo "$VITE_OPENAI_API_KEY" | vercel env add VITE_OPENAI_API_KEY production
echo "production" | vercel env add NODE_ENV production

echo "Environment variables setup complete!"