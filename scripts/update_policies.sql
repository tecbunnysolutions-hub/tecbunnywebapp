-- SQL Script to seed/update all website policies for TecBunny Solutions Pv Ltd
-- Updates Privacy Policy, Terms of Service, Cookie Policy, Shipping Policy, Return Policy, and Refund Policy in public.policies table.

-- 1. Privacy Policy
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'privacy_policy', 
  'Privacy Policy', 
  '{
    "title": "Privacy Policy",
    "lastUpdated": "2026-06-29",
    "introduction": [
      "Welcome to TecBunny (\"we,\" \"our,\" or \"us\"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application and use our services."
    ],
    "sections": [
      {
        "title": "Information We Collect",
        "content": ["Based on your interactions with our platform, we collect the following information:"],
        "list": [
          "Personal Identification Information (PII): Name, full name, email address, phone number, and physical addresses.",
          "Account Data: Profile pictures, role information, and authentication credentials.",
          "Transaction Data: Order histories, quotes requested, items in your wishlist, and payment statuses.",
          "Technical & Usage Data: Information about your interactions with our site, tracked via Vercel Analytics.",
          "Communications: Records of WhatsApp messages (where consent is provided), emails sent to you, and customer service interactions."
        ]
      },
      {
        "title": "How We Use Your Information",
        "content": ["We use the information we collect or receive to:"],
        "list": [
          "Facilitate account creation and logon processes.",
          "Fulfill and manage your orders, quotes, payments, and installations.",
          "Send you administrative information.",
          "Send marketing and promotional communications (only if you have opted in).",
          "Deliver targeted advertising and analyze site usage to improve our platform.",
          "Send WhatsApp notifications (subject to your explicit consent)."
        ]
      },
      {
        "title": "Third-Party Service Providers",
        "content": ["We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf. These include:"],
        "list": [
          "Authentication & Database Hosting: Supabase",
          "Payment Processing: Razorpay, PhonePe",
          "Analytics: Vercel Analytics",
          "Cloud Storage: Amazon Web Services (AWS S3)",
          "Communications: SMTP Email Providers and WhatsApp API services.",
          "Security: Cloudflare (Turnstile) for bot and spam protection."
        ]
      },
      {
        "title": "Security of Your Information",
        "content": [
          "We use administrative, technical, and physical security measures to help protect your personal information, including storing data securely within our managed databases (Supabase) and restricting access via Role-Based Access Control (RBAC)."
        ]
      },
      {
        "title": "Your Privacy Rights",
        "content": [
          "Depending on your jurisdiction, you may have rights regarding your personal information, including the right to access, correct, or request deletion of your personal data."
        ]
      },
      {
        "title": "Contact Us",
        "content": [
          "If you have questions or comments about this notice, you may contact us at support@tecbunny.com or +91 96041 36010."
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();

-- 2. Terms of Service
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'terms_of_service', 
  'Terms of Service', 
  '{
    "title": "Terms of Service",
    "lastUpdated": "2026-06-29",
    "introduction": [
      "By accessing or using the services provided by TecBunny (\"Company,\" \"we,\" \"us,\" or \"our\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    ],
    "sections": [
      {
        "title": "User Accounts and Security",
        "content": ["To access certain features, you may be required to register for an account."],
        "list": [
          "You are responsible for maintaining the confidentiality of your account credentials.",
          "We reserve the right to suspend or terminate your account (and blocklist your access) at our sole discretion if we suspect any breach of these Terms or unauthorized use."
        ]
      },
      {
        "title": "Orders, Quotes, and Pricing",
        "list": [
          "Custom Setup Quotes: Any quotes generated through our Custom Setup service are valid strictly for 7 days from the date of generation.",
          "Payments: Payments are processed securely via our third-party processors (Razorpay, PhonePe).",
          "Taxes: Unless stated otherwise, quotes and orders will clearly indicate whether taxes (e.g., GST) are included."
        ]
      },
      {
        "title": "User Obligations",
        "content": ["When using our platform, you agree not to:"],
        "list": [
          "Bypass, circumvent, or attempt to bypass any security measures, including CAPTCHAs (Cloudflare Turnstile).",
          "Use the platform for any illegal or unauthorized purpose.",
          "Provide false or misleading personal information during checkout or account creation."
        ]
      },
      {
        "title": "Third-Party Integrations",
        "content": [
          "Our service may contain links to or utilize third-party services (e.g., AWS S3 for media, WhatsApp for notifications). We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party services."
        ]
      },
      {
        "title": "Limitation of Liability",
        "content": [
          "To the fullest extent permitted by applicable law, TecBunny shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the service or hardware purchases."
        ]
      },
      {
        "title": "Contact Information",
        "content": [
          "For any questions regarding these Terms, please contact us at support@tecbunny.com or +91 96041 36010."
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();

-- 3. Cookie Policy
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'cookie_policy', 
  'Cookie Policy', 
  '{
    "title": "Cookie Policy",
    "lastUpdated": "2026-06-29",
    "introduction": [
      "Cookies are small text files that are placed on your computer or mobile device when you visit a website. Local Storage is an industry-standard technology that allows a website or application to store information locally on your computer or mobile device. We use both technologies to ensure our platform functions correctly and to analyze how users interact with our site."
    ],
    "sections": [
      {
        "title": "Types of Cookies We Use: Essential Cookies",
        "content": ["These cookies are strictly necessary for the core functionality of our website. They enable you to log in securely, add items to your cart, and navigate the site. Because these cookies are essential for the site to function, they cannot be disabled."],
        "list": [
          "Authentication Cookies: Used by our authentication provider (Supabase) to keep you logged in securely.",
          "Security Cookies: Used by services like Cloudflare Turnstile to prevent spam and bot attacks."
        ]
      },
      {
        "title": "Types of Cookies We Use: Analytics and Performance Cookies (Optional)",
        "content": ["We use analytics tools (such as Vercel Analytics) to measure site performance, understand user behavior, and improve our services."],
        "list": [
          "Consent Key: tecbunny_analytics_consent",
          "Storage Location: We store your consent preference in both your browser''s Local Storage and as a secure cookie (SameSite=Lax, Secure).",
          "Duration: Your consent preference is saved for 365 days (1 year), after which you will be asked to provide consent again."
        ]
      },
      {
        "title": "Managing Your Cookie Preferences",
        "content": ["When you first visit our site, you will see a Privacy Controls banner at the bottom of the screen. You can choose to:"],
        "list": [
          "Accept: Allows us to use analytics and marketing cookies.",
          "Reject: Prevents the use of non-essential analytics cookies. The site remains fully usable."
        ]
      },
      {
        "title": "Contact Us",
        "content": [
          "If you have any questions about our use of cookies or other technologies, please contact us at support@tecbunny.com or +91 96041 36010."
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();

-- 4. Shipping & Deployment Policy
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'shipping_policy', 
  'Shipping Policy', 
  '{
    "title": "Shipping & Deployment Policy",
    "lastUpdated": "2026-06-29",
    "introduction": [
      "This Shipping & Deployment Policy details the terms and guidelines for the procurement, delivery, and physical deployment of hardware, networking assets, and server infrastructure components."
    ],
    "sections": [
      {
        "title": "Hardware Procurement & Delivery Timelines",
        "content": ["We partner with leading global hardware vendors to deliver cutting-edge systems. Our timelines are as follows:"],
        "list": [
          "Standard Networking & Client Hardware: Typically dispatched within 3-5 business days.",
          "Enterprise Configurations: Custom server builds, bulk workstations, and specialized firewalls require 10-15 business days for procurement, configuration, and pre-deployment testing.",
          "Digital Services: Software licensing, cloud setups, and virtual machine allocations are delivered digitally within 24-48 hours."
        ]
      },
      {
        "title": "Delivery & Deployment Areas",
        "content": ["We support both physical and virtual deployments:"],
        "list": [
          "On-site Deployment: We provide full physical delivery and engineer-led deployment across Goa, Maharashtra, and neighboring states.",
          "Remote Deployment: Remote setups and virtual migrations are managed globally via secure VPN and cloud channels."
        ]
      },
      {
        "title": "Milestone Handover & Acceptance",
        "content": [
          "For all physical equipment deployments, a site readiness audit is completed prior to delivery. Upon physical installation, the client’s authorized IT representative must complete and sign the Technical Acceptance Report (TAR) to confirm successful deployment.",
          "Any transit damages or delivery issues must be noted on the delivery receipt and reported to our Technical Desk within 24 hours."
        ]
      },
      {
        "title": "Logistics and Risk of Loss",
        "content": [
          "All physical hardware in transit is fully insured by our logistic partners. Risk of loss or damage passes to the client immediately upon physical delivery and sign-off at the client''s designated premises."
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();

-- 5. Return & Hardware Exchange Policy
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'return_policy', 
  'Return Policy', 
  '{
    "title": "Return & Hardware Exchange Policy",
    "lastUpdated": "2026-06-29",
    "introduction": [
      "TecBunny Solutions Pv Ltd is dedicated to delivering high-performance, enterprise-grade hardware and software solutions. This policy outlines return, refund, and warranty exchange terms for physical equipment."
    ],
    "sections": [
      {
        "title": "Hardware Returns Eligibility",
        "content": ["To qualify for a return on physical hardware assets, items must meet the following criteria:"],
        "list": [
          "Returns must be requested within 7 business days from the delivery date.",
          "Equipment must be unconfigured, unused, and in its original, unopened packaging.",
          "All eligible returns are subject to a 15% restocking fee to cover diagnostic inspections and return processing."
        ]
      },
      {
        "title": "Non-Returnable & Non-Refundable Items",
        "content": ["The following assets and purchases are strictly non-returnable:"],
        "list": [
          "Configured equipment, custom-built servers, or pre-activated network firewall appliances.",
          "SaaS subscriptions, software licenses, or customized virtual cloud resources.",
          "Services rendered, deployment costs, or consultation fees."
        ]
      },
      {
        "title": "Defective Hardware & RMA Process",
        "content": [
          "If an item is found to be defective upon installation, you must contact our Technical Desk within 24 hours of delivery.",
          "Our engineers will perform remote diagnostics. If a hardware failure is validated, we will issue a Return Merchandise Authorization (RMA) number and coordinate the repair or exchange."
        ]
      },
      {
        "title": "Manufacturer Warranties",
        "content": [
          "All enterprise hardware is covered by their respective manufacturer warranties. TecBunny Solutions facilitates the warranty claim process on your behalf, but does not extend independent hardware warranties beyond the manufacturer’s terms unless specified under a premium SLA contract."
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();

-- 6. Refund & Service Cancellation Policy
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'refund_cancellation_policy', 
  'Refund & Cancellation Policy', 
  '{
    "title": "Refund & Service Cancellation Policy",
    "lastUpdated": "2026-06-29",
    "introduction": [
      "Our Refund & Service Cancellation Policy governs the terms of service contracts, managed SLA cancellations, software subscriptions, and custom project advance refunds."
    ],
    "sections": [
      {
        "title": "Managed Services & SLA Cancellations",
        "content": ["Managed IT Support, ITES workflows, and Cybersecurity subscription contracts follow these guidelines:"],
        "list": [
          "Service contracts require a 30-day written cancellation notice sent to contract-desk@tecbunny.com before the start of the next billing cycle.",
          "Any fees paid for the active billing period are non-refundable and service will remain active until the end of that billing month."
        ]
      },
      {
        "title": "Custom Setups & Integration Projects",
        "content": ["For custom system integrations and bespoke infrastructure deployments:"],
        "list": [
          "The initial 30% project advance deposit is non-refundable once hardware procurement has been initiated or engineering mapping has commenced.",
          "If a project is cancelled by the client post-procurement, the client is liable for all hours logged and equipment costs incurred up to the date of written cancellation."
        ]
      },
      {
        "title": "Refund Processing & SLA Service Credits",
        "content": [
          "Approved refunds are processed back to the original corporate bank account or payment method within 7-10 business days.",
          "For SLA uptime violations, compensations are credited as service credits on your next billing cycle, in accordance with the terms of your SLA agreement. Direct cash payouts are not issued for SLA breaches."
        ]
      }
    ]
  }'::jsonb,
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW();
