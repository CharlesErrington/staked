-- Phase 3: Financial System Tables Migration
-- Debts, Payments, and Payment Confirmations

-- 7. Debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  debtor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creditor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  reason VARCHAR(255),
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  is_settled BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT different_parties CHECK (debtor_id != creditor_id)
);

CREATE INDEX idx_debts_group ON debts(group_id);
CREATE INDEX idx_debts_debtor ON debts(debtor_id);
CREATE INDEX idx_debts_creditor ON debts(creditor_id);
CREATE INDEX idx_debts_settled ON debts(is_settled);
CREATE INDEX idx_debts_archived ON debts(is_archived);

-- 8. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'disputed', 'cancelled')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_group ON payments(group_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_receiver ON payments(receiver_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 9. Payment confirmations table
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  confirmed_by UUID REFERENCES users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  CONSTRAINT unique_confirmation UNIQUE(payment_id, confirmed_by)
);

CREATE INDEX idx_confirmations_payment ON payment_confirmations(payment_id);
CREATE INDEX idx_confirmations_user ON payment_confirmations(confirmed_by);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Composite indexes for common queries
CREATE INDEX idx_debts_group_settled ON debts(group_id, is_settled);
CREATE INDEX idx_payments_group_status ON payments(group_id, status);

-- Partial index for unsettled debts
CREATE INDEX idx_unsettled_debts ON debts(debtor_id, creditor_id) WHERE is_settled = false;