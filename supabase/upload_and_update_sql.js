import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import crypto from 'crypto';

const rawData = `
Handle ID	Type	Title	MRP	Sale Price with Gst	Brand	Description	Product Detail	Image Link	Warranty Details	Stock Status	Status
	product	SanDisk Ultra 64GB USB 3.0 Flash Drive	1799	1299	SanDisk	<p>Step up to high-speed USB 3.0 and transfer your videos, photos, and files faster. The SanDisk Ultra USB 3.0 Flash Drive offers transfer speeds of up to 130MB/s.</p><ul><li><b>Capacity:</b> 64GB</li><li><b>Interface:</b> USB 3.0 (USB 3.2 Gen 1)</li><li><b>Speed:</b> Read speeds up to 130MB/s.</li><li><b>Design:</b> Sleek, durable design with a retractable connector.</li><li><b>Security:</b> Includes SanDisk SecureAccess software.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370582721-n9lb73vlt6f.webp		In Stock	active
	product	EVM 128GB M.2 NVMe SSD (EVMNV/128GB)-- 520MB/s Read & 370MB/s Write 	4999	2599	EVM	<p>Experience next-level performance with the EVM 128GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761884710935-xjj9ae8b03c.jpg		In Stock	active
	product	SanDisk Ultra 256GB USB 3.0 Flash Drive	3499	2799	SanDisk	<p>Step up to high-speed USB 3.0 and transfer your videos, photos, and files faster. The SanDisk Ultra USB 3.0 Flash Drive offers transfer speeds of up to 130MB/s and a massive 256GB capacity.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Interface:</b> USB 3.0 (USB 3.2 Gen 1)</li><li><b>Speed:</b> Read speeds up to 130MB/s.</li><li><b>Design:</b> Sleek, durable design with a retractable connector.</li><li><b>Security:</b> Includes SanDisk SecureAccess software.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370693654-jvcqsjw83b.webp		In Stock	active
	product	EVM 256GB M.2 NVMe SSD (EVMNV/256GB) 540MB/s Read & 450MB/s Write	7999	4399	EVM	<p>Experience next-level performance with the EVM 256GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761885209995-izrwfltf6uh.jpg		In Stock	active
	product	EVM 1TB 2.5-inch SATA SSD (EVM25/1TB)	15999	13299	EVM	<p>Boost your laptop or desktop PC performance with the EVM 1TB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness with ample storage.</p><ul><li><b>Capacity:</b> 1TB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect high-capacity upgrade to breathe new life into an aging computer.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370475038-fzko1nfj2av.webp		In Stock	active
	product	EVM 256GB 2.5-inch SATA SSD (EVM25/256)	5999	3799	EVM	<p>Boost your laptop or desktop PC performance with the EVM 256GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370373355-q7aa8mn566.webp		In Stock	active
	product	SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive	1299	699	SanDisk	<p>The SanDisk Cruzer Blade USB 2.0 Flash Drive offers a compact, stylish design and ample capacity.</p><ul><li><b>Capacity:</b> 64GB</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Ultra-compact and portable contoured styling.</li><li><b>Software:</b> Includes SanDisk SecureAccess software for password protection.</li></ul><p>A reliable and easy way to store, share, and transfer your photos, videos, music, and other files.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370453256-iqial5wsvkm.webp		In Stock	active
	product	EVM 128GB 2.5-inch SATA SSD (EVM25/128)	2999	2399	EVM	<p>Boost your laptop or desktop PC performance with the EVM 128GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370785037-68ebbl9vxdf.webp		In Stock	active
	product	SanDisk Cruzer Blade 128GB USB 2.0 Flash Drive	1999	1399	SanDisk	<p>The SanDisk Cruzer Blade USB 2.0 Flash Drive offers a compact, stylish design and a large 128GB capacity.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Ultra-compact and portable contoured styling.</li><li><b>Software:</b> Includes SanDisk SecureAccess software for password protection.</li></ul><p>A reliable and easy way to store, share, and transfer your photos, videos, music, and other files.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370734725-qc76c8x8cns.webp		In Stock	active
	product	EVM 512GB 2.5-inch SATA SSD (EVM25/512)	7999	5899	EVM	<p>Boost your laptop or desktop PC performance with the EVM 512GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 512GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370428482-a9611y6x4k8.webp		In Stock	active
	product	EVM 512GB M.2 NVMe SSD (EVMNV/512GB) 540MB/s Read & 450MB/s Write	9999	7299	EVM	<p>Experience next-level performance with the EVM 512GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 512GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761885246251-p35ddpwxp2e.jpg		In Stock	active
	product	EVM H110 Motherboard	5999	4599	EVM	<p>Upgrade to DDR4 with the EVM H110 Motherboard, designed for 6th and 7th Generation Intel Core processors.</p><ul><li><b>Chipset:</b> Intel H110</li><li><b>Socket:</b> LGA 1151</li><li><b>Memory Support:</b> Dual Channel DDR4 (2133/2400MHz)</li><li><b>Form Factor:</b> Micro-ATX</li><li><b>Ports:</b> VGA, HDMI, USB 3.0, USB 2.0, LAN</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761370123840-y83of15d1ns.webp		In Stock	active
	product	EVM 8GB DDR3 1600MHz RAM	5999	1799	EVM	<p>Maximize your DDR3 system's multitasking capabilities with this 8GB memory module from EVM.</p><ul><li><b>Capacity:</b> 8GB</li><li><b>Type:</b> DDR3</li><li><b>Speed:</b> 1600MHz (PC3-12800)</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369754202-as31ga8whff.webp		In Stock	active
	product	EVM 8GB DDR4 2666MHz RAM	9999	4699	EVM	<p>A high-performance 8GB DDR4 memory module for modern desktops. Runs at a speedy 2666MHz.</p><ul><li><b>Capacity:</b> 8GB</li><li><b>Type:</b> DDR4</li><li><b>Speed:</b> 2666MHz</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369726802-jf62bvqr1z.webp		In Stock	active
	product	EVM 4GB DDR3 1600MHz RAM	3999	799	EVM	<p>Boost your PC's performance with this 4GB DDR3 memory module. Ideal for systems supporting 1600MHz RAM.</p><ul><li><b>Capacity:</b> 4GB</li><li><b>Type:</b> DDR3</li><li><b>Speed:</b> 1600MHz (PC3-12800)</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369873612-7ou8ocbu7gr.jpg		In Stock	active
	product	Enter 19-Inch LED Monitor	4999	2999	Enter	<p>An affordable and reliable 19-inch (18.5-inch viewable) LED monitor from Enter. Perfect for office work, home use, or as a secondary display.</p><ul><li><b>Screen Size:</b> 19-inch (18.5" diagonal)</li><li><b>Panel Type:</b> LED</li><li><b>Resolution:</b> 1366 x 768 (HD)</li><li><b>Inputs:</b> 1x VGA, 1x HDMI</li><li><b>Design:</b> Slim profile, VESA mount compatible.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369632645-221h37lpsbd.webp		In Stock	active
	product	Zebronics 600VA UPS (Zeb-U725)	1799	999	Zebronics	<p>Protect your PC and other electronics from power outages with the Zebronics 600VA UPS. Provides essential battery backup and surge protection.</p><ul><li><b>Capacity:</b> 600VA / 360W</li><li><b>Type:</b> Line Interactive</li><li><b>Backup Time:</b> Provides 10-15 minutes of backup (typical PC load).</li><li><b>Features:</b> Automatic Voltage Regulation (AVR), Audible Alarm.</li><li><b>Outlets:</b> 3x India 3-pin outlets (battery backup).</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369789676-9120xezeuso.webp		In Stock	active
	product	Artis SMP 400C SMPS (Power Supply)	3499	2699	Artis	<p>A reliable standard power supply for basic desktop computers. The Artis 400C provides stable power for home and office builds.</p><ul><li><b>Wattage:</b> 400W (Peak)</li><li><b>Fan:</b> 80mm Cooling Fan</li><li><b>Connectors:</b> 24-pin ATX, 4-pin CPU, SATA, Molex</li><li><b>Protection:</b> Over Voltage Protection (OVP).</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369519416-zkxln8kd91l.jpg		In Stock	active
	product	Quick Heal Internet Security 1 User 1 Year	1299	499	Quick Heal	<p>Comprehensive antivirus and internet security for your PC. Quick Heal Internet Security protects you from malware, ransomware, and online threats.</p><ul><li><b>Device Support:</b> 1 User (PC)</li><li><b>Subscription:</b> 1 Year License</li><li><b>Protection:</b> Advanced DNAScan, Ransomware Protection, Safe Banking, Firewall.</li><li><b>Type:</b> Digital License / Activation Code.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369090229-0tfa805xr63g.webp		In Stock	active
	product	TP-Link Archer C6 AC1200 Wireless Router	4999	3199	TP-Link	<p>Upgrade your home network to high-speed dual-band Wi-Fi with the TP-Link Archer C6. It supports the 802.11ac standard and delivers speeds up to 1200Mbps.</p><ul><li><b>Speed:</b> AC1200 (867Mbps on 5GHz + 300Mbps on 2.4GHz)</li><li><b>Antennas:</b> 4x external antennas + 1x internal</li><li><b>Ports:</b> 1x Gigabit WAN, 4x Gigabit LAN</li><li><b>Features:</b> MU-MIMO, Access Point Mode, OneMesh support.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369041156-kcnfcjhqyrs.webp		In Stock	active
	product	Coconut Vintage Keyboard Combo - Blue	3999	1699	Coconut	<p>A stylish wired keyboard and mouse combo with a retro "vintage" typewriter-key design in a striking blue color.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Vintage Blue, Round Typewriter-style Keycaps</li><li><b>Features:</b> LED backlit keyboard, Ergonomic mouse.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761338096303-ahw1vp83a9r		In Stock	active
	product	Coconut K26 Illume Mechanical Keyboard	1999	599	Coconut	<p>The Coconut K26 Illume is a full-sized mechanical keyboard built for gamers and typists. Features durable mechanical switches and vibrant illumination.</p><ul><li><b>Type:</b> Mechanical (Blue/Red switches common)</li><li><b>Layout:</b> Full-size 104 Keys</li><li><b>Lighting:</b> LED Backlit (e.g., Rainbow or 7-color)</li><li><b>Build:</b> Metal Panel, Braided Cable</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761337959276-ldx394addf		In Stock	active
	product	Coconut M16 USB Gaming Mouse - Zeta Black	399	199	Coconut	<p>The Coconut M16 is a wired USB gaming mouse designed for comfort and precision. Features customizable RGB lighting to match your setup.</p><ul><li><b>Connection:</b> Wired USB</li><li><b>Design:</b> Ergonomic, Zeta Black, RGB Lighting</li><li><b>DPI:</b> High-Precision Sensor (e.g., up to 3200 DPI)</li><li><b>Buttons:</b> 6 Buttons with scroll wheel.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369111688-3bznwnjrika.webp		In Stock	active
	product	Coconut WM21 Wireless+BT Mouse Kudos - Black	1299	499	Coconut	<p>The ultimate versatile mouse. The Coconut WM21 can connect via 2.4GHz Wireless (with USB dongle) or directly via Bluetooth, allowing you to switch between devices.</p><ul><li><b>Connection:</b> Dual Mode (2.4GHz Wireless + Bluetooth)</li><li><b>Design:</b> Ergonomic, Black, 6 Buttons</li><li><b>DPI:</b> Adjustable DPI (1000/1600/2400)</li><li><b>Features:</b> Rechargeable Battery, Silent Click.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761338215276-9zpgsxbvv8.jpg		In Stock	active
	product	Coconut Bling Keyboard Combo - Blue	2999	1599	Coconut	<p>A vibrant and colorful wired keyboard and mouse combo. The "Bling" combo features bright LED illumination and a modern design.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Blue, Ergonomic</li><li><b>Lighting:</b> Rainbow LED Backlit Keyboard, 7-Color LED Mouse</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761337846430-2a6zgq5toe5		In Stock	active
	product	Coconut WK29+WM29 Wireless Combo Mini Desire - Black/Grey	1999	899	Coconut	<p>A sleek and modern wireless keyboard and mouse combo. Features a full-size keyboard with a number pad and an ergonomic mouse.</p><ul><li><b>Type:</b> Wireless Keyboard + Mouse Combo</li><li><b>Connection:</b> 2.4GHz Wireless (Single Receiver)</li><li><b>Design:</b> Slim, Black/Grey, Full-size Keyboard</li><li><b>Features:</b> Quiet keys, Auto sleep mode.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761338355777-b48cfkovqg		In Stock	active
	product	Coconut WK31 Bluetooth Keyboard Bravo3- Black	3499	1299	Coconut	<p>A slim, compact, and wireless Bluetooth keyboard. The Coconut WK31 is perfect for connecting to your PC, tablet, or smartphone.</p><ul><li><b>Connection:</b> Bluetooth 3.0</li><li><b>Design:</b> Slim, Mini Keyboard, Black</li><li><b>Compatibility:</b> Windows, macOS, Android, iOS</li><li><b>Features:</b> Scissor-switch keys for quiet typing.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761338009893-e3mhlg3es5u		In Stock	active
	product	Coconut K27 Wired Keyboard STEEL - Black	1399	599	Coconut	<p>A simple, reliable, and full-sized wired USB keyboard. The Coconut K27 is perfect for home or office use, featuring a spill-resistant design.</p><ul><li><b>Connection:</b> Wired USB</li><li><b>Layout:</b> Full-size 104 Keys</li><li><b>Design:</b> Standard, Black, Spill-Resistant</li><li><b>Features:</b> Plug and Play, Durable build.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761337706365-a988osnkdno		In Stock	active
	product	Coconut Desire 2.0 Keyboard Combo - Black/Grey	1599	899	Coconut	<p>A basic and affordable wired keyboard and mouse combo. The Desire 2.0 is built for reliability and everyday use in the office or at home.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Standard, Black/Grey, Full-size Keyboard</li><li><b>Features:</b> Plug and Play, Durable and spill-resistant.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369378783-40njm3omspm		In Stock	active
	product	Coconut WM28 Prism Wireless Mouse - Black	899	499	Coconut	<p>The Coconut WM28 Prism features eye-catching RGB lighting in a wireless, rechargeable design. Ergonomically built for comfortable use.</p><ul><li><b>Connection:</b> 2.4GHz Wireless via USB Nano Receiver</li><li><b>Battery:</b> Rechargeable via Micro-USB</li><li><b>Lighting:</b> 7-Color RGB "Prism" effect</li><li><b>DPI:</b> Adjustable DPI (up to 1600)</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761338270476-tp7qbjxbj2		In Stock	active
	product	Coconut WM20 Wireless Mouse - Lucid Black	2499	799	Coconut	<p>Experience wireless freedom with the Coconut WM20. This mouse features a sleek, ergonomic design in a striking Lucid White finish.</p><ul><li><b>Connection:</b> 2.4GHz Wireless via USB Nano Receiver</li><li><b>Design:</b> Ergonomic, Ambidextrous, Lucid White</li><li><b>DPI:</b> Adjustable DPI (800/1200/1600)</li><li><b>Features:</b> Silent Click, Auto Sleep Mode</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761338452954-ockxwdzelw		In Stock	active
	product	Coconut X25 NVMe Enclosure - Space Gray	1799	799	Coconut	<p>Transform your M.2 NVMe SSD into a super-fast portable external drive. The Coconut X25 features a durable aluminum alloy shell and a high-speed USB 3.1/3.2 interface.</p><ul><li><b>For SSD Type:</b> M.2 NVMe (M-Key / B+M Key)</li><li><b>Interface:</b> USB 3.1/3.2 Gen 2 Type-C</li><li><b>Speed:</b> Up to 10Gbps</li><li><b>Build:</b> Aluminum Alloy, Space Gray</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761336984342-ckpblv6rt7l		In Stock	active
862784e7-6ee2-4c44-82e5-09e5b93c459b	product	Coconut WA04 Wireless Adapter - V2	449	199	Coconut	<p>Add Wi-Fi connectivity to your desktop or laptop with this compact USB wireless adapter. The "V2" likely indicates an updated chipset or design.</p><ul><li><b>Type:</b> USB Wi-Fi Adapter</li><li><b>Speed:</b> N150 (150Mbps) or N300 (300Mbps)</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Nano or Mini with small antenna</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369256408-udorcc20gu8.jpg		In Stock	active
ee67aa17-1079-41f8-9de4-78aef6c97c77	product	Coconut CF01 CPU Cooler - Black	449	199	Coconut	<p>An aftermarket air cooler for your CPU. The Coconut CF01 is a top-flow style cooler, providing efficient cooling with an LED fan.</p><ul><li><b>Type:</b> CPU Air Cooler (Top-Flow)</li><li><b>Compatibility:</b> Intel & AMD Sockets</li><li><b>Fan:</b> 90mm or 120mm with LED/RGB lighting</li><li><b>Heatsink:</b> Aluminum Heatsink</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761369181997-081slxovkm6.jpg		In Stock	active
e3a49a0c-906f-4df2-a127-851c7c5c8622	product	Coconut MOB-12 Mobile Stand - Silver	499	229	Coconut	<p>A premium, adjustable desktop stand for your smartphone or tablet. Made from durable aluminum alloy, it's perfect for video calls or hands-free viewing.</p><ul><li><b>Type:</b> Mobile/Tablet Desktop Stand</li><li><b>Material:</b> Aluminum Alloy</li><li><b>Color:</b> Silver</li><li><b>Features:</b> Adjustable Angle, Foldable, Anti-slip silicone pads.</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761337213476-mkzol19jf1p		In Stock	active
83bec406-9e4b-4dd0-8d9b-dc79ac3b4e79	product	Coconut CF03 CPU Cooler - Black	1799	699	Coconut	<p>An aftermarket air cooler for your CPU. The Coconut CF03 provides better cooling performance and quieter operation than stock coolers, with RGB/LED lighting.</p><ul><li><b>Type:</b> CPU Air Cooler</li><li><b>Compatibility:</b> Intel & AMD Sockets (e.g., LGA 115x/1200, AM4)</li><li><b>Fan:</b> 90mm or 120mm with LED/RGB lighting</li><li><b>Heatsink:</b> Aluminum Heatsink</li></ul>		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1761337289898-1idq6uw29az		In Stock	active
00256181-2e09-49bf-ac10-ff245e27b244	product	CP PLUS IP 2MP DOME DUALLIGHT (CP-UNC-DA21L3C-LQ)	5999	3899	CP PLUS			https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764248962777-cvs4p5pqub9		In Stock	active
ff142575-bf13-4790-9223-3e5200ff531e	product	CP PLUS IP 2MP DUALLIGHT - BULLET (CP-UNC-TA21L3C-LQ)	6999	4199	CP PLUS			https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764249411991-6wapp3w9qvk		In Stock	active
3ee6d862-1cbc-4192-866d-62ded06490f5	product	CP PLUS IP 4MP DOME DUALLIGHT (CP-UNC-DA41L3C-D-LQ)	7999	4899	CP PLUS			https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764249625096-rfbcalutc5		In Stock	active
3e9aa63d-ac84-43c3-9e5a-6759f9bc7847	product	CP PLUS IP 4MP BULLET DUALLIGHT (CP-UNC-TA41L3C-D-LQ)	8999	5199	CP PLUS			https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764249788168-xhwl5ubzb		In Stock	active
ee22e34b-a3f9-4684-b06a-e73f644b6343	product	CP PLUS DVR 4CH (CP-UVR-0401E1-IC2 2MP)	7999	4199	CP PLUS			https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764415286739-mligsn5kyl		In Stock	active
937ebd2c-0ed1-441a-8241-c4252c1aca6f	product	CP PLUS SMPS 05 AMP METAL	2999	999	CP PLUS	The CP-DPS-MD50P-12D model number refers to a Power Supply unit, often used for powering CCTV cameras and other related security devices.Here is a short description:Type: Switching Power Supply or SMPS (Switched-Mode Power Supply).Voltage Output: It is a 12V DC (Direct Current) power supply.Channels/Ports: The '50P' often indicates a power box that supports powering multiple devices (likely around 4 to 8 cameras, depending on power draw). The 'D' might denote a distribution box format with individual output fuses/protection.Capacity: The 'MD50' typically refers to the maximum power output, suggesting a total capacity of around 50 Watts or $4.16 \text{ Amperes } (50 \text{W} / 12 \text{V})$.Function: It is designed to convert standard AC mains power (220V/110V) into a stable, regulated 12V DC supply for security cameras, providing centralized power distribution and protection (fuses/PTC).		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764416674726-jkp452jgd0p		In Stock	active
74fb6f3e-4913-4bb6-aab7-ffd9ffccb878	product	CP Plus 16 Channel Full HD H.265+ DVR Upto 2 MP Supported (Model - CP-UVR-1601E1-IC OR CP-UVR-1601E1-HC)	12999	7999	CP PLUS	CP-UVR-1601E1-IC2 Description ðŸ“¹ CP-UVR-1601E1-IC2 Digital Video Recorder (DVR) The CP-UVR-1601E1-IC2 is a powerful 16-Channel Hybrid Digital Video Recorder (DVR) from CP Plus, designed for medium-scale surveillance systems. Channels: Supports 16 BNC channels for connecting analog cameras. Resolution: Records main stream video at up to 1080N (1080p Lite) resolution, balancing quality and storage needs. Hybrid (Penta-brid) Technology: Highly flexible, supporting all five common analog signal types: HDCVI, AHD, TVI, CVBS (Analog) , plus it supports **two additional IP channels** (up to 18 channels total). Smart Features: Utilizes the efficient H.265+ video compression standard and includes SMD Plus (Smart Motion Detection) on analog channels to accurately distinguish and classify Humans and Vehicles , significantly reducing false alerts. Storage: Supports 1 SATA hard disk drive (HDD) up to 6TB for recorded footage. Outputs: Features simultaneous video output via HDMI and VGA ports. In summary, this is a versatile, high-channel-count 16-channel Hybrid DVR featuring AI-based human/vehicle detection and efficient H.265+ compression, making it ideal for large home or small commercial security installations.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764424712703-qedvsqfl4do		In Stock	active
029ff84d-01be-45e3-9b87-f3445bb34e99	product	CP PLUS 8CH 2MP HD DVR (CP-UVR-0801E1-IC2)	9999	4999	CP PLUS	CP-UVR-0801E1-IC2 Description ðŸ“¹ CP-UVR-0801E1-IC2 Digital Video Recorder (DVR) The CP-UVR-0801E1-IC2 is an 8-Channel Hybrid Digital Video Recorder (DVR) from CP Plus, designed for small to medium-sized surveillance systems. Channels: Supports 8 BNC channels for analog cameras. Resolution: Records video streams at up to 1080N (1080p Lite) resolution. Hybrid (Penta-brid) Compatibility: Flexible support for all major analog formats (HDCVI, AHD, TVI, CVBS), plus **two additional IP channels** (up to 10 channels total) at 2MP. Smart Features: Includes efficient H.265+ compression and SMD Plus (Smart Motion Detection) on analog channels to accurately distinguish and classify Humans and Vehicles . Storage: Supports 1 SATA hard disk drive (HDD) up to 6TB. Outputs: Features simultaneous video output via HDMI and VGA ports. In summary, this is a versatile 8-channel Hybrid DVR that allows users to connect various camera types and features AI-based detection for smarter, more focused recording.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764425048770-yjjy5s99hir		In Stock	active
b04befb0-06e1-461d-a275-952d9823d75e	product	CP PLUS 2.4MP DUAL LIGHT MIC - BULLET (TC24PL3C-L-V2)	3499	1899	CP PLUS	TC24PL3C-L-V2 Description ðŸ“¹ TC24PL3C-L-V2 Camera (Bullet) The TC24PL3C-L-V2 is a reliable **HD Analog Bullet Camera** suitable for universal surveillance applications. Form Factor: Robust **Bullet-style camera** designed for easy outdoor and indoor installation. Resolution: Provides **Full HD 1080p** video quality (likely 2.4 Megapixel sensor). Multi-Format: It is a 4-in-1 camera , capable of outputting video in **HDCVI, HDTVI, AHD, and CVBS** formats, ensuring broad compatibility with various DVR systems. Night Vision: Equipped with built-in **IR (Infrared) illumination** for clear black and white video capture in total darkness. Use Case: Ideal for reliable, all-weather (typically IP66/IP67 rated) surveillance where high definition is required. In summary, this is a versatile, 1080p, multi-format analog bullet camera used for reliable day and night surveillance in various environments.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764425410266-vajet4h58fq		In Stock	active
ac03b6a8-1013-43db-9c4d-1ca4a07d5c28	product	CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2)	2999	1799	CP PLUS	DC24PL3C-L-V2 Description ðŸ“¹ CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2) The DC24PL3C-L-V2 is an **HD Analog Dome Camera** featuring both high-quality video and enhanced lighting technology, plus built-in audio. Resolution: Captures video in **Full HD 1080p** resolution (2.4 Megapixel sensor). Form Factor: Classic **Dome-style camera** (indicated by 'DC'), suitable for discreet indoor or protected outdoor mounting. Dual Light Technology: Provides clear night vision using both **IR (Infrared)** for standard B/W viewing and **Warm Light** to deliver full-color images in low-light conditions. Audio: Includes a **Built-in Mic** for simultaneous video and audio recording (audio over coax/PoC compatibility may vary by DVR). Multi-Format: A 4-in-1 camera , compatible with **HDCVI, HDTVI, AHD, and CVBS** analog DVRs. Use Case: Ideal for locations where both visual detail, audio recording, and color night vision are required. In summary, this is a feature-rich 1080p dome camera providing both Dual Light color night vision and integrated audio recording, highly compatible with existing analog systems.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764426299830-nwg719zpcl		In Stock	active
4701065d-51da-40f1-ba75-b2fb2c5962a8	product	CP PLUS 5MP DUAL LIGHT MIC - DOME (CP-URC-DC51PL3C-L-V2)	4999	2499	CP PLUS	CP-URC-DC51PL3C-L-V2 Description ðŸ“¹ CP-URC-DC51PL3C-L-V2 Camera (5MP Dome) The CP-URC-DC51PL3C-L-V2 is a high-resolution, multi-format 5 Megapixel (5MP) Dome Camera from CP Plus, designed for high-detail surveillance. Resolution: Provides superior image quality with a **5 Megapixel** resolution, which is significantly higher than Full HD. Form Factor: Features a **Dome-style housing** (indicated by 'DC'), suitable for discreet ceiling or wall mounting. Technology: It is a 4-in-1 HD Analog camera , ensuring compatibility with most modern DVRs by supporting **HDCVI, HDTVI, AHD, and CVBS** signals. Night Vision: Equipped with powerful **IR (Infrared) LEDs** for clear surveillance footage in complete darkness. Use Case: Excellent choice for demanding areas where capturing crucial fine detail is necessary. In summary, this is a high-performance, 5MP dome camera that offers exceptional detail and flexibility for upgrading existing analog surveillance systems.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764426731559-f4upqido548		In Stock	active
911ce1f6-439d-465f-be4c-a8d932315977	product	CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2)	5299	2799	CP PLUS	CP-URC-TC51PL3C-L-V2 Description ðŸ“¹ CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2) The CP-URC-TC51PL3C-L-V2 is a premium, high-resolution 5 Megapixel (5MP) Bullet Camera that integrates advanced lighting and audio capabilities. Resolution: Provides ultra-clear video with **5 Megapixel** resolution, delivering high detail superior to standard 1080p. Form Factor: Features a durable **Bullet-style housing** (indicated by 'TC'), ideal for both indoor and outdoor fixed surveillance. Dual Light Technology: Equipped with both **IR (Infrared)** and **Warm Light** LEDs for standard night vision or **full-color imaging** in low light. Audio: Includes a **Built-in Mic** for simultaneous video and audio recording. Multi-Format: A versatile **4-in-1 HD Analog camera**, compatible with **HDCVI, HDTVI, AHD, and CVBS** formats. In summary, this is a top-tier 5MP bullet camera offering superior detail, advanced color night vision (Dual Light), and integrated audio for comprehensive surveillance.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764426961766-1m9dyarvvgp		In Stock	active
78f58b1a-2bc3-4806-a1c7-f03949905f57	product	CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1)	7999	4499	CP PLUS	CP-UNR-104F1 Description ðŸ’¾ CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1) The CP-UNR-104F1 is a compact, entry-level 4-Channel Network Video Recorder (NVR) designed for IP camera systems. Type: 4-Channel Network Video Recorder (NVR). Resolution Support: Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all channels. Channels: Manages and records video streams from up to **4 distinct IP cameras**. Compression: Uses efficient **H.265** and H.264 video compression for optimal storage usage. Storage: Supports **1 SATA hard disk drive (HDD)** for recorded footage. Use Case: Ideal for small-scale surveillance systems (home, small office) utilizing high-resolution IP cameras. In summary, it is a powerful yet compact 4-channel NVR, capable of recording 4K video streams for small-scale IP surveillance systems.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764427541937-1ukxvenufh6		In Stock	active
82b36baf-9dc9-43dd-a2c1-5fb729207a3d	product	CP PLUS NVR 8CH 2/4/8MP- 4K (CP-UNR-108F1)	12999	6799	CP PLUS	CP-UNR-108F1 Description ðŸ’¾ CP PLUS NVR 8CH 2/4/8MP (CP-UNR-108F1) The CP-UNR-108F1 is a standard 8-Channel Network Video Recorder (NVR) from CP Plus, suitable for mid-sized IP surveillance systems. Type: 8-Channel Network Video Recorder (NVR). Resolution Support: Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all 8 channels. Channels: Manages and records video streams from up to **8 distinct IP cameras**. Compression: Uses efficient **H.265** and H.264 video compression for optimal storage usage. Storage: Supports **1 SATA hard disk drive (HDD)** for recorded footage. Use Case: Ideal for medium-sized homes or small business installations utilizing high-resolution IP cameras. In summary, it is a versatile 8-channel NVR, capable of handling high-resolution (up to 4K) IP camera streams for medium-scale installations.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764427719608-hfag7pwskkg		In Stock	active
d7688cec-b92d-4354-b084-94123f125ba4	product	CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2)	17999	7799	CP PLUS	CP-UNR-4K2161-V2 Description ðŸ’¾ CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2) The CP-UNR-4K2161-V2 is a high-performance 16-Channel Network Video Recorder (NVR) designed for large-scale professional IP surveillance systems. Type: 16-Channel Network Video Recorder (NVR). Resolution Support: Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all 16 channels. Channels: Manages and records video streams from up to **16 distinct IP cameras**. Compression: Uses highly efficient **H.265+** video compression for optimal storage and bandwidth use. Storage: Supports **2 SATA hard disk drives (HDDs)**, offering expanded storage capacity (up to 20TB total). Use Case: Ideal for large businesses, commercial buildings, and facilities requiring extensive, high-definition IP video surveillance. In summary, this is a powerful, professional-grade 16-channel NVR with dual HDD support, designed to manage and record high-resolution 4K video streams for large-scale IP installations.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764427953422-ggjvxi53wgr		In Stock	active
36cb7399-0d61-42a3-9dc6-e3b985f92853	product	CP PLUS SMPS 10 AMP METAL	1799	1399	CP PLUS	CP Plus 12V 10A Power Supply Description âš⚡ CP Plus 12V 10 Amp Power Supply (8-Channel SMPS) This is a robust 12V DC Switching Power Supply (SMPS) , designed specifically for powering medium-sized CCTV and security camera installations. Type: Centralized 12V DC Power Supply Unit (SMPS). Voltage/Current: Provides a stable **12V DC output** with a maximum capacity of **10 Amperes (10A)**. Design: Features a durable **Metal Body/Cabinet** for robust installation and heat dissipation. Application: Ideally suited for use with **8 standard security cameras** connected to an 8-channel DVR system. Protection: Includes built-in safeguards like short circuit and over-voltage protection to ensure system stability. In summary, this is a centralized, high-capacity 12V/10A metal-body power supply providing reliable and stable power for up to 8 security cameras in a professional CCTV system.		https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/1764502213270-8qqffns1xt2		In Stock	active
f980778c-6fab-409e-956e-ab90d248c430	product	CP PLUS 3+1 CO-AXIAL CABLE 180M (CP-ECC-180RS)	4999	3199	CP PLUS	ðŸ”Œ CP Plus Long-Run 3+1 Co-axial Cable (180 Meters) Professional high-density 180 meters layout wiring drum supplying unified device runs. Length Span: Large-scale 180m industrial roll profile Low Loss: Reduced signal attenuation structures over maximum distance lines Shielding: Anti-interference woven mesh grid insulation wrap In summary, your go-to copper cable foundation choice for seamless wiring across massive multi-floor infrastructure networks.		https://cpplusworld.com/prodassets/product/small/12800e9d-facf-4a16-8d26-07abd9251aeb.jpg		In Stock	active
e27c05ea-35e1-4ab1-9398-9656f127f0dd	product	CP PLUS GIGABIT 8 PORT SWITCH (CP-ANW-GPU8G2-N12)	3999	2199	CP PLUS	ðŸ”Œ CP Plus Gigabit 8-Port PoE Switch (CP-ANW-GPU8G2-N12) High bandwidth enterprise-level gigabit configuration preventing bottlenecking patterns across heavy 4K security arrays. Speed Array: 8 Full Gigabit 10/100/1000 Mbps PoE interfaces Uplink Matrix: 2 Dedicated Gigabit transmission nodes System Safety: 4KV lightning surge network layer protection In summary, the ultimate backbone switch for high-definition professional IP setups requiring maximum throughput.		https://cpplusworld.com/prodassets/product/small/cfd43975-aa9f-438e-a6c3-fa1e25d90c31.png		In Stock	active
c9b085b3-d3ba-409c-b77c-c9a3bd64ff57	product	CP PLUS 3+1 CO-AXIAL CABLE 90M (CP-ECC-90RS)	3799	2299	CP PLUS	ðŸ”Œ CP Plus Professional 3+1 Co-axial Cable Drum (90 Meters) Premium 90 meters copper shielded co-axial system wire routing crisp analog data safely across long spans. Composition: High purity composite core with triple-layer insulation layer shielding Power Rails: 3 integrated isolated DC distribution cores Durability: Flame retardant weather-resistant outer wrapping jacket layout In summary, standard solid core wire preventing external signal drops and visual feedback line distortions.		https://cpplusworld.com/prodassets/product/small/12800e9d-facf-4a16-8d26-07abd9251aeb.jpg		In Stock	active
f4c21609-5ec1-4933-a970-d78d59e33c9f	product	CP PLUS 2U MODULAR RACK (CP-HA-RK3535VM-2U)	1499	1299	CP PLUS	ðŸ“¦ CP Plus 2U Enclosure System Cabinet (CP-HA-RK3535VM-2U) Heavy-duty lockable chassis sheltering core hardware elements from unapproved structural management alterations. Dimension Scale: 2U Compact vertical height clearance allocation Chassis Type: Modular assembly sheet metal with tinted glass front lock window Ventilation: Custom side panel cooling slits template arrays In summary, a tamper-proof and clean enclosure structure safeguarding DVR/NVR power lines and device links.		https://cpplusworld.com/prodassets/product/small/563b4cbf-4f8a-42ae-a3a1-4c142f80956c.jpg		In Stock	active
4a0ad17d-a873-4c9a-be5c-0aadba6cb0e2	product	Zebronic H81M Motherboard	2599	1699	Zebronic	âš™ï¸ Zebronic Intel H81 LGA1150 Motherboard High-performance micro-ATX H81 motherboard supporting Intel 4th generation Core processors. Socket: LGA1150 processor socket compatibility Data Lanes: USB 3.0 and SATA III ports for fast data transfers Onboard Graphics: High-definition video out via HDMI/VGA In summary, a robust motherboard providing stable power distribution and fast storage performance.		https://m.media-amazon.com/images/I/71trzCzWX3L._SY355_.jpg		In Stock	active
512f1eef-92f4-4d8c-a354-2c8296c44297	product	Zebronic H310M Motherboard	7999	5299	Zebronic	âš™ï¸ Zebronic Intel H310 LGA1151 Motherboard High-end H310 chipset motherboard supporting Intel 8th and 9th generation Core processors. CPU Support: Modern LGA1151 socket supporting multiple cores Connectivity: Onboard high-speed M.2 slot for NVMe SSDs Audio: High-definition audio capacitors for clean sound output In summary, a modern, feature-packed motherboard supporting NVMe storage speeds and multi-core processors.		https://m.media-amazon.com/images/I/51aJv5mYlbL._SY300_SX300_QL70_FMwebp_.jpg		In Stock	active
8fa40434-f25f-407d-8b7c-28bb99fa3270	product	Zebronic H110M Motherboard	6999	4499	Zebronic	âš™ï¸ Zebronic Intel H110 LGA1151 Motherboard Modern micro-ATX H110 motherboard supporting Intel 6th and 7th generation processors. Memory Support: Modern DDR4 memory slots for faster processing Socket: LGA1151 CPU socket architecture Expansion: PCIe x16 slot for dedicated graphics cards In summary, a reliable foundation for budget builds, supporting modern DDR4 memory speeds.		https://m.media-amazon.com/images/I/81jyncJcoqL._SY450_.jpg		In Stock	active
3d57be8f-1e1c-43ca-95a0-c141b6724753	product	Zebronic H61 Motherboard	2999	1699	Zebronic	âš™ï¸ Zebronic Intel H61 LGA1155 Motherboard Highly stable H61 chipset motherboard supporting Intel Core processors and dual-channel DDR3 memory. Processor: Supports standard Intel LGA1155 socket CPUs Memory: Dual DDR3 slots supporting high-speed RAM allocations Ports: Multiple USB ports, SATA lanes, and onboard VGA/HDMI out In summary, an ideal replacement motherboard for upgrading or restoring classic office desktop computers.		https://m.media-amazon.com/images/I/81QaHjQr3eL._SY355_.jpg		In Stock	active
36809756-a291-482c-a737-5046b957e2bd	product	Zebronic 24" Monitor	9999	6899	Zebronic	ðŸ–¥ï¸ Zebronic 24" Widescreen Monitor Professional-grade 24-inch widescreen monitor offering immersive views, extended warranty, and zero-flicker technology. Visual Scale: 24-inch workspace with thin bezel layout Warranty: Extended 3 Years manufacturer peace-of-mind warranty Refresh Rate: Fast refresh rate reducing motion blur in high-frame streams In summary, a premium large-screen monitor built for productive multitasking and long hours of viewing comfort.		https://m.media-amazon.com/images/I/81X7yswC36L._SX522_.jpg		In Stock	active
83322f5e-5923-42c8-b96f-a5eb3e7ba26c	product	Zebronic SMPS	1299	999	Zebronic	âš⚡ Zebronic Centralized SMPS Power Supply Centralized power supply unit (SMPS) providing stable voltage, heat management, and power surge protection. Capacity: High-efficiency standard wattage output Cooling: Quiet cooling fan preventing thermal throttling Sectors: Multiple SATA and IDE power connector allocations In summary, a dependable power supply unit shielding internal components from unstable voltage spikes.		https://m.media-amazon.com/images/I/31krU8z8cuL._SY300_SX300_QL70_FMwebp_.jpg		In Stock	active
`;

