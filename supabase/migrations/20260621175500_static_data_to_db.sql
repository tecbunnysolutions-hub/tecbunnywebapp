-- 1. App Configuration / Settings
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GST Rates
CREATE TABLE IF NOT EXISTS gst_rates (
  category VARCHAR PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Roles and Permissions
CREATE TABLE IF NOT EXISTS roles_permissions (
  role VARCHAR PRIMARY KEY,
  permissions JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer & B2B Categories (Discounts & Benefits)
CREATE TABLE IF NOT EXISTS customer_categories (
  id SERIAL PRIMARY KEY,
  type VARCHAR NOT NULL, -- 'B2C' or 'B2B'
  name VARCHAR NOT NULL, -- e.g., 'Standard', 'Gold'
  discount_percentage NUMERIC NOT NULL,
  benefits JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Custom Setup Prices & Constants
CREATE TABLE IF NOT EXISTS custom_setup_constants (
  key VARCHAR PRIMARY KEY,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_setup_inventory (
  id VARCHAR PRIMARY KEY,
  category VARCHAR NOT NULL, -- 'analog_dvr', 'ip_nvr', 'hdd', 'monitor', etc.
  label VARCHAR NOT NULL,
  capacity INT,
  mrp NUMERIC,
  sale NUMERIC NOT NULL,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_constants ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_inventory ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Admin Write)
CREATE POLICY "Allow public read-only access to app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to gst_rates" ON gst_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to roles_permissions" ON roles_permissions FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to customer_categories" ON customer_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to custom_setup_constants" ON custom_setup_constants FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to custom_setup_inventory" ON custom_setup_inventory FOR SELECT USING (true);
