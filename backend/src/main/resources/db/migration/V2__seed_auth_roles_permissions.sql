-- V2__seed_auth_roles_permissions.sql
-- AutoCare AI Authentication Module Roles and Permissions Data Seeding

-- 1. Seed Roles
INSERT INTO roles (name, description) VALUES
('ROLE_USER', 'Standard user with driver/vehicle owner capabilities.'),
('ROLE_ADMIN', 'Platform administrator with system-wide management and auditing capabilities.')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Permissions
INSERT INTO permissions (name, description) VALUES
('vehicles:read', 'Allows viewing own vehicles list and statistics.'),
('vehicles:write', 'Allows creating, modifying, and archiving own vehicles.'),
('expenses:read', 'Allows viewing own logged vehicle maintenance expenses.'),
('expenses:write', 'Allows logging and editing own vehicle maintenance expenses.'),
('expenses:approve', 'Allows reviewing and approving/declining platform maintenance expenses.'),
('users:manage', 'Allows administrative management of user accounts and system parameters.'),
('ai:chat', 'Allows interacting with the AutoCare AI assistant.')
ON CONFLICT (name) DO NOTHING;

-- 3. Map Permissions to ROLE_USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_USER'
  AND p.name IN (
      'vehicles:read', 
      'vehicles:write', 
      'expenses:read', 
      'expenses:write', 
      'ai:chat'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. Map Permissions to ROLE_ADMIN (Full access privileges)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN'
  AND p.name IN (
      'vehicles:read', 
      'vehicles:write', 
      'expenses:read', 
      'expenses:write', 
      'expenses:approve', 
      'users:manage', 
      'ai:chat'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