const missingDescriptions = {
  '00256181-2e09-49bf-ac10-ff245e27b244': `<p>Secure your premises with the CP Plus 2MP IP Dome Camera. Equipped with Dual Light technology, it switches between infrared and warm light for clear full-color night vision. Features a built-in microphone for synchronized audio monitoring.</p><ul><li><b>Resolution:</b> Full HD 1080p (2 Megapixel)</li><li><b>Illumination:</b> Dual Light (IR and Warm Light up to 30m)</li><li><b>Audio:</b> Built-in high sensitivity microphone</li><li><b>Protection:</b> IP67 Weatherproof</li><li><b>Power:</b> Power over Ethernet (PoE) support</li></ul>`,
  'ff142575-bf13-4790-9223-3e5200ff531e': `<p>Durable and high-performing, the CP Plus 2MP IP Bullet Camera offers reliable outdoor protection. Features Dual Light technology for full-color day/night video and built-in audio capture.</p><ul><li><b>Form Factor:</b> Outdoor Bullet Camera</li><li><b>Resolution:</b> 1080p (2 Megapixel)</li><li><b>Illumination:</b> Smart Dual Light (up to 30m)</li><li><b>Audio:</b> Integrated microphone for audio recording</li><li><b>Durability:</b> IP67 weatherproof housing</li></ul>`,
  '3ee6d862-1cbc-4192-866d-62ded06490f5': `<p>Upgrade your security to high-definition with the CP Plus 4MP IP Dome Camera. Features WDR (120dB) for high contrast lighting situations, Dual Light full-color night vision, and an integrated microphone.</p><ul><li><b>Resolution:</b> 4 Megapixel (Super HD)</li><li><b>Optics:</b> Fixed 3.6mm lens with Smart IR</li><li><b>Night Vision:</b> Dual Light (IR + Warm Light up to 30m)</li><li><b>Features:</b> 120dB Wide Dynamic Range (WDR), Built-in Mic</li><li><b>Network:</b> PoE support, IP67 housing</li></ul>`,
  '3e9aa63d-ac84-43c3-9e5a-6759f9bc7847': `<p>Get high-detail outdoor surveillance with the CP Plus 4MP IP Bullet Camera. Combines sharp 4MP resolution, true 120dB WDR, and Dual Light technology for colored footage even in low-light environments.</p><ul><li><b>Form Factor:</b> Weatherproof Bullet</li><li><b>Resolution:</b> 4 Megapixel (2688 x 1520)</li><li><b>Night Vision:</b> Dual Light range up to 30 meters</li><li><b>Audio:</b> Built-in microphone</li><li><b>Advanced:</b> 120dB WDR, H.265 compression, PoE support</li></ul>`,
  'ee22e34b-a3f9-4684-b06a-e73f644b6343': `<p>Consolidate your security network with the CP Plus 4-Channel Hybrid DVR. Supporting standard analog, HD analog, and IP cameras, it balances quality and storage with efficient H.265 compression and Smart Motion Detection (SMD Plus).</p><ul><li><b>Channels:</b> 4 BNC Analog channels + 1 additional IP channel</li><li><b>Compression:</b> H.265 video compression</li><li><b>Smart:</b> SMD Plus (Smart Motion Detection for human/vehicle)</li><li><b>Storage:</b> Supports 1 SATA HDD up to 6TB</li><li><b>Interface:</b> HDMI and VGA output</li></ul>`
};

