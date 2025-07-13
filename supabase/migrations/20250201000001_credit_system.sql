/*
  # Credit System Implementation

  1. New Tables
    - `user_subscriptions` - Manages user subscription tiers and billing cycles
    - `credits` - Tracks user credits (monthly allotments and purchases)
    - `credit_transactions` - Records credit usage and purchases
    - `credit_packages` - Defines available credit purchase packages

  2. Updated Tables
    - `profiles` - Add subscription tier information

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for user access
*/

-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'plus', 'pro');

-- Create enum for credit types
CREATE TYPE credit_type AS ENUM ('monthly', 'purchased', 'bonus');

-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('earned', 'consumed', 'purchased', 'expired');

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  billing_cycle_start timestamptz NOT NULL DEFAULT now(),
  billing_cycle_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credits Table
CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  credit_type credit_type NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  billing_cycle_start timestamptz, -- For monthly credits
  billing_cycle_end timestamptz,   -- For monthly credits
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  credit_id uuid REFERENCES credits,
  transaction_type transaction_type NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Credit Packages Table
CREATE TABLE IF NOT EXISTS credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_cents integer NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add subscription tier to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS total_credits integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_credits integer DEFAULT 0;

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- Policies for user_subscriptions
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for credits
CREATE POLICY "Users can read own credits"
  ON credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON credits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for credit_transactions
CREATE POLICY "Users can read own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for credit_packages
CREATE POLICY "Anyone can read active credit packages"
  ON credit_packages
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_cents, description) VALUES
  ('5 Credits', 5, 999, 'Perfect for occasional use'),
  ('10 Credits', 10, 1799, 'Great for regular users'),
  ('25 Credits', 25, 3999, 'Best value for active users'),
  ('50 Credits', 50, 6999, 'Premium pack for heavy users');

-- Function to initialize user subscription and credits
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user subscription
  INSERT INTO user_subscriptions (user_id, tier, billing_cycle_start, billing_cycle_end)
  VALUES (NEW.user_id, 'free', now(), now() + interval '1 month');
  
  -- Create initial monthly credits for free tier
  INSERT INTO credits (user_id, credit_type, amount, billing_cycle_start, billing_cycle_end, expires_at)
  VALUES (NEW.user_id, 'monthly', 3, now(), now() + interval '1 month', now() + interval '1 month');
  
  -- Update profile with initial credits
  UPDATE profiles 
  SET subscription_tier = 'free',
      total_credits = 3,
      available_credits = 3
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize subscription when profile is created
CREATE TRIGGER initialize_user_subscription_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();

-- Function to calculate user's available credits
CREATE OR REPLACE FUNCTION calculate_user_credits(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  total_credits integer := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_credits
  FROM credits
  WHERE user_id = user_uuid 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now());
  
  RETURN total_credits;
END;
$$ LANGUAGE plpgsql;

-- Function to consume credits
CREATE OR REPLACE FUNCTION consume_credits(user_uuid uuid, credits_to_consume integer)
RETURNS boolean AS $$
DECLARE
  current_credits integer;
  credit_record RECORD;
  credits_remaining integer := credits_to_consume;
