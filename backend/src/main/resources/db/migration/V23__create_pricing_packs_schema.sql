-- V23__create_pricing_packs_schema.sql
-- AutoCare AI — Dynamic Admin-Controlled Pricing Packs & Subscriptions Schema

CREATE TABLE IF NOT EXISTS pricing_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    pack_type VARCHAR(30) NOT NULL, -- 'SUBSCRIPTION' or 'CREDIT_PACK'
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    billing_period VARCHAR(30), -- 'MONTHLY', 'ANNUAL', 'ONE_TIME'
    vehicle_limit INT NOT NULL DEFAULT 1, -- -1 for unlimited
    ai_credits INT NOT NULL DEFAULT 0,
    features TEXT, -- JSON array string of features e.g. ["Feature 1", "Feature 2"]
    badge VARCHAR(50), -- e.g. 'Most Popular', 'Best Value'
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_packs_type_active ON pricing_packs(pack_type, is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_packs_order ON pricing_packs(display_order);

-- User active subscription tracking table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES pricing_packs(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);

-- Seed Initial Default Plans and Credit Topups (fully editable by Admin)
INSERT INTO pricing_packs (code, name, description, pack_type, price, currency, billing_period, vehicle_limit, ai_credits, features, badge, is_active, display_order)
VALUES
(
    'STARTER_FREE',
    'Starter Driver',
    'Essential maintenance tracking for single car owners.',
    'SUBSCRIPTION',
    0.00,
    'USD',
    'MONTHLY',
    1,
    10,
    '["1 Registered Vehicle", "10 AI Diagnosis Credits / mo", "Basic Maintenance Reminders", "Expense Logging"]',
    'Free Forever',
    true,
    1
),
(
    'PRO_DRIVER',
    'Pro Driver',
    'Advanced AI diagnostics, predictive component health, and bill scanning for daily drivers.',
    'SUBSCRIPTION',
    9.99,
    'USD',
    'MONTHLY',
    3,
    100,
    '["Up to 3 Registered Vehicles", "100 AI Diagnosis Credits / mo", "AI Predictive Health Warnings", "Invoice & Bill OCR Scanner", "Comprehensive PDF Health Reports", "Priority Push Notifications"]',
    'Most Popular',
    true,
    2
),
(
    'GARAGE_MASTER',
    'Garage Master',
    'Ultimate fleet control for enthusiasts and multi-vehicle households.',
    'SUBSCRIPTION',
    24.99,
    'USD',
    'MONTHLY',
    8,
    500,
    '["Up to 8 Registered Vehicles", "500 AI Diagnosis Credits / mo", "Full Digital Twin Telematics", "Multi-Driver Profile Sharing", "Market Resale Value Estimator", "VIP Customer Support"]',
    'Best Value',
    true,
    3
),
(
    'TOPUP_MINI_25',
    'Mini Diagnosis Top-up',
    'Quick single-session troubleshooting and fault code scan.',
    'CREDIT_PACK',
    2.99,
    'USD',
    'ONE_TIME',
    0,
    25,
    '["25 Instant AI Credits", "Single Fault Code Deep Analysis", "Never Expires"]',
    'Quick Boost',
    true,
    4
),
(
    'TOPUP_SMART_100',
    'Smart Inspection Pack',
    'Full vehicle diagnostic inspection and multiple invoice scans.',
    'CREDIT_PACK',
    9.99,
    'USD',
    'ONE_TIME',
    0,
    100,
    '["100 Instant AI Credits", "Complete Seasonal Vehicle Health Check", "10+ Invoice OCR Extractions", "Never Expires"]',
    'Popular Top-up',
    true,
    5
),
(
    'TOPUP_POWER_300',
    'Power Garage Pack',
    'Heavy-duty AI diagnostic allowance for complex repairs and DIY mechanics.',
    'CREDIT_PACK',
    24.99,
    'USD',
    'ONE_TIME',
    0,
    300,
    '["300 Instant AI Credits", "Multi-Vehicle In-Depth Simulations", "Priority AI Processing Queue", "Never Expires"]',
    'Power User',
    true,
    6
)
ON CONFLICT (code) DO NOTHING;