const slugify = (val) => {
  return val
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

function getProductCategory(title, brand) {
  const t = title.toLowerCase();
  const b = brand.toLowerCase();
  
  if (t.includes('enclosure')) {
    return { category: 'Storage', subcategory: 'External Enclosures' };
  }
  if (t.includes('flash drive') || t.includes('cruzer blade') || t.includes('usb 3.0') || t.includes('usb 2.0')) {
    return { category: 'Storage', subcategory: 'Flash Drives' };
  }
  if (t.includes('ssd') || t.includes('nvme') || t.includes('sata ssd')) {
    return { category: 'Storage', subcategory: 'Internal SSDs' };
  }
  if (t.includes('motherboard')) {
    return { category: 'Computer Components', subcategory: 'Motherboards' };
  }
  if (t.includes('ram') || t.includes('ddr3') || t.includes('ddr4') || t.includes('mhz')) {
    return { category: 'Computer Components', subcategory: 'RAM' };
  }
  if (t.includes('cpu cooler') || t.includes('cooler')) {
    return { category: 'Computer Components', subcategory: 'CPU Coolers' };
  }
  if (t.includes('smps') || t.includes('power supply')) {
    if (b === 'cp plus') {
      return { category: 'Security & Surveillance', subcategory: 'Power Supplies' };
    }
    return { category: 'Computer Components', subcategory: 'Power Supplies' };
  }
  if (t.includes('ups')) {
    return { category: 'Power Backup', subcategory: 'UPS' };
  }
  if (t.includes('monitor') || t.includes('led monitor')) {
    return { category: 'Monitors', subcategory: 'LED Monitors' };
  }
  if (t.includes('internet security') || t.includes('antivirus')) {
    return { category: 'Software', subcategory: 'Antivirus & Security' };
  }
  if (t.includes('router') || t.includes('wireless router')) {
    return { category: 'Networking', subcategory: 'Routers' };
  }
  if (t.includes('adapter') || t.includes('wireless adapter') || t.includes('wi-fi')) {
    return { category: 'Networking', subcategory: 'Wi-Fi Adapters' };
  }
  if (t.includes('switch') || t.includes('port switch') || t.includes('poe switch')) {
    return { category: 'Networking', subcategory: 'PoE Switches' };
  }
  if (t.includes('combo') || t.includes('keyboard combo') || t.includes('keyboard+mouse')) {
    return { category: 'Peripherals', subcategory: 'Keyboard & Mouse Combos' };
  }
  if (t.includes('keyboard')) {
    return { category: 'Peripherals', subcategory: 'Keyboards' };
  }
  if (t.includes('mouse') || t.includes('gaming mouse')) {
    return { category: 'Peripherals', subcategory: 'Mice' };
  }
  if (t.includes('stand') || t.includes('mobile stand')) {
    return { category: 'Accessories', subcategory: 'Stands' };
  }
  if (t.includes('ip') && (t.includes('camera') || t.includes('dome') || t.includes('bullet'))) {
    return { category: 'Security & Surveillance', subcategory: 'IP Cameras' };
  }
  if (t.includes('dvr') || t.includes('digital video recorder') || t.includes('channel full hd')) {
    return { category: 'Security & Surveillance', subcategory: 'DVRs' };
  }
  if (t.includes('nvr') || t.includes('network video recorder')) {
    return { category: 'Security & Surveillance', subcategory: 'NVRs' };
  }
  if (t.includes('co-axial') || t.includes('cable') || t.includes('wire')) {
    return { category: 'Security & Surveillance', subcategory: 'Cables & Wiring' };
  }
  if (t.includes('rack') || t.includes('modular rack') || t.includes('cabinet') || t.includes('enclosure')) {
    return { category: 'Security & Surveillance', subcategory: 'Racks & Enclosures' };
  }
  if (t.includes('camera') || t.includes('dome') || t.includes('bullet')) {
    if (t.includes('analog') || t.includes('2.4mp') || t.includes('5mp')) {
      return { category: 'Security & Surveillance', subcategory: 'Analog Cameras' };
    }
    return { category: 'Security & Surveillance', subcategory: 'IP Cameras' };
  }
  
  return { category: 'Uncategorized', subcategory: 'General' };
}


// Helper function to format plain descriptions into clean HTML list structure
function cleanAndHtmlize(text, title) {
  if (!text) return '';
  text = text.trim();
  if (text.startsWith('<p>') || text.startsWith('<div>')) {
    return text; // Already HTML
  }

  // Remove emojis at start
  let cleaned = text.replace(/^[^\w\s<]+/u, '').trim();

  // Try to parse lists and paragraphs
  // Let's divide into sentences and bullet points
  // Split on items like "Socket:", "Resolution:", "Features:", etc., or "CPU Support:", "Memory Support:", "Connectivity:", "Audio:"
  const sentences = [];
  const bulletPoints = [];
  let introText = cleaned;

  // Let's find patterns like "Socket: LGA1150 processor socket compatibility"
  const bulletKeywords = [
    'Socket:', 'Data Lanes:', 'Onboard Graphics:', 'CPU Support:', 'Connectivity:', 'Audio:', 
    'Memory Support:', 'Expansion:', 'Processor:', 'Memory:', 'Ports:', 'Visual Scale:', 'Warranty:', 
    'Refresh Rate:', 'Capacity:', 'Cooling:', 'Sectors:', 'Type:', 'Voltage Output:', 'Channels/Ports:', 
    'Function:', 'Channels:', 'Resolution:', 'Hybrid (Penta-brid) Technology:', 'Hybrid (Penta-brid) Compatibility:', 
    'Smart Features:', 'Storage:', 'Outputs:', 'Form Factor:', 'Multi-Format:', 'Night Vision:', 
    'Use Case:', 'Dual Light Technology:', 'Technology:', 'Resolution Support:', 'Compression:', 
    'Wattage:', 'Fan:', 'Connectors:', 'Protection:', 'Length Span:', 'Low Loss:', 'Shielding:', 
    'Speed Array:', 'Uplink Matrix:', 'System Safety:', 'Composition:', 'Power Rails:', 'Durability:', 
    'Dimension Scale:', 'Chassis Type:', 'Ventilation:'
  ];

  let firstIndex = -1;
  bulletKeywords.forEach(kw => {
    const idx = cleaned.indexOf(kw);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  });

  if (firstIndex !== -1) {
    introText = cleaned.substring(0, firstIndex).trim();
    const listPart = cleaned.substring(firstIndex);
    
    // Split key/values. We match keywords
    const regex = new RegExp(`(${bulletKeywords.map(k => k.replace(/[\(\)\+\?]/g, '\\$&')).join('|')})`, 'g');
    const parts = listPart.split(regex).map(p => p.trim()).filter(Boolean);
    
    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i];
      const value = parts[i + 1] || '';
      if (key && value) {
        // Strip trailing period or "In summary" or other summary sentences
        let cleanVal = value;
        const sumIdx = value.indexOf('In summary');
        if (sumIdx !== -1) {
          cleanVal = value.substring(0, sumIdx).trim();
          const summary = value.substring(sumIdx).trim();
          if (summary) sentences.push(summary);
        }
        bulletPoints.push(`<li><b>${key.replace(':', '')}:</b> ${cleanVal}</li>`);
      }
    }
  } else {
    // Split by newlines or sentences
    const linesList = cleaned.split(/\n+/).map(l => l.trim()).filter(Boolean);
    if (linesList.length > 1) {
      introText = linesList[0];
      linesList.slice(1).forEach(l => {
        bulletPoints.push(`<li>${l}</li>`);
      });
    }
  }

  // Construct HTML
  // Let's strip standard final summary if it is in introText and move it to after the list or vice versa
  let introP = `<p>${introText}</p>`;
  let listHtml = bulletPoints.length > 0 ? `<ul>${bulletPoints.join('')}</ul>` : '';
  let finalHtml = introP + listHtml;

  // Append any trailing sentences/summaries
  if (sentences.length > 0) {
    finalHtml += `<p>${sentences.join(' ')}</p>`;
  }

  return finalHtml;
}

