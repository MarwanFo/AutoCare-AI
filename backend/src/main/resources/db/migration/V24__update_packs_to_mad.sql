-- V24__update_packs_to_mad.sql
-- Update pricing packs default currency and seeded prices to Moroccan Dirhams (MAD / DH)

ALTER TABLE pricing_packs ALTER COLUMN currency SET DEFAULT 'MAD';

UPDATE pricing_packs 
SET currency = 'MAD', price = 0.00 
WHERE code = 'STARTER_FREE';

UPDATE pricing_packs 
SET currency = 'MAD', price = 99.00 
WHERE code = 'PRO_DRIVER';

UPDATE pricing_packs 
SET currency = 'MAD', price = 249.00 
WHERE code = 'GARAGE_MASTER';

UPDATE pricing_packs 
SET currency = 'MAD', price = 29.00 
WHERE code = 'TOPUP_MINI_25';

UPDATE pricing_packs 
SET currency = 'MAD', price = 99.00 
WHERE code = 'TOPUP_SMART_100';

UPDATE pricing_packs 
SET currency = 'MAD', price = 249.00 
WHERE code = 'TOPUP_POWER_300';
