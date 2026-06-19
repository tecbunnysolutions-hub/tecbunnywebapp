INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-ultra-64gb-usb-3-0-flash-drive', 
  'SanDisk Ultra 64GB USB 3.0 Flash Drive', 
  'SanDisk Ultra 64GB USB 3.0 Flash Drive', 
  '<p>Step up to high-speed USB 3.0 and transfer your videos, photos, and files faster. The SanDisk Ultra USB 3.0 Flash Drive offers transfer speeds of up to 130MB/s.</p><ul><li><b>Capacity:</b> 64GB</li><li><b>Interface:</b> USB 3.0 (USB 3.2 Gen 1)</li><li><b>Speed:</b> Read speeds up to 130MB/s.</li><li><b>Design:</b> Sleek, durable design with a retractable connector.</li><li><b>Security:</b> Includes SanDisk SecureAccess software.</li></ul>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3d82a476-913e-40a3-8113-8da9113a66f1-1781881374781.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3d82a476-913e-40a3-8113-8da9113a66f1-1781881374781.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1299, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-128gb-m-2-nvme-ssd-evmnv-128gb-520mb-s-read-370mb-s-writ', 
  'EVM 128GB M.2 NVMe SSD (EVMNV/128GB)-- 520MB/s Read & 370MB/s Write ', 
  'EVM 128GB M.2 NVMe SSD (EVMNV/128GB)-- 520MB/s Read & 370MB/s Write ', 
  '<p>Experience next-level performance with the EVM 128GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d715fe1d-7522-4e36-8a57-c655307d5c91-1781881376034.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d715fe1d-7522-4e36-8a57-c655307d5c91-1781881376034.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2599, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-ultra-256gb-usb-3-0-flash-drive', 
  'SanDisk Ultra 256GB USB 3.0 Flash Drive', 
  'SanDisk Ultra 256GB USB 3.0 Flash Drive', 
  '<p>Step up to high-speed USB 3.0 and transfer your videos, photos, and files faster. The SanDisk Ultra USB 3.0 Flash Drive offers transfer speeds of up to 130MB/s and a massive 256GB capacity.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Interface:</b> USB 3.0 (USB 3.2 Gen 1)</li><li><b>Speed:</b> Read speeds up to 130MB/s.</li><li><b>Design:</b> Sleek, durable design with a retractable connector.</li><li><b>Security:</b> Includes SanDisk SecureAccess software.</li></ul>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1c12ff30-e126-4fb0-93bf-b2b6398924a6-1781881376910.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1c12ff30-e126-4fb0-93bf-b2b6398924a6-1781881376910.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2799, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-256gb-m-2-nvme-ssd-evmnv-256gb-540mb-s-read-450mb-s-writ', 
  'EVM 256GB M.2 NVMe SSD (EVMNV/256GB) 540MB/s Read & 450MB/s Write', 
  'EVM 256GB M.2 NVMe SSD (EVMNV/256GB) 540MB/s Read & 450MB/s Write', 
  '<p>Experience next-level performance with the EVM 256GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a974d404-e943-4397-97fe-96652bedd595-1781881377768.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a974d404-e943-4397-97fe-96652bedd595-1781881377768.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4399, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-1tb-2-5-inch-sata-ssd-evm25-1tb', 
  'EVM 1TB 2.5-inch SATA SSD (EVM25/1TB)', 
  'EVM 1TB 2.5-inch SATA SSD (EVM25/1TB)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 1TB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness with ample storage.</p><ul><li><b>Capacity:</b> 1TB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect high-capacity upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e925f5c6-3a7d-4095-8965-387171f0c240-1781881378701.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e925f5c6-3a7d-4095-8965-387171f0c240-1781881378701.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  13299, 
  15999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-256gb-2-5-inch-sata-ssd-evm25-256', 
  'EVM 256GB 2.5-inch SATA SSD (EVM25/256)', 
  'EVM 256GB 2.5-inch SATA SSD (EVM25/256)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 256GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2b9e6d69-b3e2-47a0-8e26-3ec128c12c92-1781881379579.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2b9e6d69-b3e2-47a0-8e26-3ec128c12c92-1781881379579.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3799, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-cruzer-blade-64gb-usb-2-0-flash-drive', 
  'SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive', 
  'SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive', 
  '<p>The SanDisk Cruzer Blade USB 2.0 Flash Drive offers a compact, stylish design and ample capacity.</p><ul><li><b>Capacity:</b> 64GB</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Ultra-compact and portable contoured styling.</li><li><b>Software:</b> Includes SanDisk SecureAccess software for password protection.</li></ul><p>A reliable and easy way to store, share, and transfer your photos, videos, music, and other files.</p>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/9c5fb4e1-b450-4d81-bc77-c6156dcfe370-1781881380576.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/9c5fb4e1-b450-4d81-bc77-c6156dcfe370-1781881380576.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  699, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-128gb-2-5-inch-sata-ssd-evm25-128', 
  'EVM 128GB 2.5-inch SATA SSD (EVM25/128)', 
  'EVM 128GB 2.5-inch SATA SSD (EVM25/128)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 128GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2c4a78a8-395b-4e57-b222-d156e58f1fef-1781881381707.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2c4a78a8-395b-4e57-b222-d156e58f1fef-1781881381707.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2399, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-cruzer-blade-128gb-usb-2-0-flash-drive', 
  'SanDisk Cruzer Blade 128GB USB 2.0 Flash Drive', 
  'SanDisk Cruzer Blade 128GB USB 2.0 Flash Drive', 
  '<p>The SanDisk Cruzer Blade USB 2.0 Flash Drive offers a compact, stylish design and a large 128GB capacity.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Ultra-compact and portable contoured styling.</li><li><b>Software:</b> Includes SanDisk SecureAccess software for password protection.</li></ul><p>A reliable and easy way to store, share, and transfer your photos, videos, music, and other files.</p>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/801c679f-906a-4a8b-9720-d83e6b75532d-1781881382939.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/801c679f-906a-4a8b-9720-d83e6b75532d-1781881382939.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1399, 
  1999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-512gb-2-5-inch-sata-ssd-evm25-512', 
  'EVM 512GB 2.5-inch SATA SSD (EVM25/512)', 
  'EVM 512GB 2.5-inch SATA SSD (EVM25/512)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 512GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 512GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a9337df3-b731-4451-9148-8a11efa6e5bf-1781881383514.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a9337df3-b731-4451-9148-8a11efa6e5bf-1781881383514.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  5899, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-512gb-m-2-nvme-ssd-evmnv-512gb-540mb-s-read-450mb-s-writ', 
  'EVM 512GB M.2 NVMe SSD (EVMNV/512GB) 540MB/s Read & 450MB/s Write', 
  'EVM 512GB M.2 NVMe SSD (EVMNV/512GB) 540MB/s Read & 450MB/s Write', 
  '<p>Experience next-level performance with the EVM 512GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 512GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bb78d6d8-0bc2-4fdd-8bfd-6437ef4d46be-1781881384968.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bb78d6d8-0bc2-4fdd-8bfd-6437ef4d46be-1781881384968.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  7299, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-h110-motherboard', 
  'EVM H110 Motherboard', 
  'EVM H110 Motherboard', 
  '<p>Upgrade to DDR4 with the EVM H110 Motherboard, designed for 6th and 7th Generation Intel Core processors.</p><ul><li><b>Chipset:</b> Intel H110</li><li><b>Socket:</b> LGA 1151</li><li><b>Memory Support:</b> Dual Channel DDR4 (2133/2400MHz)</li><li><b>Form Factor:</b> Micro-ATX</li><li><b>Ports:</b> VGA, HDMI, USB 3.0, USB 2.0, LAN</li></ul>', 
  'EVM', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/eda7cb1d-7e44-4578-8086-19df90dd5e31-1781881385815.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/eda7cb1d-7e44-4578-8086-19df90dd5e31-1781881385815.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4599, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-8gb-ddr3-1600mhz-ram', 
  'EVM 8GB DDR3 1600MHz RAM', 
  'EVM 8GB DDR3 1600MHz RAM', 
  '<p>Maximize your DDR3 system''s multitasking capabilities with this 8GB memory module from EVM.</p><ul><li><b>Capacity:</b> 8GB</li><li><b>Type:</b> DDR3</li><li><b>Speed:</b> 1600MHz (PC3-12800)</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>', 
  'EVM', 
  'Computer Components', 
  'RAM', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e5c05292-ed89-4d55-a8ac-9f550220571d-1781881386788.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e5c05292-ed89-4d55-a8ac-9f550220571d-1781881386788.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1799, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-8gb-ddr4-2666mhz-ram', 
  'EVM 8GB DDR4 2666MHz RAM', 
  'EVM 8GB DDR4 2666MHz RAM', 
  '<p>A high-performance 8GB DDR4 memory module for modern desktops. Runs at a speedy 2666MHz.</p><ul><li><b>Capacity:</b> 8GB</li><li><b>Type:</b> DDR4</li><li><b>Speed:</b> 2666MHz</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>', 
  'EVM', 
  'Computer Components', 
  'RAM', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5c3ba1d8-f649-4c5b-972c-614c6dec93a8-1781881387679.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5c3ba1d8-f649-4c5b-972c-614c6dec93a8-1781881387679.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4699, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-4gb-ddr3-1600mhz-ram', 
  'EVM 4GB DDR3 1600MHz RAM', 
  'EVM 4GB DDR3 1600MHz RAM', 
  '<p>Boost your PC''s performance with this 4GB DDR3 memory module. Ideal for systems supporting 1600MHz RAM.</p><ul><li><b>Capacity:</b> 4GB</li><li><b>Type:</b> DDR3</li><li><b>Speed:</b> 1600MHz (PC3-12800)</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>', 
  'EVM', 
  'Computer Components', 
  'RAM', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7420b8e6-dabd-4ee7-ae14-4a5caeaf8bba-1781881388902.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7420b8e6-dabd-4ee7-ae14-4a5caeaf8bba-1781881388902.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  799, 
  3999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'enter-19-inch-led-monitor', 
  'Enter 19-Inch LED Monitor', 
  'Enter 19-Inch LED Monitor', 
  '<p>An affordable and reliable 19-inch (18.5-inch viewable) LED monitor from Enter. Perfect for office work, home use, or as a secondary display.</p><ul><li><b>Screen Size:</b> 19-inch (18.5" diagonal)</li><li><b>Panel Type:</b> LED</li><li><b>Resolution:</b> 1366 x 768 (HD)</li><li><b>Inputs:</b> 1x VGA, 1x HDMI</li><li><b>Design:</b> Slim profile, VESA mount compatible.</li></ul>', 
  'Enter', 
  'Monitors', 
  'LED Monitors', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/05721867-8454-4c1c-95a3-a71f142cb16a-1781881389843.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/05721867-8454-4c1c-95a3-a71f142cb16a-1781881389843.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2999, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'zebronics-600va-ups-zeb-u725', 
  'Zebronics 600VA UPS (Zeb-U725)', 
  'Zebronics 600VA UPS (Zeb-U725)', 
  '<p>Protect your PC and other electronics from power outages with the Zebronics 600VA UPS. Provides essential battery backup and surge protection.</p><ul><li><b>Capacity:</b> 600VA / 360W</li><li><b>Type:</b> Line Interactive</li><li><b>Backup Time:</b> Provides 10-15 minutes of backup (typical PC load).</li><li><b>Features:</b> Automatic Voltage Regulation (AVR), Audible Alarm.</li><li><b>Outlets:</b> 3x India 3-pin outlets (battery backup).</li></ul>', 
  'Zebronics', 
  'Power Backup', 
  'UPS', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/cba71234-8cb9-4936-a256-83fe2c0055c7-1781881390668.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/cba71234-8cb9-4936-a256-83fe2c0055c7-1781881390668.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  999, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'artis-smp-400c-smps-power-supply', 
  'Artis SMP 400C SMPS (Power Supply)', 
  'Artis SMP 400C SMPS (Power Supply)', 
  '<p>A reliable standard power supply for basic desktop computers. The Artis 400C provides stable power for home and office builds.</p><ul><li><b>Wattage:</b> 400W (Peak)</li><li><b>Fan:</b> 80mm Cooling Fan</li><li><b>Connectors:</b> 24-pin ATX, 4-pin CPU, SATA, Molex</li><li><b>Protection:</b> Over Voltage Protection (OVP).</li></ul>', 
  'Artis', 
  'Computer Components', 
  'Power Supplies', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/93d79bc8-86d9-484b-802a-4948b96f21df-1781881391512.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/93d79bc8-86d9-484b-802a-4948b96f21df-1781881391512.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2699, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'quick-heal-internet-security-1-user-1-year', 
  'Quick Heal Internet Security 1 User 1 Year', 
  'Quick Heal Internet Security 1 User 1 Year', 
  '<p>Comprehensive antivirus and internet security for your PC. Quick Heal Internet Security protects you from malware, ransomware, and online threats.</p><ul><li><b>Device Support:</b> 1 User (PC)</li><li><b>Subscription:</b> 1 Year License</li><li><b>Protection:</b> Advanced DNAScan, Ransomware Protection, Safe Banking, Firewall.</li><li><b>Type:</b> Digital License / Activation Code.</li></ul>', 
  'Quick Heal', 
  'Software', 
  'Antivirus & Security', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a4139eb4-ad02-429f-8b18-c2f1cb8241a5-1781881392440.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a4139eb4-ad02-429f-8b18-c2f1cb8241a5-1781881392440.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  499, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'tp-link-archer-c6-ac1200-wireless-router', 
  'TP-Link Archer C6 AC1200 Wireless Router', 
  'TP-Link Archer C6 AC1200 Wireless Router', 
  '<p>Upgrade your home network to high-speed dual-band Wi-Fi with the TP-Link Archer C6. It supports the 802.11ac standard and delivers speeds up to 1200Mbps.</p><ul><li><b>Speed:</b> AC1200 (867Mbps on 5GHz + 300Mbps on 2.4GHz)</li><li><b>Antennas:</b> 4x external antennas + 1x internal</li><li><b>Ports:</b> 1x Gigabit WAN, 4x Gigabit LAN</li><li><b>Features:</b> MU-MIMO, Access Point Mode, OneMesh support.</li></ul>', 
  'TP-Link', 
  'Networking', 
  'Routers', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/522c2967-941d-4710-b18d-d009ea8919e3-1781881393460.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/522c2967-941d-4710-b18d-d009ea8919e3-1781881393460.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3199, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-vintage-keyboard-combo-blue', 
  'Coconut Vintage Keyboard Combo - Blue', 
  'Coconut Vintage Keyboard Combo - Blue', 
  '<p>A stylish wired keyboard and mouse combo with a retro "vintage" typewriter-key design in a striking blue color.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Vintage Blue, Round Typewriter-style Keycaps</li><li><b>Features:</b> LED backlit keyboard, Ergonomic mouse.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/78a2c7e9-006f-4653-831b-6d233e9ad0d8-1781881394702.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/78a2c7e9-006f-4653-831b-6d233e9ad0d8-1781881394702.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1699, 
  3999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-k26-illume-mechanical-keyboard', 
  'Coconut K26 Illume Mechanical Keyboard', 
  'Coconut K26 Illume Mechanical Keyboard', 
  '<p>The Coconut K26 Illume is a full-sized mechanical keyboard built for gamers and typists. Features durable mechanical switches and vibrant illumination.</p><ul><li><b>Type:</b> Mechanical (Blue/Red switches common)</li><li><b>Layout:</b> Full-size 104 Keys</li><li><b>Lighting:</b> LED Backlit (e.g., Rainbow or 7-color)</li><li><b>Build:</b> Metal Panel, Braided Cable</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/8d3ee7b2-f0e6-4d73-8771-749eb4a03ddd-1781881395794.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/8d3ee7b2-f0e6-4d73-8771-749eb4a03ddd-1781881395794.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  599, 
  1999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-m16-usb-gaming-mouse-zeta-black', 
  'Coconut M16 USB Gaming Mouse - Zeta Black', 
  'Coconut M16 USB Gaming Mouse - Zeta Black', 
  '<p>The Coconut M16 is a wired USB gaming mouse designed for comfort and precision. Features customizable RGB lighting to match your setup.</p><ul><li><b>Connection:</b> Wired USB</li><li><b>Design:</b> Ergonomic, Zeta Black, RGB Lighting</li><li><b>DPI:</b> High-Precision Sensor (e.g., up to 3200 DPI)</li><li><b>Buttons:</b> 6 Buttons with scroll wheel.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e52b13cc-c2f0-4e6e-abda-1717ef075fa2-1781881396825.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e52b13cc-c2f0-4e6e-abda-1717ef075fa2-1781881396825.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  199, 
  399
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wm21-wireless-bt-mouse-kudos-black', 
  'Coconut WM21 Wireless+BT Mouse Kudos - Black', 
  'Coconut WM21 Wireless+BT Mouse Kudos - Black', 
  '<p>The ultimate versatile mouse. The Coconut WM21 can connect via 2.4GHz Wireless (with USB dongle) or directly via Bluetooth, allowing you to switch between devices.</p><ul><li><b>Connection:</b> Dual Mode (2.4GHz Wireless + Bluetooth)</li><li><b>Design:</b> Ergonomic, Black, 6 Buttons</li><li><b>DPI:</b> Adjustable DPI (1000/1600/2400)</li><li><b>Features:</b> Rechargeable Battery, Silent Click.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b45dc1a0-60a1-4579-9c4e-bbda293efd9c-1781881399446.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b45dc1a0-60a1-4579-9c4e-bbda293efd9c-1781881399446.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  499, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-bling-keyboard-combo-blue', 
  'Coconut Bling Keyboard Combo - Blue', 
  'Coconut Bling Keyboard Combo - Blue', 
  '<p>A vibrant and colorful wired keyboard and mouse combo. The "Bling" combo features bright LED illumination and a modern design.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Blue, Ergonomic</li><li><b>Lighting:</b> Rainbow LED Backlit Keyboard, 7-Color LED Mouse</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/aec8255a-a6f4-4a16-a1b4-d17b8bf505b0-1781881400642.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/aec8255a-a6f4-4a16-a1b4-d17b8bf505b0-1781881400642.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1599, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wk29-wm29-wireless-combo-mini-desire-black-grey', 
  'Coconut WK29+WM29 Wireless Combo Mini Desire - Black/Grey', 
  'Coconut WK29+WM29 Wireless Combo Mini Desire - Black/Grey', 
  '<p>A sleek and modern wireless keyboard and mouse combo. Features a full-size keyboard with a number pad and an ergonomic mouse.</p><ul><li><b>Type:</b> Wireless Keyboard + Mouse Combo</li><li><b>Connection:</b> 2.4GHz Wireless (Single Receiver)</li><li><b>Design:</b> Slim, Black/Grey, Full-size Keyboard</li><li><b>Features:</b> Quiet keys, Auto sleep mode.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/144a90df-03fc-4027-93b3-40f5ff138420-1781881402534.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/144a90df-03fc-4027-93b3-40f5ff138420-1781881402534.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  899, 
  1999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wk31-bluetooth-keyboard-bravo3-black', 
  'Coconut WK31 Bluetooth Keyboard Bravo3- Black', 
  'Coconut WK31 Bluetooth Keyboard Bravo3- Black', 
  '<p>A slim, compact, and wireless Bluetooth keyboard. The Coconut WK31 is perfect for connecting to your PC, tablet, or smartphone.</p><ul><li><b>Connection:</b> Bluetooth 3.0</li><li><b>Design:</b> Slim, Mini Keyboard, Black</li><li><b>Compatibility:</b> Windows, macOS, Android, iOS</li><li><b>Features:</b> Scissor-switch keys for quiet typing.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2175f52b-c8f3-4687-9b29-e36e96f70eec-1781881405409.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2175f52b-c8f3-4687-9b29-e36e96f70eec-1781881405409.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1299, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-k27-wired-keyboard-steel-black', 
  'Coconut K27 Wired Keyboard STEEL - Black', 
  'Coconut K27 Wired Keyboard STEEL - Black', 
  '<p>A simple, reliable, and full-sized wired USB keyboard. The Coconut K27 is perfect for home or office use, featuring a spill-resistant design.</p><ul><li><b>Connection:</b> Wired USB</li><li><b>Layout:</b> Full-size 104 Keys</li><li><b>Design:</b> Standard, Black, Spill-Resistant</li><li><b>Features:</b> Plug and Play, Durable build.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fe526cac-52c0-4307-8fec-42df92a3c631-1781881406240.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fe526cac-52c0-4307-8fec-42df92a3c631-1781881406240.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  599, 
  1399
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-desire-2-0-keyboard-combo-black-grey', 
  'Coconut Desire 2.0 Keyboard Combo - Black/Grey', 
  'Coconut Desire 2.0 Keyboard Combo - Black/Grey', 
  '<p>A basic and affordable wired keyboard and mouse combo. The Desire 2.0 is built for reliability and everyday use in the office or at home.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Standard, Black/Grey, Full-size Keyboard</li><li><b>Features:</b> Plug and Play, Durable and spill-resistant.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/47cb59ff-3fb3-44ae-aa19-59414e13f918-1781881407672.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/47cb59ff-3fb3-44ae-aa19-59414e13f918-1781881407672.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  899, 
  1599
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wm28-prism-wireless-mouse-black', 
  'Coconut WM28 Prism Wireless Mouse - Black', 
  'Coconut WM28 Prism Wireless Mouse - Black', 
  '<p>The Coconut WM28 Prism features eye-catching RGB lighting in a wireless, rechargeable design. Ergonomically built for comfortable use.</p><ul><li><b>Connection:</b> 2.4GHz Wireless via USB Nano Receiver</li><li><b>Battery:</b> Rechargeable via Micro-USB</li><li><b>Lighting:</b> 7-Color RGB "Prism" effect</li><li><b>DPI:</b> Adjustable DPI (up to 1600)</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7d62abca-14ad-4460-89c3-d5cc5581de61-1781881409279.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7d62abca-14ad-4460-89c3-d5cc5581de61-1781881409279.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  499, 
  899
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wm20-wireless-mouse-lucid-black', 
  'Coconut WM20 Wireless Mouse - Lucid Black', 
  'Coconut WM20 Wireless Mouse - Lucid Black', 
  '<p>Experience wireless freedom with the Coconut WM20. This mouse features a sleek, ergonomic design in a striking Lucid White finish.</p><ul><li><b>Connection:</b> 2.4GHz Wireless via USB Nano Receiver</li><li><b>Design:</b> Ergonomic, Ambidextrous, Lucid White</li><li><b>DPI:</b> Adjustable DPI (800/1200/1600)</li><li><b>Features:</b> Silent Click, Auto Sleep Mode</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/70d345aa-0b22-4002-b9f5-d346128e6585-1781881410488.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/70d345aa-0b22-4002-b9f5-d346128e6585-1781881410488.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  799, 
  2499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-x25-nvme-enclosure-space-gray', 
  'Coconut X25 NVMe Enclosure - Space Gray', 
  'Coconut X25 NVMe Enclosure - Space Gray', 
  '<p>Transform your M.2 NVMe SSD into a super-fast portable external drive. The Coconut X25 features a durable aluminum alloy shell and a high-speed USB 3.1/3.2 interface.</p><ul><li><b>For SSD Type:</b> M.2 NVMe (M-Key / B+M Key)</li><li><b>Interface:</b> USB 3.1/3.2 Gen 2 Type-C</li><li><b>Speed:</b> Up to 10Gbps</li><li><b>Build:</b> Aluminum Alloy, Space Gray</li></ul>', 
  'Coconut', 
  'Storage', 
  'External Enclosures', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d36dc99b-594c-4595-aeb7-883dc403f85b-1781881411530.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d36dc99b-594c-4595-aeb7-883dc403f85b-1781881411530.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  799, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '862784e7-6ee2-4c44-82e5-09e5b93c459b', 
  'Coconut WA04 Wireless Adapter - V2', 
  'Coconut WA04 Wireless Adapter - V2', 
  '<p>Add Wi-Fi connectivity to your desktop or laptop with this compact USB wireless adapter. The "V2" likely indicates an updated chipset or design.</p><ul><li><b>Type:</b> USB Wi-Fi Adapter</li><li><b>Speed:</b> N150 (150Mbps) or N300 (300Mbps)</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Nano or Mini with small antenna</li></ul>', 
  'Coconut', 
  'Networking', 
  'Wi-Fi Adapters', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bf062e20-0d97-450a-ba9c-099e9c466006-1781881412502.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bf062e20-0d97-450a-ba9c-099e9c466006-1781881412502.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  199, 
  449
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ee67aa17-1079-41f8-9de4-78aef6c97c77', 
  'Coconut CF01 CPU Cooler - Black', 
  'Coconut CF01 CPU Cooler - Black', 
  '<p>An aftermarket air cooler for your CPU. The Coconut CF01 is a top-flow style cooler, providing efficient cooling with an LED fan.</p><ul><li><b>Type:</b> CPU Air Cooler (Top-Flow)</li><li><b>Compatibility:</b> Intel & AMD Sockets</li><li><b>Fan:</b> 90mm or 120mm with LED/RGB lighting</li><li><b>Heatsink:</b> Aluminum Heatsink</li></ul>', 
  'Coconut', 
  'Computer Components', 
  'CPU Coolers', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3c514d90-92f1-4d92-9225-c6d4fb8db3ee-1781881413593.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3c514d90-92f1-4d92-9225-c6d4fb8db3ee-1781881413593.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  199, 
  449
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'e3a49a0c-906f-4df2-a127-851c7c5c8622', 
  'Coconut MOB-12 Mobile Stand - Silver', 
  'Coconut MOB-12 Mobile Stand - Silver', 
  '<p>A premium, adjustable desktop stand for your smartphone or tablet. Made from durable aluminum alloy, it''s perfect for video calls or hands-free viewing.</p><ul><li><b>Type:</b> Mobile/Tablet Desktop Stand</li><li><b>Material:</b> Aluminum Alloy</li><li><b>Color:</b> Silver</li><li><b>Features:</b> Adjustable Angle, Foldable, Anti-slip silicone pads.</li></ul>', 
  'Coconut', 
  'Accessories', 
  'Stands', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e1faf0f8-5bad-444d-9bc5-d0edec8c71a6-1781881414299.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e1faf0f8-5bad-444d-9bc5-d0edec8c71a6-1781881414299.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  229, 
  499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '83bec406-9e4b-4dd0-8d9b-dc79ac3b4e79', 
  'Coconut CF03 CPU Cooler - Black', 
  'Coconut CF03 CPU Cooler - Black', 
  '<p>An aftermarket air cooler for your CPU. The Coconut CF03 provides better cooling performance and quieter operation than stock coolers, with RGB/LED lighting.</p><ul><li><b>Type:</b> CPU Air Cooler</li><li><b>Compatibility:</b> Intel & AMD Sockets (e.g., LGA 115x/1200, AM4)</li><li><b>Fan:</b> 90mm or 120mm with LED/RGB lighting</li><li><b>Heatsink:</b> Aluminum Heatsink</li></ul>', 
  'Coconut', 
  'Computer Components', 
  'CPU Coolers', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/831c207a-36f2-4510-a5ad-7c1b241a4753-1781881415424.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/831c207a-36f2-4510-a5ad-7c1b241a4753-1781881415424.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  699, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '00256181-2e09-49bf-ac10-ff245e27b244', 
  'CP PLUS IP 2MP DOME DUALLIGHT (CP-UNC-DA21L3C-LQ)', 
  'CP PLUS IP 2MP DOME DUALLIGHT (CP-UNC-DA21L3C-LQ)', 
  '<p>Secure your premises with the CP Plus 2MP IP Dome Camera. Equipped with Dual Light technology, it switches between infrared and warm light for clear full-color night vision. Features a built-in microphone for synchronized audio monitoring.</p><ul><li><b>Resolution:</b> Full HD 1080p (2 Megapixel)</li><li><b>Illumination:</b> Dual Light (IR and Warm Light up to 30m)</li><li><b>Audio:</b> Built-in high sensitivity microphone</li><li><b>Protection:</b> IP67 Weatherproof</li><li><b>Power:</b> Power over Ethernet (PoE) support</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/f1df765a-e1ba-4990-901a-53d6137d9f95-1781881416422.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/f1df765a-e1ba-4990-901a-53d6137d9f95-1781881416422.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3899, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ff142575-bf13-4790-9223-3e5200ff531e', 
  'CP PLUS IP 2MP DUALLIGHT - BULLET (CP-UNC-TA21L3C-LQ)', 
  'CP PLUS IP 2MP DUALLIGHT - BULLET (CP-UNC-TA21L3C-LQ)', 
  '<p>Durable and high-performing, the CP Plus 2MP IP Bullet Camera offers reliable outdoor protection. Features Dual Light technology for full-color day/night video and built-in audio capture.</p><ul><li><b>Form Factor:</b> Outdoor Bullet Camera</li><li><b>Resolution:</b> 1080p (2 Megapixel)</li><li><b>Illumination:</b> Smart Dual Light (up to 30m)</li><li><b>Audio:</b> Integrated microphone for audio recording</li><li><b>Durability:</b> IP67 weatherproof housing</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/0e2593ee-1563-4c55-9491-4ee3a0c0b022-1781881417448.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/0e2593ee-1563-4c55-9491-4ee3a0c0b022-1781881417448.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4199, 
  6999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '3ee6d862-1cbc-4192-866d-62ded06490f5', 
  'CP PLUS IP 4MP DOME DUALLIGHT (CP-UNC-DA41L3C-D-LQ)', 
  'CP PLUS IP 4MP DOME DUALLIGHT (CP-UNC-DA41L3C-D-LQ)', 
  '<p>Upgrade your security to high-definition with the CP Plus 4MP IP Dome Camera. Features WDR (120dB) for high contrast lighting situations, Dual Light full-color night vision, and an integrated microphone.</p><ul><li><b>Resolution:</b> 4 Megapixel (Super HD)</li><li><b>Optics:</b> Fixed 3.6mm lens with Smart IR</li><li><b>Night Vision:</b> Dual Light (IR + Warm Light up to 30m)</li><li><b>Features:</b> 120dB Wide Dynamic Range (WDR), Built-in Mic</li><li><b>Network:</b> PoE support, IP67 housing</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e38ed727-10e3-4cb4-aacb-59add361dd1c-1781881418259.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e38ed727-10e3-4cb4-aacb-59add361dd1c-1781881418259.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4899, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '3e9aa63d-ac84-43c3-9e5a-6759f9bc7847', 
  'CP PLUS IP 4MP BULLET DUALLIGHT (CP-UNC-TA41L3C-D-LQ)', 
  'CP PLUS IP 4MP BULLET DUALLIGHT (CP-UNC-TA41L3C-D-LQ)', 
  '<p>Get high-detail outdoor surveillance with the CP Plus 4MP IP Bullet Camera. Combines sharp 4MP resolution, true 120dB WDR, and Dual Light technology for colored footage even in low-light environments.</p><ul><li><b>Form Factor:</b> Weatherproof Bullet</li><li><b>Resolution:</b> 4 Megapixel (2688 x 1520)</li><li><b>Night Vision:</b> Dual Light range up to 30 meters</li><li><b>Audio:</b> Built-in microphone</li><li><b>Advanced:</b> 120dB WDR, H.265 compression, PoE support</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7f3f4e1d-4a40-4472-a2c2-a59467a2c5e4-1781881419017.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7f3f4e1d-4a40-4472-a2c2-a59467a2c5e4-1781881419017.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  5199, 
  8999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ee22e34b-a3f9-4684-b06a-e73f644b6343', 
  'CP PLUS DVR 4CH (CP-UVR-0401E1-IC2 2MP)', 
  'CP PLUS DVR 4CH (CP-UVR-0401E1-IC2 2MP)', 
  '<p>Consolidate your security network with the CP Plus 4-Channel Hybrid DVR. Supporting standard analog, HD analog, and IP cameras, it balances quality and storage with efficient H.265 compression and Smart Motion Detection (SMD Plus).</p><ul><li><b>Channels:</b> 4 BNC Analog channels + 1 additional IP channel</li><li><b>Compression:</b> H.265 video compression</li><li><b>Smart:</b> SMD Plus (Smart Motion Detection for human/vehicle)</li><li><b>Storage:</b> Supports 1 SATA HDD up to 6TB</li><li><b>Interface:</b> HDMI and VGA output</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'DVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3af4d266-e45f-442a-b54f-d5460273e10a-1781881419965.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3af4d266-e45f-442a-b54f-d5460273e10a-1781881419965.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4199, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '74fb6f3e-4913-4bb6-aab7-ffd9ffccb878', 
  'CP Plus 16 Channel Full HD H.265+ DVR Upto 2 MP Supported (Model - CP-UVR-1601E1-IC OR CP-UVR-1601E1-HC)', 
  'CP Plus 16 Channel Full HD H.265+ DVR Upto 2 MP Supported (Model - CP-UVR-1601E1-IC OR CP-UVR-1601E1-HC)', 
  '<p>CP-UVR-1601E1-IC2 Description ðŸ“¹ CP-UVR-1601E1-IC2 Digital Video Recorder (DVR) The CP-UVR-1601E1-IC2 is a powerful 16-Channel Hybrid Digital Video Recorder (DVR) from CP Plus, designed for medium-scale surveillance systems.</p><ul><li><b>Channels:</b> Supports 16 BNC channels for connecting analog cameras.</li><li><b>Resolution:</b> Records main stream video at up to 1080N (1080p Lite) resolution, balancing quality and storage needs.</li><li><b>Hybrid (Penta-brid) Technology:</b> Highly flexible, supporting all five common analog signal types: HDCVI, AHD, TVI, CVBS (Analog) , plus it supports **two additional IP channels** (up to 18 channels total).</li><li><b>Smart Features:</b> Utilizes the efficient H.265+ video compression standard and includes SMD Plus (Smart Motion Detection) on analog channels to accurately distinguish and classify Humans and Vehicles , significantly reducing false alerts.</li><li><b>Storage:</b> Supports 1 SATA hard disk drive (HDD) up to 6TB for recorded footage.</li><li><b>Outputs:</b> Features simultaneous video output via HDMI and VGA ports.</li></ul><p>In summary, this is a versatile, high-channel-count 16-channel Hybrid DVR featuring AI-based human/vehicle detection and efficient H.265+ compression, making it ideal for large home or small commercial security installations.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'DVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5cb02f3c-3c4e-43ad-ac62-7a938a41e288-1781881420840.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5cb02f3c-3c4e-43ad-ac62-7a938a41e288-1781881420840.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  7999, 
  12999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '029ff84d-01be-45e3-9b87-f3445bb34e99', 
  'CP PLUS 8CH 2MP HD DVR (CP-UVR-0801E1-IC2)', 
  'CP PLUS 8CH 2MP HD DVR (CP-UVR-0801E1-IC2)', 
  '<p>CP-UVR-0801E1-IC2 Description ðŸ“¹ CP-UVR-0801E1-IC2 Digital Video Recorder (DVR) The CP-UVR-0801E1-IC2 is an 8-Channel Hybrid Digital Video Recorder (DVR) from CP Plus, designed for small to medium-sized surveillance systems.</p><ul><li><b>Channels:</b> Supports 8 BNC channels for analog cameras.</li><li><b>Resolution:</b> Records video streams at up to 1080N (1080p Lite) resolution.</li><li><b>Hybrid (Penta-brid) Compatibility:</b> Flexible support for all major analog formats (HDCVI, AHD, TVI, CVBS), plus **two additional IP channels** (up to 10 channels total) at 2MP.</li><li><b>Smart Features:</b> Includes efficient H.265+ compression and SMD Plus (Smart Motion Detection) on analog channels to accurately distinguish and classify Humans and Vehicles .</li><li><b>Storage:</b> Supports 1 SATA hard disk drive (HDD) up to 6TB.</li><li><b>Outputs:</b> Features simultaneous video output via HDMI and VGA ports.</li></ul><p>In summary, this is a versatile 8-channel Hybrid DVR that allows users to connect various camera types and features AI-based detection for smarter, more focused recording.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'DVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/42738d97-52d5-4fee-88e9-0c6548609910-1781881421675.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/42738d97-52d5-4fee-88e9-0c6548609910-1781881421675.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4999, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'b04befb0-06e1-461d-a275-952d9823d75e', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - BULLET (TC24PL3C-L-V2)', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - BULLET (TC24PL3C-L-V2)', 
  '<p>TC24PL3C-L-V2 Description ðŸ“¹ TC24PL3C-L-V2 Camera (Bullet) The TC24PL3C-L-V2 is a reliable **HD Analog Bullet Camera** suitable for universal surveillance applications.</p><ul><li><b>Form Factor:</b> Robust **Bullet-style camera** designed for easy outdoor and indoor installation.</li><li><b>Resolution:</b> Provides **Full HD 1080p** video quality (likely 2.4 Megapixel sensor).</li><li><b>Multi-Format:</b> It is a 4-in-1 camera , capable of outputting video in **HDCVI, HDTVI, AHD, and CVBS** formats, ensuring broad compatibility with various DVR systems.</li><li><b>Night Vision:</b> Equipped with built-in **IR (Infrared) illumination** for clear black and white video capture in total darkness.</li><li><b>Use Case:</b> Ideal for reliable, all-weather (typically IP66/IP67 rated) surveillance where high definition is required.</li></ul><p>In summary, this is a versatile, 1080p, multi-format analog bullet camera used for reliable day and night surveillance in various environments.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bdfb22f0-fff9-49a0-92a4-ccb08582a270-1781881422648.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bdfb22f0-fff9-49a0-92a4-ccb08582a270-1781881422648.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1899, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ac03b6a8-1013-43db-9c4d-1ca4a07d5c28', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2)', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2)', 
  '<p>DC24PL3C-L-V2 Description ðŸ“¹ CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2) The DC24PL3C-L-V2 is an **HD Analog Dome Camera** featuring both high-quality video and enhanced lighting technology, plus built-in audio.</p><ul><li><b>Resolution:</b> Captures video in **Full HD 1080p** resolution (2.4 Megapixel sensor).</li><li><b>Form Factor:</b> Classic **Dome-style camera** (indicated by ''DC''), suitable for discreet indoor or protected outdoor mounting.</li><li><b>Dual Light Technology:</b> Provides clear night vision using both **IR (Infrared)** for standard B/W viewing and **Warm Light** to deliver full-color images in low-light conditions.</li><li><b>Audio:</b> Includes a **Built-in Mic** for simultaneous video and audio recording (audio over coax/PoC compatibility may vary by DVR).</li><li><b>Multi-Format:</b> A 4-in-1 camera , compatible with **HDCVI, HDTVI, AHD, and CVBS** analog DVRs.</li><li><b>Use Case:</b> Ideal for locations where both visual detail, audio recording, and color night vision are required.</li></ul><p>In summary, this is a feature-rich 1080p dome camera providing both Dual Light color night vision and integrated audio recording, highly compatible with existing analog systems.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d933ceab-4838-418d-9598-7294a537640e-1781881423538.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d933ceab-4838-418d-9598-7294a537640e-1781881423538.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1799, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '4701065d-51da-40f1-ba75-b2fb2c5962a8', 
  'CP PLUS 5MP DUAL LIGHT MIC - DOME (CP-URC-DC51PL3C-L-V2)', 
  'CP PLUS 5MP DUAL LIGHT MIC - DOME (CP-URC-DC51PL3C-L-V2)', 
  '<p>CP-URC-DC51PL3C-L-V2 Description ðŸ“¹ CP-URC-DC51PL3C-L-V2 Camera (5MP Dome) The CP-URC-DC51PL3C-L-V2 is a high-resolution, multi-format 5 Megapixel (5MP) Dome Camera from CP Plus, designed for high-detail surveillance.</p><ul><li><b>Resolution:</b> Provides superior image quality with a **5 Megapixel** resolution, which is significantly higher than Full HD.</li><li><b>Form Factor:</b> Features a **Dome-style housing** (indicated by ''DC''), suitable for discreet ceiling or wall mounting.</li><li><b>Technology:</b> It is a 4-in-1 HD Analog camera , ensuring compatibility with most modern DVRs by supporting **HDCVI, HDTVI, AHD, and CVBS** signals.</li><li><b>Night Vision:</b> Equipped with powerful **IR (Infrared) LEDs** for clear surveillance footage in complete darkness.</li><li><b>Use Case:</b> Excellent choice for demanding areas where capturing crucial fine detail is necessary.</li></ul><p>In summary, this is a high-performance, 5MP dome camera that offers exceptional detail and flexibility for upgrading existing analog surveillance systems.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/543d00d6-6344-4457-9471-66be52c956c3-1781881424405.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/543d00d6-6344-4457-9471-66be52c956c3-1781881424405.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2499, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '911ce1f6-439d-465f-be4c-a8d932315977', 
  'CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2)', 
  'CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2)', 
  '<p>CP-URC-TC51PL3C-L-V2 Description ðŸ“¹ CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2) The CP-URC-TC51PL3C-L-V2 is a premium, high-resolution 5 Megapixel (5MP) Bullet Camera that integrates advanced lighting and audio capabilities.</p><ul><li><b>Resolution:</b> Provides ultra-clear video with **5 Megapixel** resolution, delivering high detail superior to standard 1080p.</li><li><b>Form Factor:</b> Features a durable **Bullet-style housing** (indicated by ''TC''), ideal for both indoor and outdoor fixed surveillance.</li><li><b>Dual Light Technology:</b> Equipped with both **IR (Infrared)** and **Warm Light** LEDs for standard night vision or **full-color imaging** in low light.</li><li><b>Audio:</b> Includes a **Built-in Mic** for simultaneous video and audio recording.</li><li><b>Multi-Format:</b> A versatile **4-in-1 HD Analog camera**, compatible with **HDCVI, HDTVI, AHD, and CVBS** formats.</li></ul><p>In summary, this is a top-tier 5MP bullet camera offering superior detail, advanced color night vision (Dual Light), and integrated audio for comprehensive surveillance.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/00bd87c4-fc72-4846-bb2c-8081347fed57-1781881425644.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/00bd87c4-fc72-4846-bb2c-8081347fed57-1781881425644.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2799, 
  5299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '78f58b1a-2bc3-4806-a1c7-f03949905f57', 
  'CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1)', 
  'CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1)', 
  '<p>CP-UNR-104F1 Description ðŸ’¾ CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1) The CP-UNR-104F1 is a compact, entry-level 4-Channel Network Video Recorder (NVR) designed for IP camera systems.</p><ul><li><b>Type:</b> 4-Channel Network Video Recorder (NVR).</li><li><b>Resolution Support:</b> Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all channels.</li><li><b>Channels:</b> Manages and records video streams from up to **4 distinct IP cameras**.</li><li><b>Compression:</b> Uses efficient **H.265** and H.264 video compression for optimal storage usage.</li><li><b>Storage:</b> Supports **1 SATA hard disk drive (HDD)** for recorded footage.</li><li><b>Use Case:</b> Ideal for small-scale surveillance systems (home, small office) utilizing high-resolution IP cameras.</li></ul><p>In summary, it is a powerful yet compact 4-channel NVR, capable of recording 4K video streams for small-scale IP surveillance systems.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'NVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bbdd6292-339d-40f6-8ee8-dfd2f57323af-1781881426476.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bbdd6292-339d-40f6-8ee8-dfd2f57323af-1781881426476.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4499, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '82b36baf-9dc9-43dd-a2c1-5fb729207a3d', 
  'CP PLUS NVR 8CH 2/4/8MP- 4K (CP-UNR-108F1)', 
  'CP PLUS NVR 8CH 2/4/8MP- 4K (CP-UNR-108F1)', 
  '<p>CP-UNR-108F1 Description ðŸ’¾ CP PLUS NVR 8CH 2/4/8MP (CP-UNR-108F1) The CP-UNR-108F1 is a standard 8-Channel Network Video Recorder (NVR) from CP Plus, suitable for mid-sized IP surveillance systems.</p><ul><li><b>Type:</b> 8-Channel Network Video Recorder (NVR).</li><li><b>Resolution Support:</b> Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all 8 channels.</li><li><b>Channels:</b> Manages and records video streams from up to **8 distinct IP cameras**.</li><li><b>Compression:</b> Uses efficient **H.265** and H.264 video compression for optimal storage usage.</li><li><b>Storage:</b> Supports **1 SATA hard disk drive (HDD)** for recorded footage.</li><li><b>Use Case:</b> Ideal for medium-sized homes or small business installations utilizing high-resolution IP cameras.</li></ul><p>In summary, it is a versatile 8-channel NVR, capable of handling high-resolution (up to 4K) IP camera streams for medium-scale installations.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'NVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/35e8e3f6-cd89-4054-b031-0d29ecd0106a-1781881427305.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/35e8e3f6-cd89-4054-b031-0d29ecd0106a-1781881427305.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  6799, 
  12999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'd7688cec-b92d-4354-b084-94123f125ba4', 
  'CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2)', 
  'CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2)', 
  '<p>CP-UNR-4K2161-V2 Description ðŸ’¾ CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2) The CP-UNR-4K2161-V2 is a high-performance 16-Channel Network Video Recorder (NVR) designed for large-scale professional IP surveillance systems.</p><ul><li><b>Type:</b> 16-Channel Network Video Recorder (NVR).</li><li><b>Resolution Support:</b> Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all 16 channels.</li><li><b>Channels:</b> Manages and records video streams from up to **16 distinct IP cameras**.</li><li><b>Compression:</b> Uses highly efficient **H.265+** video compression for optimal storage and bandwidth use.</li><li><b>Storage:</b> Supports **2 SATA hard disk drives (HDDs)**, offering expanded storage capacity (up to 20TB total).</li><li><b>Use Case:</b> Ideal for large businesses, commercial buildings, and facilities requiring extensive, high-definition IP video surveillance.</li></ul><p>In summary, this is a powerful, professional-grade 16-channel NVR with dual HDD support, designed to manage and record high-resolution 4K video streams for large-scale IP installations.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'NVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/498f9f3b-8ebc-49c0-a437-b07e1eda0ce5-1781881427950.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/498f9f3b-8ebc-49c0-a437-b07e1eda0ce5-1781881427950.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  7799, 
  17999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '36cb7399-0d61-42a3-9dc6-e3b985f92853', 
  'CP PLUS SMPS 10 AMP METAL', 
  'CP PLUS SMPS 10 AMP METAL', 
  '<p>CP Plus 12V 10A Power Supply Description âš⚡ CP Plus 12V 10 Amp Power Supply (8-Channel SMPS) This is a robust 12V DC Switching Power Supply (SMPS) , designed specifically for powering medium-sized CCTV and security camera installations.</p><ul><li><b>Type:</b> Centralized 12V DC Power Supply Unit (SMPS). Voltage/Current: Provides a stable **12V DC output** with a maximum capacity of **10 Amperes (10A)**. Design: Features a durable **Metal Body/Cabinet** for robust installation and heat dissipation. Application: Ideally suited for use with **8 standard security cameras** connected to an 8-channel DVR system.</li><li><b>Protection:</b> Includes built-in safeguards like short circuit and over-voltage protection to ensure system stability.</li></ul><p>In summary, this is a centralized, high-capacity 12V/10A metal-body power supply providing reliable and stable power for up to 8 security cameras in a professional CCTV system.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Power Supplies', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/510e0564-0ffb-4ff9-83cc-aa8bc2cbdab7-1781881428827.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/510e0564-0ffb-4ff9-83cc-aa8bc2cbdab7-1781881428827.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1399, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'f980778c-6fab-409e-956e-ab90d248c430', 
  'CP PLUS 3+1 CO-AXIAL CABLE 180M (CP-ECC-180RS)', 
  'CP PLUS 3+1 CO-AXIAL CABLE 180M (CP-ECC-180RS)', 
  '<p>CP Plus Long-Run 3+1 Co-axial Cable (180 Meters) Professional high-density 180 meters layout wiring drum supplying unified device runs.</p><ul><li><b>Length Span:</b> Large-scale 180m industrial roll profile</li><li><b>Low Loss:</b> Reduced signal attenuation structures over maximum distance lines</li><li><b>Shielding:</b> Anti-interference woven mesh grid insulation wrap</li></ul><p>In summary, your go-to copper cable foundation choice for seamless wiring across massive multi-floor infrastructure networks.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Cables & Wiring', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a13013e3-f740-4d0a-a1cf-aead33ee1376-1781881429311.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a13013e3-f740-4d0a-a1cf-aead33ee1376-1781881429311.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3199, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'e27c05ea-35e1-4ab1-9398-9656f127f0dd', 
  'CP PLUS GIGABIT 8 PORT SWITCH (CP-ANW-GPU8G2-N12)', 
  'CP PLUS GIGABIT 8 PORT SWITCH (CP-ANW-GPU8G2-N12)', 
  '<p>CP Plus Gigabit 8-Port PoE Switch (CP-ANW-GPU8G2-N12) High bandwidth enterprise-level gigabit configuration preventing bottlenecking patterns across heavy 4K security arrays.</p><ul><li><b>Speed Array:</b> 8 Full Gigabit 10/100/1000 Mbps PoE interfaces</li><li><b>Uplink Matrix:</b> 2 Dedicated Gigabit transmission nodes</li><li><b>System Safety:</b> 4KV lightning surge network layer protection</li></ul><p>In summary, the ultimate backbone switch for high-definition professional IP setups requiring maximum throughput.</p>', 
  'CP PLUS', 
  'Networking', 
  'PoE Switches', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/64522f28-e9bd-45be-8c66-065de551c204-1781881429705.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/64522f28-e9bd-45be-8c66-065de551c204-1781881429705.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2199, 
  3999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'c9b085b3-d3ba-409c-b77c-c9a3bd64ff57', 
  'CP PLUS 3+1 CO-AXIAL CABLE 90M (CP-ECC-90RS)', 
  'CP PLUS 3+1 CO-AXIAL CABLE 90M (CP-ECC-90RS)', 
  '<p>CP Plus Professional 3+1 Co-axial Cable Drum (90 Meters) Premium 90 meters copper shielded co-axial system wire routing crisp analog data safely across long spans.</p><ul><li><b>Composition:</b> High purity composite core with triple-layer insulation layer shielding</li><li><b>Power Rails:</b> 3 integrated isolated DC distribution cores</li><li><b>Durability:</b> Flame retardant weather-resistant outer wrapping jacket layout</li></ul><p>In summary, standard solid core wire preventing external signal drops and visual feedback line distortions.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Cables & Wiring', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3ecc24ee-4d12-49df-b1a0-2e0144dbe7f8-1781881430207.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3ecc24ee-4d12-49df-b1a0-2e0144dbe7f8-1781881430207.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2299, 
  3799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'f4c21609-5ec1-4933-a970-d78d59e33c9f', 
  'CP PLUS 2U MODULAR RACK (CP-HA-RK3535VM-2U)', 
  'CP PLUS 2U MODULAR RACK (CP-HA-RK3535VM-2U)', 
  '<p>CP Plus 2U Enclosure System Cabinet (CP-HA-RK3535VM-2U) Heavy-duty lockable chassis sheltering core hardware elements from unapproved structural management alterations.</p><ul><li><b>Dimension Scale:</b> 2U Compact vertical height clearance allocation</li><li><b>Chassis Type:</b> Modular assembly sheet metal with tinted glass front lock window</li><li><b>Ventilation:</b> Custom side panel cooling slits template arrays</li></ul><p>In summary, a tamper-proof and clean enclosure structure safeguarding DVR/NVR power lines and device links.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Racks & Enclosures', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fb46aa74-3f99-4d67-be71-37ca87731b03-1781881430611.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fb46aa74-3f99-4d67-be71-37ca87731b03-1781881430611.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1299, 
  1499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '4a0ad17d-a873-4c9a-be5c-0aadba6cb0e2', 
  'Zebronic H81M Motherboard', 
  'Zebronic H81M Motherboard', 
  '<p>Zebronic Intel H81 LGA1150 Motherboard High-performance micro-ATX H81 motherboard supporting Intel 4th generation Core processors.</p><ul><li><b>Socket:</b> LGA1150 processor socket compatibility</li><li><b>Data Lanes:</b> USB 3.0 and SATA III ports for fast data transfers</li><li><b>Onboard Graphics:</b> High-definition video out via HDMI/VGA</li></ul><p>In summary, a robust motherboard providing stable power distribution and fast storage performance.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7ed079b6-ab3b-44e8-b3c7-295708e99010-1781881432006.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7ed079b6-ab3b-44e8-b3c7-295708e99010-1781881432006.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1699, 
  2599
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '512f1eef-92f4-4d8c-a354-2c8296c44297', 
  'Zebronic H310M Motherboard', 
  'Zebronic H310M Motherboard', 
  '<p>Zebronic Intel H310 LGA1151 Motherboard High-end H310 chipset motherboard supporting Intel 8th and 9th generation Core processors.</p><ul><li><b>CPU Support:</b> Modern LGA1151 socket supporting multiple cores</li><li><b>Connectivity:</b> Onboard high-speed M.2 slot for NVMe SSDs</li><li><b>Audio:</b> High-definition audio capacitors for clean sound output</li></ul><p>In summary, a modern, feature-packed motherboard supporting NVMe storage speeds and multi-core processors.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1a4258ed-008b-4d33-8da0-b1c37ed6a480-1781881432369.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1a4258ed-008b-4d33-8da0-b1c37ed6a480-1781881432369.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  5299, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '8fa40434-f25f-407d-8b7c-28bb99fa3270', 
  'Zebronic H110M Motherboard', 
  'Zebronic H110M Motherboard', 
  '<p>Zebronic Intel H110 LGA1151 Motherboard Modern micro-ATX H110 motherboard supporting Intel 6th and 7th generation processors.</p><ul><li><b>Memory Support:</b> Modern DDR4 memory slots for faster processing</li><li><b>Socket:</b> LGA1151 CPU socket architecture</li><li><b>Expansion:</b> PCIe x16 slot for dedicated graphics cards</li></ul><p>In summary, a reliable foundation for budget builds, supporting modern DDR4 memory speeds.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b46f1412-5267-40fb-a250-a7463fde6bb9-1781881432980.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b46f1412-5267-40fb-a250-a7463fde6bb9-1781881432980.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4499, 
  6999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '3d57be8f-1e1c-43ca-95a0-c141b6724753', 
  'Zebronic H61 Motherboard', 
  'Zebronic H61 Motherboard', 
  '<p>Zebronic Intel H61 LGA1155 Motherboard Highly stable H61 chipset motherboard supporting Intel Core processors and dual-channel DDR3 memory.</p><ul><li><b>Processor:</b> Supports standard Intel LGA1155 socket CPUs</li><li><b>Memory:</b> Dual DDR3 slots supporting high-speed RAM allocations</li><li><b>Ports:</b> Multiple USB ports, SATA lanes, and onboard VGA/HDMI out</li></ul><p>In summary, an ideal replacement motherboard for upgrading or restoring classic office desktop computers.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/deda3303-1d5a-4a31-97aa-f8895e35261e-1781881433337.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/deda3303-1d5a-4a31-97aa-f8895e35261e-1781881433337.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1699, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '36809756-a291-482c-a737-5046b957e2bd', 
  'Zebronic 24" Monitor', 
  'Zebronic 24" Monitor', 
  '<p>Zebronic 24" Widescreen Monitor Professional-grade 24-inch widescreen monitor offering immersive views, extended warranty, and zero-flicker technology.</p><ul><li><b>Visual Scale:</b> 24-inch workspace with thin bezel layout</li><li><b>Warranty:</b> Extended 3 Years manufacturer peace-of-mind warranty</li><li><b>Refresh Rate:</b> Fast refresh rate reducing motion blur in high-frame streams</li></ul><p>In summary, a premium large-screen monitor built for productive multitasking and long hours of viewing comfort.</p>', 
  'Zebronic', 
  'Monitors', 
  'LED Monitors', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b34a19ec-d5d5-4f41-9bd7-10e656547d56-1781881433878.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b34a19ec-d5d5-4f41-9bd7-10e656547d56-1781881433878.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  6899, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '83322f5e-5923-42c8-b96f-a5eb3e7ba26c', 
  'Zebronic SMPS', 
  'Zebronic SMPS', 
  '<p>Zebronic Centralized SMPS Power Supply Centralized power supply unit (SMPS) providing stable voltage, heat management, and power surge protection.</p><ul><li><b>Capacity:</b> High-efficiency standard wattage output</li><li><b>Cooling:</b> Quiet cooling fan preventing thermal throttling</li><li><b>Sectors:</b> Multiple SATA and IDE power connector allocations</li></ul><p>In summary, a dependable power supply unit shielding internal components from unstable voltage spikes.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Power Supplies', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e04410c3-4b3d-485d-84ac-ccdc8cc70439-1781881434313.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e04410c3-4b3d-485d-84ac-ccdc8cc70439-1781881434313.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  999, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();
