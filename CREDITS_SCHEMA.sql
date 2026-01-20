-- =====================================================
-- Credits System Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. User Credits Table
-- =====================================================
-- Stores user credit balance
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 3,  -- Start with 3 free credits
  lifetime_credits INTEGER NOT NULL DEFAULT 3,  -- Total credits ever purchased/received
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- =====================================================
-- 2. Credit Transactions Table
-- =====================================================
-- Tracks all credit purchases and usage
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,  -- Positive for purchases, negative for usage
  balance_after INTEGER NOT NULL,  -- Balance after transaction
  transaction_type VARCHAR(50) NOT NULL,  -- 'purchase', 'usage', 'bonus', 'refund'
  description TEXT,  -- e.g., "Resume generation for Software Engineer role"
  metadata JSONB DEFAULT '{}',  -- Store additional info (payment ID, resume ID, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- =====================================================
-- 3. Credit Packages Table (for reference)
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,  -- Price in cents (e.g., 900 = $9.00)
  original_price_cents INTEGER,  -- Original price before discount
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default packages
INSERT INTO credit_packages (name, credits, price_cents, original_price_cents, features) VALUES
  ('Starter', 10, 900, 1900, '["10 AI-powered resume generations", "All 51 professional templates", "ATS optimization included", "PDF & DOCX export", "Basic support"]'),
  ('Professional', 25, 1900, 3900, '["25 AI-powered resume generations", "All 51 professional templates", "ATS optimization included", "PDF & DOCX export", "Cover letter builder included", "Priority support", "LinkedIn profile import"]'),
  ('Enterprise', 99, 4900, 9900, '["99 AI-powered resume generations", "All 51 professional templates", "ATS optimization included", "PDF & DOCX export", "Cover letter builder included", "Priority support", "LinkedIn profile import", "Version history & cloud backup", "Dedicated account manager"]')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. Functions
-- =====================================================

-- Function to initialize credits for new users
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits, lifetime_credits)
  VALUES (NEW.id, 3, 3)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the initial bonus
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, description)
  VALUES (NEW.id, 3, 3, 'bonus', 'Welcome bonus - 3 free credits');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create credits for new users
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- Function to use a credit
CREATE OR REPLACE FUNCTION use_credit(
  p_user_id UUID,
  p_description TEXT DEFAULT 'Resume generation'
)
RETURNS JSON AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_credits IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User credits not found');
  END IF;

  IF v_current_credits < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient credits', 'credits', v_current_credits);
  END IF;

  -- Deduct credit
  v_new_balance := v_current_credits - 1;

  UPDATE user_credits
  SET credits = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, description)
  VALUES (p_user_id, -1, v_new_balance, 'usage', p_description);

  RETURN json_build_object('success', true, 'credits', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for purchases)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50) DEFAULT 'purchase',
  p_description TEXT DEFAULT 'Credit purchase',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_credits IS NULL THEN
    -- Initialize if not exists
    INSERT INTO user_credits (user_id, credits, lifetime_credits)
    VALUES (p_user_id, p_amount, p_amount);
    v_new_balance := p_amount;
  ELSE
    v_new_balance := v_current_credits + p_amount;

    UPDATE user_credits
    SET
      credits = v_new_balance,
      lifetime_credits = lifetime_credits + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, description, metadata)
  VALUES (p_user_id, p_amount, v_new_balance, p_transaction_type, p_description, p_metadata);

  RETURN json_build_object('success', true, 'credits', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Initialize if not exists
  IF v_credits IS NULL THEN
    INSERT INTO user_credits (user_id, credits, lifetime_credits)
    VALUES (p_user_id, 3, 3)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN 3;
  END IF;

  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Grant Permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_credits TO authenticated;
GRANT UPDATE ON user_credits TO authenticated;
GRANT SELECT, INSERT ON credit_transactions TO authenticated;
GRANT SELECT ON credit_packages TO authenticated;
GRANT EXECUTE ON FUNCTION use_credit TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_credits TO authenticated;
