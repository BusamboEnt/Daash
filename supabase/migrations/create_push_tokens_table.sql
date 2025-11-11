-- Create push_tokens table for storing FCM tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  fcm_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, platform)
);

-- Create index for faster lookups by wallet_address
CREATE INDEX IF NOT EXISTS idx_push_tokens_wallet_address ON push_tokens(wallet_address);

-- Create index for faster lookups by fcm_token
CREATE INDEX IF NOT EXISTS idx_push_tokens_fcm_token ON push_tokens(fcm_token);

-- Enable Row Level Security
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own tokens
CREATE POLICY "Users can insert their own push tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own push tokens"
  ON push_tokens FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own push tokens"
  ON push_tokens FOR DELETE
  USING (true);

CREATE POLICY "Users can view their own push tokens"
  ON push_tokens FOR SELECT
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_push_tokens_updated_at_trigger
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- Add comments
COMMENT ON TABLE push_tokens IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN push_tokens.wallet_address IS 'Stellar wallet public key (address)';
COMMENT ON COLUMN push_tokens.fcm_token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN push_tokens.platform IS 'Mobile platform: ios or android';
COMMENT ON COLUMN push_tokens.device_info IS 'Additional device information (model, OS version, etc.)';