// Load env variables
const envContent = fs.readFileSync('c:\\Users\\tecbu\\OneDrive\\Desktop\\Project\\tecbunny\\.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\n]+)"?/)[1];
const serviceRoleKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/)[1];

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Parse existing image URLs to skip re-uploading
const imageCache = {};
try {
  const sqlPath = 'c:\\Users\\tecbu\\OneDrive\\Desktop\\Project\\tecbunny\\supabase\\update_products.sql';
  if (fs.existsSync(sqlPath)) {
    console.log('Loading image cache from existing update_products.sql...');
    const existingSql = fs.readFileSync(sqlPath, 'utf8');
    const segments = existingSql.split('INSERT INTO public.products (');
    for (const segment of segments) {
      if (!segment.trim()) continue;
      const valuesIndex = segment.indexOf('VALUES (');
      if (valuesIndex === -1) continue;
      const valuesPart = segment.substring(valuesIndex + 8);
      const handleMatch = valuesPart.match(/'([^']+)'/);
      if (!handleMatch) continue;
      const handle = handleMatch[1];
      const imageMatch = valuesPart.match(/'(https:\/\/yzrznydkqcacjiwalmlw\.supabase\.co\/storage\/v1\/object\/public\/images\/products\/[^']+)'/);
      if (imageMatch) {
        imageCache[handle] = imageMatch[1];
      }
    }
    console.log(`Loaded ${Object.keys(imageCache).length} images into cache.`);
  }
} catch (err) {
  console.warn('Could not parse image cache from existing SQL file:', err.message);
}

