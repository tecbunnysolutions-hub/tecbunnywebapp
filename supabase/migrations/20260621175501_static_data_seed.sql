-- 1. App Configuration / Settings
INSERT INTO app_settings (key, value, description) VALUES
('NEXT_PUBLIC_SUPPORT_PHONE', '"+91 96041 36010"', 'Global support phone number'),
('GST_RATE', '0.18', 'Fallback GST rate'),
('siteUrl', '"https://www.tecbunny.com"', 'Base URL for the site'),
('defaultOgImage', '"https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/TECBUNNY_SOLUTIONS_PVT_LTD-removebg-preview.png"', 'Default OpenGraph Image'),
('defaultDescription', '"TecBunny Solutions provides premium CCTV installation, IT services, AMC support, and home automation in Goa and Maharashtra. Secure your space now."', 'Default Site Description'),
('fallbackTitle', '"TecBunny | CCTV, IT Services & Home Automation in Goa"', 'Fallback SEO Title'),
('VALIDATION_PATTERNS', '{"email": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "mobile": "^[6-9]\\d{9}$", "gstin": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", "pan": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", "pincode": "^[1-9][0-9]{5}$"}', 'Regex validation strings'),
('ORDER_STATUS_FLOW', '["Pending", "Awaiting Payment", "Payment Failed", "Payment Confirmed", "Confirmed", "Processing", "Ready to Ship", "Shipped", "Ready for Pickup", "Completed", "Delivered"]', 'Order status steps'),
('SERVICE_ORDER_STATUS_FLOW', '["Pending", "Awaiting Payment", "Visit Scheduled", "Visit Completed", "Diagnosis Done", "Quote Sent", "Awaiting Customer Approval", "Approved", "Parts Ordered", "Work In Progress", "Quality Check", "Ready for Pickup", "Ready for Delivery", "Delivered/Picked Up", "Completed", "Warranty/Support Active"]', 'Service order status steps'),
('ERROR_MESSAGES', '{"INVALID_EMAIL": "Please enter a valid email address", "INVALID_MOBILE": "Please enter a valid 10-digit mobile number", "INVALID_GSTIN": "Please enter a valid GSTIN", "REQUIRED_FIELD": "This field is required", "NETWORK_ERROR": "Network error. Please try again.", "UNAUTHORIZED": "You are not authorized to perform this action", "SERVER_ERROR": "Server error. Please try again later."}', 'Standard error messages')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. GST Rates
INSERT INTO gst_rates (category, rate) VALUES
('Electronics', 18),
('Accessories', 18),
('Books', 5),
('Clothing', 12),
('Food', 5),
('Health', 12),
('Home', 18),
('Sports', 18),
('Software', 18),
('Services', 18),
('Gaming', 18),
('Furniture', 18),
('Automotive', 28)
ON CONFLICT (category) DO UPDATE SET rate = EXCLUDED.rate;