BEGIN
  -- Check if user has enough credits
  SELECT calculate_user_credits(user_uuid) INTO current_credits;
  
  IF current_credits < credits_to_consume THEN
    RETURN false;
  END IF;
  
  -- Consume credits in order: monthly first, then purchased (oldest first)
  FOR credit_record IN 
    SELECT * FROM credits 
    WHERE user_id = user_uuid 
      AND is_active = true 
      AND amount > 0
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY 
      CASE credit_type 
        WHEN 'monthly' THEN 1 
        WHEN 'purchased' THEN 2 
        WHEN 'bonus' THEN 3 
      END,
      created_at ASC
  LOOP
    IF credits_remaining <= 0 THEN
      EXIT;
    END IF;
    
    IF credit_record.amount >= credits_remaining THEN
      -- This credit record has enough to cover remaining consumption
      UPDATE credits 
      SET amount = amount - credits_remaining
      WHERE id = credit_record.id;
      
      -- Record transaction
      INSERT INTO credit_transactions (user_id, credit_id, transaction_type, amount, balance_after, description)
      VALUES (user_uuid, credit_record.id, 'consumed', -credits_remaining, 
              credit_record.amount - credits_remaining, 'CV generation');
      
      credits_remaining := 0;
    ELSE
      -- This credit record will be fully consumed
      UPDATE credits 
      SET amount = 0
      WHERE id = credit_record.id;
      
      -- Record transaction
      INSERT INTO credit_transactions (user_id, credit_id, transaction_type, amount, balance_after, description)
      VALUES (user_uuid, credit_record.id, 'consumed', -credit_record.amount, 
              0, 'CV generation');
      
      credits_remaining := credits_remaining - credit_record.amount;
    END IF;
  END LOOP;
  
  -- Update profile available credits
  UPDATE profiles 
  SET available_credits = calculate_user_credits(user_uuid)
  WHERE user_id = user_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(user_uuid uuid, credits_to_add integer, credit_type_param credit_type, expires_at_param timestamptz DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO credits (user_id, credit_type, amount, expires_at)
  VALUES (user_uuid, credit_type_param, credits_to_add, expires_at_param);
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description)
  VALUES (user_uuid, 'earned', credits_to_add, 
          calculate_user_credits(user_uuid), 
          'Credits added: ' || credit_type_param::text);
  
  -- Update profile available credits
  UPDATE profiles 
  SET available_credits = calculate_user_credits(user_uuid),
      total_credits = total_credits + credits_to_add
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  monthly_credits integer;
  max_rollover integer;
  current_available integer;
  rollover_amount integer;
BEGIN
  FOR user_record IN 
    SELECT us.user_id, us.tier, us.billing_cycle_end
    FROM user_subscriptions us
    WHERE us.billing_cycle_end <= now() AND us.is_active = true
  LOOP
    -- Determine monthly credits and max rollover based on tier
    CASE user_record.tier
      WHEN 'free' THEN 
        monthly_credits := 3;
        max_rollover := 6;
      WHEN 'pro' THEN 
        monthly_credits := 30;
        max_rollover := 60;
      WHEN 'enterprise' THEN 
        monthly_credits := 100;
        max_rollover := 200;
    END CASE;
    
    -- Calculate current available credits
    SELECT calculate_user_credits(user_record.user_id) INTO current_available;
    
    -- Calculate rollover amount (up to max)
    rollover_amount := LEAST(current_available, max_rollover - monthly_credits);
    
    -- Expire old monthly credits
    UPDATE credits 
    SET is_active = false
    WHERE user_id = user_record.user_id 
      AND credit_type = 'monthly'
      AND billing_cycle_end <= now();
    
    -- Add new monthly credits
    INSERT INTO credits (user_id, credit_type, amount, billing_cycle_start, billing_cycle_end, expires_at)
    VALUES (user_record.user_id, 'monthly', monthly_credits + rollover_amount, 
            now(), now() + interval '1 month', now() + interval '1 month');
    
    -- Update billing cycle
    UPDATE user_subscriptions 
    SET billing_cycle_start = now(),
        billing_cycle_end = now() + interval '1 month'
    WHERE user_id = user_record.user_id;
    
    -- Update profile available credits
    UPDATE profiles 
    SET available_credits = calculate_user_credits(user_record.user_id)
    WHERE user_id = user_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to upgrade user subscription
CREATE OR REPLACE FUNCTION upgrade_subscription(user_uuid uuid, new_tier subscription_tier)
RETURNS void AS $$
DECLARE
  monthly_credits integer;
BEGIN
  -- Determine monthly credits for new tier
  CASE new_tier
    WHEN 'free' THEN monthly_credits := 3;
    WHEN 'pro' THEN monthly_credits := 30;
    WHEN 'enterprise' THEN monthly_credits := 100;
  END CASE;
  
  -- Update subscription
  UPDATE user_subscriptions 
  SET tier = new_tier,
      billing_cycle_start = now(),
      billing_cycle_end = now() + interval '1 month'
  WHERE user_id = user_uuid;
  
  -- Update profile
  UPDATE profiles 
  SET subscription_tier = new_tier
  WHERE user_id = user_uuid;
  
  -- Add immediate credits for new tier
  PERFORM add_credits(user_uuid, monthly_credits, 'monthly', now() + interval '1 month');
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_expires_at ON credits(expires_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier); 