// Ensure bucket exists
console.log('Checking storage buckets...');
const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
if (bucketsError) {
  console.error('Error listing buckets:', bucketsError);
  process.exit(1);
}

if (!buckets.find(b => b.name === 'images')) {
  console.log('Creating public "images" bucket...');
  const { error: createError } = await supabase.storage.createBucket('images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });
  if (createError) {
    console.error('Failed to create bucket:', createError);
    process.exit(1);
  }
} else {
  console.log('"images" bucket already exists.');
}

const lines = rawData.split('\n').filter(l => l.replace(/\r/g, '').trim());
const headers = lines[0].split('\t').map(h => h.trim().replace(/"/g, ''));

const sqlStatements = [];
let successCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].replace(/\r/g, '');
  const values = line.split('\t');
  if (values.length !== headers.length) {
    continue;
  }

  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });

  const title = row['Title'];
  if (!title) continue;

  const handleId = row['Handle ID'] || '';
  const calculatedHandle = (handleId || slugify(title)).trim().toLowerCase();

  const brand = row['Brand'] || '';
  let description = row['Description'] || '';
  if (!description && missingDescriptions[handleId]) {
    description = missingDescriptions[handleId];
  }

  // Format description into rich HTML!
  description = cleanAndHtmlize(description, title);

  const short_description = row['Product Detail'] || '';
  let image = row['Image Link'] || '';
  const warranty = row['Warranty Details'] || '';
  const stock_status = (row['Stock Status'] || '').toLowerCase() === 'in stock' ? 'in_stock' : 'out_of_stock';
  const status = (row['Status'] || '').toLowerCase() === 'active' ? 'active' : 'draft';
  const price = parseFloat(row['Sale Price with Gst'] || '0') || 0;
  const mrp = parseFloat(row['MRP'] || '0') || 0;

  // Process & Upload Image to Supabase
  if (imageCache[calculatedHandle]) {
    image = imageCache[calculatedHandle];
    console.log(`[${i}/${lines.length - 1}] Using cached image URL for: ${calculatedHandle}`);
  } else if (image && image.startsWith('http') && !image.includes(supabaseUrl.split('//')[1])) {
    console.log(`[${i}/${lines.length - 1}] Downloading and uploading external image: ${image}`);
    try {
      const response = await fetch(image);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Optimize using Sharp
        const optimized = await sharp(buffer)
          .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        // Unique filename
        const filename = `products/${crypto.randomUUID()}-${Date.now()}.webp`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filename, optimized, {
            contentType: 'image/webp',
            upsert: false,
            cacheControl: '31536000'
          });

        if (uploadError) {
          console.error(`Failed to upload ${image}: ${uploadError.message}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filename);
          
          console.log(`  Uploaded to: ${publicUrl}`);
          image = publicUrl;
        }
      } else {
        console.error(`Failed to fetch image ${image}: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error(`Error processing image ${image}:`, err);
    }
  }

  const classification = getProductCategory(title, brand);
  const category = classification.category;
  const subcategory = classification.subcategory;

  const sqlEsc = (val) => {
    if (!val) return 'NULL';
    return "'" + val.replace(/'/g, "''") + "'";
  };

  const imagesArr = image ? `ARRAY[${sqlEsc(image)}]::TEXT[]` : `'{}'::TEXT[]`;

  sqlStatements.push(`INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  ${sqlEsc(calculatedHandle)}, 
  ${sqlEsc(title)}, 
  ${sqlEsc(title)}, 
  ${sqlEsc(description)}, 
  ${sqlEsc(brand)}, 
  ${sqlEsc(category)}, 
  ${sqlEsc(subcategory)}, 
  ${sqlEsc(short_description)}, 
  ${sqlEsc(image)}, 
  ${imagesArr}, 
  ${sqlEsc(warranty)}, 
  ${sqlEsc(stock_status)}, 
  '${status}', 
  ${price}, 
  ${mrp}
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
  updated_at = NOW();`);

  successCount++;
}

fs.writeFileSync('c:\\Users\\tecbu\\OneDrive\\Desktop\\Project\\tecbunny\\supabase\\update_products.sql', sqlStatements.join('\n\n') + '\n');
console.log(`Successfully completed! ${successCount} products processed and written to update_products.sql`);