-- 3. Roles and Permissions
INSERT INTO roles_permissions (role, permissions) VALUES
('customer', '{"canViewProducts": true, "canPlaceOrders": true, "canViewOwnOrders": true, "canManageProfile": true}'),
('sales', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true}'),
('sales-staff', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true}'),
('sales-external', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true}'),
('manager', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true, "canManageInventory": true, "canViewReports": true}'),
('accounts', '{"canViewOrders": true, "canManageInvoices": true, "canViewReports": true, "canManageExpenses": true}'),
('admin', '{"canManageEverything": true}'),
('superadmin', '{"canManageEverything": true}'),
('service_engineer', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canManageInventory": true, "canViewReports": true}')
ON CONFLICT (role) DO UPDATE SET permissions = EXCLUDED.permissions;

-- 4. Customer Categories
INSERT INTO customer_categories (type, name, discount_percentage, benefits) VALUES
('B2C', 'Normal', 0, '["Standard pricing", "Basic support"]'),
('B2C', 'Standard', 5, '["5% discount on all products", "Priority support", "Extended warranty"]'),
('B2C', 'Premium', 10, '["10% discount on all products", "VIP support", "Free installation", "Extended warranty"]'),
('B2B', 'Bronze', 8, '["8% wholesale discount", "Account manager"]'),
('B2B', 'Silver', 12, '["12% wholesale discount", "Account manager", "Priority fulfillment"]'),
('B2B', 'Gold', 15, '["15% wholesale discount", "Dedicated account manager", "Net-30 terms available"]')
ON CONFLICT DO NOTHING; -- Rely on serial ID, simplistic seed here.

-- 5. Custom Setup Constants
INSERT INTO custom_setup_constants (key, value) VALUES
('AVERAGE_RUN_METERS_PER_CAMERA', 25),
('INSTALLATION_LABOR_PER_CAMERA', 299),
('INSTALLATION_SETUP_CONFIGURATION_COST', 1000),
('INSTALLATION_LABOR_PER_METER_CABLE', 2)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. Custom Setup Inventory (Sample based on fallback arrays)
INSERT INTO custom_setup_inventory (id, category, label, capacity, mrp, sale) VALUES
('dvr-4-2mp', 'analog_dvr', '4 Channel DVR (2MP Model)', 4, 5199, 2499),
('dvr-4-5mp', 'analog_dvr', '4 Channel DVR (5MP Model)', 4, 5799, 2799),
('dvr-8', 'analog_dvr', '8 Channel DVR', 8, 6699, 3799),
('dvr-16', 'analog_dvr', '16 Channel DVR', 16, 19999, 6999),
('dvr-32', 'analog_dvr', '32 Channel DVR', 32, 32999, 13999),

('smps-4', 'analog_smps', '4 Channel SMPS (5A)', 4, 1999, 1249),
('smps-8', 'analog_smps', '8 Channel SMPS (10A)', 8, 2699, 1699),
('smps-16', 'analog_smps', '16 Channel SMPS (20A)', 16, 3999, 2599),

('analog-2.4-standard', 'analog_camera', '2.4 MP Standard', null, 1899, 1299),
('analog-2.4-dual', 'analog_camera', '2.4 MP Dual-light', null, 2199, 1499),
('analog-5-standard', 'analog_camera', '5 MP Standard', null, 2499, 1799),
('analog-5-dual', 'analog_camera', '5 MP Dual-light', null, 2899, 2149),

('cable-coaxial-100m', 'analog_cable', 'CCTV Coaxial Cable (100m Roll)', 100, 3199, 2499),

('nvr-8', 'ip_nvr', '8 Channel NVR', 8, 8999, 5499),
('nvr-16', 'ip_nvr', '16 Channel NVR', 16, 12999, 7899),
('nvr-32', 'ip_nvr', '32 Channel NVR', 32, 18999, 11499),

('poe-8', 'ip_poe', '8 Port PoE Switch', 8, 4999, 3199),
('poe-16', 'ip_poe', '16 Port PoE Switch', 16, 6999, 4499),
('poe-32', 'ip_poe', '32 Port PoE Switch', 32, 10999, 6999),

('ip-2-standard', 'ip_camera', '2 MP Standard', null, 3299, 2399),
('ip-2-dual', 'ip_camera', '2 MP Dual-light', null, 3699, 2699),
('ip-4-standard', 'ip_camera', '4 MP Standard', null, 4199, 2999),
('ip-4-dual', 'ip_camera', '4 MP Dual-light', null, 4899, 3699),

('cable-lan-100m', 'ip_cable', 'LAN Cable (100m Box)', 100, 3399, 2699),

('hdd-500', 'hdd', '500 GB Surveillance HDD', null, 3499, 2699),
('hdd-1tb', 'hdd', '1 TB Surveillance HDD', null, 4499, 3399),
('hdd-2tb', 'hdd', '2 TB Surveillance HDD', null, 5999, 4699),

('monitor-19', 'monitor', '19" Surveillance Monitor', null, 9999, 7499),
('monitor-21', 'monitor', '21" Surveillance Monitor', null, 12999, 9999),
('monitor-24', 'monitor', '24" Surveillance Monitor', null, 15999, 11999),

('wall-mount-addon', 'accessory', 'Wall Mount Installation Kit', null, 699, 499),
('spike-guard', 'accessory', 'Spike Guard / Power Surge Protector', null, 1999, 1299),

('rack-2u', 'rack', 'Rack Cabinet - 2U', null, 4999, 3299),
('rack-3u', 'rack', 'Rack Cabinet - 3U', null, 5999, 3999),
('rack-4u', 'rack', 'Rack Cabinet - 4U', null, 6999, 4599),

('conduit-open', 'conduit', 'Open Conduit Pipe (₹10/mtr)', null, 10, 10),
('conduit-concealed', 'conduit', 'Concealed Conduit Pipe (₹4/mtr)', null, 4, 4),

('installation', 'installation', 'On-site Installation & Configuration', null, 4500, 4500)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  capacity = EXCLUDED.capacity,
  mrp = EXCLUDED.mrp,
  sale = EXCLUDED.sale;
