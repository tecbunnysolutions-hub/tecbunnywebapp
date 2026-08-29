-- =============================================================================
-- Seed / update legal policy pages for TECBUNNY SOLUTIONS PRIVATE LIMITED
-- -----------------------------------------------------------------------------
-- Target table : public.policies (key PK, title, content jsonb, is_published,
--                updated_at) — read by packages/core/src/settings.ts
--                getPolicyContent(pageKey) and rendered by
--                apps/public/src/components/policy-page.tsx which treats
--                content->>'description' as HTML and auto-generates anchor
--                links from <h2>/<h3> headings.
--
-- Idempotent   : INSERT ... ON CONFLICT (key) DO UPDATE. Safe to re-run.
--
-- LEGAL NOTE   : These documents are drafted for an India-registered private
--                limited e-commerce company and reference the Consumer
--                Protection Act 2019, the Consumer Protection (E-Commerce)
--                Rules 2020, the Information Technology Act 2000, the Digital
--                Personal Data Protection Act 2023 (DPDP) and applicable GST
--                law. They are a solid starting baseline but SHOULD BE REVIEWED
--                BY A QUALIFIED INDIAN LAWYER before you rely on them in
--                production. Update the bracketed placeholders
--                ([REGISTERED OFFICE ADDRESS], [GSTIN], [CIN], [PHONE],
--                [GRIEVANCE OFFICER NAME]) with your real details.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. PRIVACY POLICY
-- ---------------------------------------------------------------------------
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'privacy_policy',
  'Privacy Policy',
  jsonb_build_object(
    'title', 'Privacy Policy',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Who We Are'),
      jsonb_build_object('title', 'Information We Collect'),
      jsonb_build_object('title', 'How We Use Your Information'),
      jsonb_build_object('title', 'Legal Basis for Processing'),
      jsonb_build_object('title', 'Cookies and Tracking'),
      jsonb_build_object('title', 'Sharing and Disclosure'),
      jsonb_build_object('title', 'Payment Data Security'),
      jsonb_build_object('title', 'Data Retention'),
      jsonb_build_object('title', 'Your Rights'),
      jsonb_build_object('title', 'Children''s Privacy'),
      jsonb_build_object('title', 'Data Security'),
      jsonb_build_object('title', 'Changes to This Policy'),
      jsonb_build_object('title', 'Grievance Officer and Contact')
    ),
    'description', $policy$
<p><em>Last updated: 4 August 2026</em></p>
<p>TECBUNNY SOLUTIONS PRIVATE LIMITED ("TecBunny", "we", "us" or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you visit or make a purchase on <strong>www.tecbunny.com</strong> (the "Platform") and describes your rights under the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 and rules thereunder.</p>

<h2>Who We Are</h2>
<p>The Platform is owned and operated by TECBUNNY SOLUTIONS PRIVATE LIMITED, a company incorporated under the Companies Act, 2013, having its registered office at [REGISTERED OFFICE ADDRESS], India (CIN: [CIN]; GSTIN: [GSTIN]). For the purposes of the DPDP Act, TecBunny is the "Data Fiduciary" that determines the purpose and means of processing your personal data.</p>

<h2>Information We Collect</h2>
<p>We collect the following categories of information:</p>
<ul>
  <li><strong>Identity &amp; contact data</strong> — name, email address, phone number, billing and shipping addresses.</li>
  <li><strong>Account data</strong> — login credentials, order history, wishlists, saved carts and communication preferences.</li>
  <li><strong>Transaction data</strong> — products purchased, order value, invoices and, where applicable, GSTIN for business purchases.</li>
  <li><strong>Payment data</strong> — payments are processed by PCI-DSS compliant third-party payment gateways; we do not store your full card number, CVV or UPI PIN.</li>
  <li><strong>Technical &amp; usage data</strong> — IP address, device and browser type, operating system, referring URLs, pages viewed and interaction data collected through cookies and similar technologies.</li>
  <li><strong>Communications</strong> — records of your interactions with our support team, including via email, chat and WhatsApp.</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use your personal data to:</p>
<ul>
  <li>process, fulfil and deliver your orders and issue tax-compliant invoices;</li>
  <li>create and manage your account and provide customer support;</li>
  <li>send transactional communications such as order confirmations, shipping updates and service notifications;</li>
  <li>send marketing communications where you have opted in (you may opt out at any time);</li>
  <li>personalise your experience and recommend relevant products;</li>
  <li>detect, prevent and address fraud, security incidents and abuse; and</li>
  <li>comply with legal, tax, accounting and regulatory obligations.</li>
</ul>

<h2>Legal Basis for Processing</h2>
<p>We process your personal data on the basis of your consent, the necessity to perform our contract with you (order fulfilment), our legitimate business interests (fraud prevention, service improvement) and compliance with applicable law. Where processing relies on consent, you may withdraw that consent at any time.</p>

<h2>Cookies and Tracking</h2>
<p>We use cookies and similar technologies to operate the Platform, remember your preferences, analyse traffic and, with your consent, deliver relevant advertising. You can manage your preferences through our cookie consent banner and your browser settings. Please refer to our <a href="/info/policies/cookie">Cookie Policy</a> for full details.</p>

<h2>Sharing and Disclosure</h2>
<p>We do not sell your personal data. We share it only with:</p>
<ul>
  <li><strong>Service providers</strong> — logistics and courier partners, payment gateways, cloud hosting, communication and analytics providers who process data on our behalf under contractual confidentiality obligations;</li>
  <li><strong>Legal and regulatory authorities</strong> — where disclosure is required by law, court order or to protect our rights and the safety of users; and</li>
  <li><strong>Business transfers</strong> — in connection with a merger, acquisition or sale of assets, subject to this Policy.</li>
</ul>

<h2>Payment Data Security</h2>
<p>All payment transactions are encrypted and processed through PCI-DSS compliant payment gateways. We never store your full card details, CVV, UPI PIN or net-banking credentials on our servers.</p>

<h2>Data Retention</h2>
<p>We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, tax and accounting requirements (for example, invoices are retained for the period mandated under applicable tax law). When no longer required, data is securely deleted or anonymised.</p>

<h2>Your Rights</h2>
<p>Subject to applicable law, you have the right to:</p>
<ul>
  <li>access and obtain a summary of the personal data we process about you;</li>
  <li>request correction, completion or updating of inaccurate data;</li>
  <li>request erasure of your personal data where it is no longer required;</li>
  <li>withdraw consent previously given;</li>
  <li>nominate another individual to exercise your rights in the event of death or incapacity; and</li>
  <li>register a grievance with our Grievance Officer.</li>
</ul>
<p>To exercise any of these rights, contact us using the details below. We may need to verify your identity before acting on your request.</p>

<h2>Children's Privacy</h2>
<p>The Platform is not directed at children under the age of 18. We do not knowingly collect personal data from children without verifiable parental or guardian consent. If you believe a child has provided us data, please contact us so we can delete it.</p>

<h2>Data Security</h2>
<p>We implement reasonable security practices and procedures, including encryption in transit, access controls and secure infrastructure, to protect your personal data against unauthorised access, alteration, disclosure or destruction. However, no method of transmission over the internet is completely secure.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. Material changes will be notified on this page with a revised "Last updated" date. Your continued use of the Platform after changes take effect constitutes acceptance of the revised Policy.</p>

<h2>Grievance Officer and Contact</h2>
<p>In accordance with the Information Technology Act, 2000 and the DPDP Act, 2023, our Grievance Officer can be reached at:</p>
<p>
  <strong>Grievance Officer:</strong> [GRIEVANCE OFFICER NAME]<br />
  <strong>TECBUNNY SOLUTIONS PRIVATE LIMITED</strong><br />
  [REGISTERED OFFICE ADDRESS]<br />
  <strong>Email:</strong> <a href="mailto:support@tecbunny.com">support@tecbunny.com</a><br />
  <strong>Phone:</strong> [PHONE]
</p>
<p>We will acknowledge grievances within a reasonable time and endeavour to resolve them in accordance with applicable law.</p>
$policy$
  ),
  true,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      is_published = EXCLUDED.is_published,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. TERMS OF SERVICE
-- ---------------------------------------------------------------------------
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'terms_of_service',
  'Terms of Service',
  jsonb_build_object(
    'title', 'Terms of Service',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Acceptance of Terms'),
      jsonb_build_object('title', 'Eligibility'),
      jsonb_build_object('title', 'Your Account'),
      jsonb_build_object('title', 'Products, Pricing and Availability'),
      jsonb_build_object('title', 'Orders and Acceptance'),
      jsonb_build_object('title', 'Payments and Taxes'),
      jsonb_build_object('title', 'Shipping, Returns and Refunds'),
      jsonb_build_object('title', 'Acceptable Use'),
      jsonb_build_object('title', 'Intellectual Property'),
      jsonb_build_object('title', 'Third-Party Links and Services'),
      jsonb_build_object('title', 'Disclaimers and Warranties'),
      jsonb_build_object('title', 'Limitation of Liability'),
      jsonb_build_object('title', 'Indemnification'),
      jsonb_build_object('title', 'Termination'),
      jsonb_build_object('title', 'Governing Law and Dispute Resolution'),
      jsonb_build_object('title', 'Changes to These Terms'),
      jsonb_build_object('title', 'Contact Us')
    ),
    'description', $policy$
<p><em>Last updated: 4 August 2026</em></p>
<p>These Terms of Service ("Terms") govern your access to and use of <strong>www.tecbunny.com</strong> (the "Platform") operated by TECBUNNY SOLUTIONS PRIVATE LIMITED ("TecBunny", "we", "us" or "our"). Please read them carefully. These Terms constitute an electronic record under the Information Technology Act, 2000 and do not require any physical or digital signature.</p>

<h2>Acceptance of Terms</h2>
<p>By accessing, browsing or purchasing from the Platform, you agree to be bound by these Terms, our <a href="/info/policies/privacy">Privacy Policy</a> and all other policies referenced herein. If you do not agree, please do not use the Platform.</p>

<h2>Eligibility</h2>
<p>You must be at least 18 years of age and capable of entering into a legally binding contract under the Indian Contract Act, 1872. By using the Platform you represent that you meet these requirements and that the information you provide is accurate and complete.</p>

<h2>Your Account</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorised use. We may suspend or terminate accounts that violate these Terms or are used for fraudulent activity.</p>

<h2>Products, Pricing and Availability</h2>
<p>We make reasonable efforts to display products, descriptions, images and prices accurately. However, we do not warrant that product descriptions, colours or other content are error-free. All products are subject to availability, and we reserve the right to limit quantities, discontinue any product or correct pricing errors at any time, including after an order has been placed.</p>

<h2>Orders and Acceptance</h2>
<p>Your order constitutes an offer to purchase. All orders are subject to acceptance by us. A confirmation email acknowledges receipt of your order but does not constitute acceptance. We reserve the right to accept or decline any order, in whole or in part, including where a pricing or product error is identified or where fraud is suspected. A contract is formed only when we dispatch the product.</p>

<h2>Payments and Taxes</h2>
<p>Prices are quoted in Indian Rupees (INR) and, unless stated otherwise, are inclusive of applicable Goods and Services Tax (GST). Payment must be made through the methods offered on the Platform. All payments are processed by PCI-DSS compliant third-party payment gateways; we do not store your full payment credentials. A valid GST-compliant tax invoice will be issued for each order.</p>

<h2>Shipping, Returns and Refunds</h2>
<p>Delivery, returns, exchanges, cancellations and refunds are governed by our <a href="/info/policies/shipping">Shipping Policy</a>, <a href="/info/policies/return">Return &amp; Exchange Policy</a> and <a href="/info/policies/refund-cancellation">Refund &amp; Cancellation Policy</a>, which form part of these Terms.</p>

<h2>Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
  <li>use the Platform for any unlawful, fraudulent or infringing purpose;</li>
  <li>upload or transmit viruses, malware or harmful code;</li>
  <li>attempt to gain unauthorised access to any part of the Platform or its systems;</li>
  <li>scrape, harvest or use automated tools to extract data without our written permission; or</li>
  <li>post content that is defamatory, obscene, offensive or violates any third-party rights.</li>
</ul>

<h2>Intellectual Property</h2>
<p>All content on the Platform — including logos, trademarks, text, graphics, images, software and their arrangement — is the property of TecBunny or its licensors and is protected by applicable intellectual property laws. You may not copy, reproduce, distribute or create derivative works without our prior written consent.</p>

<h2>Third-Party Links and Services</h2>
<p>The Platform may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the content, policies or practices of any third parties. Your use of such services is at your own risk and subject to their terms.</p>

<h2>Disclaimers and Warranties</h2>
<p>Except as expressly provided and to the extent permitted by law, the Platform and its content are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. Manufacturer warranties, where applicable, are provided directly by the respective manufacturers.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, TecBunny shall not be liable for any indirect, incidental, special or consequential damages arising out of or in connection with your use of the Platform. Nothing in these Terms limits liability that cannot be excluded under the Consumer Protection Act, 2019 or other applicable law. Our aggregate liability for any claim shall not exceed the amount paid by you for the product giving rise to the claim.</p>

<h2>Indemnification</h2>
<p>You agree to indemnify and hold harmless TecBunny, its directors, officers, employees and agents from any claims, losses, liabilities and expenses (including reasonable legal fees) arising from your breach of these Terms or your misuse of the Platform.</p>

<h2>Termination</h2>
<p>We may suspend or terminate your access to the Platform at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us or third parties. Provisions that by their nature should survive termination will survive.</p>

<h2>Governing Law and Dispute Resolution</h2>
<p>These Terms are governed by and construed in accordance with the laws of India. Subject to the rights available to consumers under the Consumer Protection Act, 2019, the courts at [CITY/JURISDICTION], India shall have exclusive jurisdiction over any disputes arising out of or relating to these Terms.</p>

<h2>Changes to These Terms</h2>
<p>We may revise these Terms from time to time. The updated version will be posted on this page with a revised "Last updated" date. Your continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.</p>

<h2>Contact Us</h2>
<p>
  <strong>TECBUNNY SOLUTIONS PRIVATE LIMITED</strong><br />
  [REGISTERED OFFICE ADDRESS]<br />
  <strong>Email:</strong> <a href="mailto:support@tecbunny.com">support@tecbunny.com</a><br />
  <strong>Website:</strong> <a href="https://www.tecbunny.com">www.tecbunny.com</a>
</p>
$policy$
  ),
  true,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      is_published = EXCLUDED.is_published,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 3. SHIPPING POLICY
-- ---------------------------------------------------------------------------
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'shipping_policy',
  'Shipping Policy',
  jsonb_build_object(
    'title', 'Shipping Policy',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Order Processing'),
      jsonb_build_object('title', 'Shipping Destinations'),
      jsonb_build_object('title', 'Delivery Timelines'),
      jsonb_build_object('title', 'Shipping Charges'),
      jsonb_build_object('title', 'Order Tracking'),
      jsonb_build_object('title', 'Delivery Attempts and Failures'),
      jsonb_build_object('title', 'Damaged or Incorrect Items'),
      jsonb_build_object('title', 'Risk and Title'),
      jsonb_build_object('title', 'Contact Us')
    ),
    'description', $policy$
<p><em>Last updated: 4 August 2026</em></p>
<p>This Shipping Policy explains how TECBUNNY SOLUTIONS PRIVATE LIMITED ("TecBunny", "we", "us" or "our") processes and delivers orders placed on <strong>www.tecbunny.com</strong>.</p>

<h2>Order Processing</h2>
<p>Orders are typically processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays are processed on the next business day. You will receive an email and/or WhatsApp confirmation once your order has been dispatched.</p>

<h2>Shipping Destinations</h2>
<p>We currently ship across India through reputed logistics partners. Serviceability depends on the delivery PIN code; if we are unable to deliver to your location, we will notify you and process a full refund for any prepaid amount.</p>

<h2>Delivery Timelines</h2>
<p>Estimated delivery times after dispatch are:</p>
<ul>
  <li><strong>Metro cities:</strong> 2–5 business days</li>
  <li><strong>Other cities and towns:</strong> 4–7 business days</li>
  <li><strong>Remote and rural areas:</strong> 7–10 business days</li>
</ul>
<p>These timelines are estimates and not guaranteed. Delivery may be affected by factors beyond our control, including weather, strikes, courier delays and force majeure events.</p>

<h2>Shipping Charges</h2>
<p>Shipping charges (if any) are calculated based on order value, weight and destination and are displayed at checkout before you complete your purchase. We may offer free shipping on orders above a specified value; any such threshold will be shown at checkout.</p>

<h2>Order Tracking</h2>
<p>Once your order is dispatched, you will receive a tracking number and a link to track your shipment. You can also view order status in the "My Orders" section of your account.</p>

<h2>Delivery Attempts and Failures</h2>
<p>Our courier partners will typically make up to three delivery attempts. Please ensure the delivery address and contact number are accurate and that someone is available to receive the shipment. If delivery fails due to an incorrect address, refusal to accept, or unavailability of the recipient, the order may be returned to us and additional charges may apply for re-shipment.</p>

<h2>Damaged or Incorrect Items</h2>
<p>If your package arrives damaged, tampered with, or contains an incorrect item, please refuse delivery where possible and contact us within 48 hours of delivery with photographs of the packaging and product. We will investigate and arrange a replacement or refund in line with our <a href="/info/policies/return">Return &amp; Exchange Policy</a>.</p>

<h2>Risk and Title</h2>
<p>Risk of loss and title for products pass to you upon delivery to the address provided at checkout.</p>

<h2>Contact Us</h2>
<p>For shipping-related queries, contact us at <a href="mailto:support@tecbunny.com">support@tecbunny.com</a>.</p>
$policy$
  ),
  true,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      is_published = EXCLUDED.is_published,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 4. RETURN & EXCHANGE POLICY
-- ---------------------------------------------------------------------------
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'return_policy',
  'Return & Exchange Policy',
  jsonb_build_object(
    'title', 'Return & Exchange Policy',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Return Eligibility'),
      jsonb_build_object('title', 'Return Window'),
      jsonb_build_object('title', 'Non-Returnable Items'),
      jsonb_build_object('title', 'How to Initiate a Return'),
      jsonb_build_object('title', 'Exchanges'),
      jsonb_build_object('title', 'Inspection and Approval'),
      jsonb_build_object('title', 'Refunds'),
      jsonb_build_object('title', 'Damaged, Defective or Wrong Items'),
      jsonb_build_object('title', 'Contact Us')
    ),
    'description', $policy$
<p><em>Last updated: 4 August 2026</em></p>
<p>At TECBUNNY SOLUTIONS PRIVATE LIMITED ("TecBunny"), your satisfaction matters. This Return &amp; Exchange Policy explains when and how you can return or exchange products purchased on <strong>www.tecbunny.com</strong>, consistent with your rights under the Consumer Protection Act, 2019.</p>

<h2>Return Eligibility</h2>
<p>To be eligible for a return, the product must be:</p>
<ul>
  <li>unused, undamaged and in the same condition in which you received it;</li>
  <li>in its original packaging with all tags, manuals, accessories and free items intact; and</li>
  <li>accompanied by the original invoice or proof of purchase.</li>
</ul>

<h2>Return Window</h2>
<p>You may request a return within <strong>7 days</strong> of delivery, unless a different period is specified on the product page. Requests made after this window may not be accepted, except where the product is defective or covered by a manufacturer warranty.</p>

<h2>Non-Returnable Items</h2>
<p>The following are generally not eligible for return or exchange unless they arrive damaged or defective:</p>
<ul>
  <li>items marked "non-returnable" or "final sale" on the product page;</li>
  <li>products with broken seals, or consumables and hygiene-sensitive items once opened;</li>
  <li>customised or made-to-order products; and</li>
  <li>software, digital goods and gift cards.</li>
</ul>

<h2>How to Initiate a Return</h2>
<p>To initiate a return, go to "My Orders" in your account and select the relevant order, or email us at <a href="mailto:support@tecbunny.com">support@tecbunny.com</a> with your order number and reason for return. Our team will guide you through pickup or drop-off arrangements.</p>

<h2>Exchanges</h2>
<p>Where an exchange is available, we will replace the item with the same product (subject to stock) or a variant of equal value. If the desired replacement is unavailable, we will process a refund instead.</p>

<h2>Inspection and Approval</h2>
<p>Once we receive the returned item, we will inspect it and notify you of the approval or rejection of your return. Returns that do not meet the eligibility conditions above may be sent back to you, and no refund will be issued.</p>

<h2>Refunds</h2>
<p>Approved refunds are governed by our <a href="/info/policies/refund-cancellation">Refund &amp; Cancellation Policy</a>, including timelines and the method of refund.</p>

<h2>Damaged, Defective or Wrong Items</h2>
<p>If you receive a damaged, defective or incorrect product, notify us within 48 hours of delivery with supporting photographs. In such cases, we will arrange a free pickup and provide a replacement or full refund, including any shipping charges paid.</p>

<h2>Contact Us</h2>
<p>For any return or exchange assistance, contact us at <a href="mailto:support@tecbunny.com">support@tecbunny.com</a>.</p>
$policy$
  ),
  true,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      is_published = EXCLUDED.is_published,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 5. REFUND & CANCELLATION POLICY
-- ---------------------------------------------------------------------------
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'refund_cancellation_policy',
  'Refund & Cancellation Policy',
  jsonb_build_object(
    'title', 'Refund & Cancellation Policy',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Order Cancellation by You'),
      jsonb_build_object('title', 'Cancellation by Us'),
      jsonb_build_object('title', 'Eligibility for Refunds'),
      jsonb_build_object('title', 'Refund Method'),
      jsonb_build_object('title', 'Refund Timelines'),
      jsonb_build_object('title', 'Partial Refunds and Deductions'),
      jsonb_build_object('title', 'Failed and Duplicate Payments'),
      jsonb_build_object('title', 'Non-Refundable Charges'),
      jsonb_build_object('title', 'Contact Us')
    ),
    'description', $policy$
<p><em>Last updated: 4 August 2026</em></p>
<p>This Refund &amp; Cancellation Policy explains how TECBUNNY SOLUTIONS PRIVATE LIMITED ("TecBunny") handles order cancellations and refunds for purchases made on <strong>www.tecbunny.com</strong>.</p>

<h2>Order Cancellation by You</h2>
<p>You may cancel an order before it is dispatched at no charge through the "My Orders" section of your account or by contacting us at <a href="mailto:support@tecbunny.com">support@tecbunny.com</a>. Once an order has been dispatched, it cannot be cancelled, but you may be able to return it under our <a href="/info/policies/return">Return &amp; Exchange Policy</a>.</p>

<h2>Cancellation by Us</h2>
<p>We reserve the right to cancel an order, in whole or in part, in cases including but not limited to: the product being out of stock, pricing or listing errors, suspected fraud, or the delivery location being non-serviceable. If we cancel a prepaid order, you will receive a full refund.</p>

<h2>Eligibility for Refunds</h2>
<p>Refunds are issued when:</p>
<ul>
  <li>you cancel a prepaid order before dispatch;</li>
  <li>we cancel your order for any of the reasons above;</li>
  <li>an approved return is received and passes inspection; or</li>
  <li>a product is confirmed damaged, defective or incorrect.</li>
</ul>

<h2>Refund Method</h2>
<p>Refunds are processed to the original payment method used at the time of purchase. For Cash on Delivery (COD) orders, refunds are issued via bank transfer or an equivalent method for which you will be asked to provide the necessary details. Where you agree, we may also offer store credit as an alternative.</p>

<h2>Refund Timelines</h2>
<p>Once a refund is approved, we initiate it within 3–5 business days. The time for the amount to reflect in your account depends on your bank or payment provider and typically ranges from 5–10 business days after initiation.</p>

<h2>Partial Refunds and Deductions</h2>
<p>In certain cases, only a partial refund may be granted — for example, where a returned item shows signs of use, is missing parts, or is not in its original condition through no fault of ours. Any promotional discounts applied to the original order will be adjusted in the refund amount.</p>

<h2>Failed and Duplicate Payments</h2>
<p>If your payment fails but an amount is debited, or if you are charged more than once for a single order, the excess or erroneously debited amount will be automatically reversed by the payment gateway, usually within 5–7 business days. If it is not, please contact us and we will assist in resolving it.</p>

<h2>Non-Refundable Charges</h2>
<p>Unless the return is due to our error or a defective product, shipping charges and certain convenience or handling fees may be non-refundable. Any such non-refundable charges will be disclosed to you where applicable.</p>

<h2>Contact Us</h2>
<p>For refund and cancellation queries, contact us at <a href="mailto:support@tecbunny.com">support@tecbunny.com</a>.</p>
$policy$
  ),
  true,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      is_published = EXCLUDED.is_published,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- 6. COOKIE POLICY
-- ---------------------------------------------------------------------------
INSERT INTO public.policies (key, title, content, is_published, updated_at)
VALUES (
  'cookie_policy',
  'Cookie Policy',
  jsonb_build_object(
    'title', 'Cookie Policy',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'What Are Cookies'),
      jsonb_build_object('title', 'Types of Cookies We Use'),
      jsonb_build_object('title', 'Third-Party Cookies'),
      jsonb_build_object('title', 'How We Use Cookies'),
      jsonb_build_object('title', 'Managing Your Preferences'),
      jsonb_build_object('title', 'Changes to This Policy'),
      jsonb_build_object('title', 'Contact Us')
    ),
    'description', $policy$
<p><em>Last updated: 4 August 2026</em></p>
<p>This Cookie Policy explains how TECBUNNY SOLUTIONS PRIVATE LIMITED ("TecBunny") uses cookies and similar technologies on <strong>www.tecbunny.com</strong>. It should be read together with our <a href="/info/policies/privacy">Privacy Policy</a>.</p>

<h2>What Are Cookies</h2>
<p>Cookies are small text files stored on your device when you visit a website. They help the website function, remember your preferences and understand how you interact with it. Similar technologies include web beacons, pixels and local storage.</p>

<h2>Types of Cookies We Use</h2>
<ul>
  <li><strong>Strictly necessary cookies</strong> — required for the Platform to function, such as maintaining your session, cart and security. These cannot be switched off.</li>
  <li><strong>Preference cookies</strong> — remember your choices such as language, region and display settings.</li>
  <li><strong>Analytics cookies</strong> — help us understand how visitors use the Platform so we can improve it. These are used only with your consent.</li>
  <li><strong>Marketing cookies</strong> — used, with your consent, to deliver relevant advertisements and measure their effectiveness.</li>
</ul>

<h2>Third-Party Cookies</h2>
<p>Some cookies are placed by third-party service providers, such as analytics and advertising partners. These third parties may process data in accordance with their own privacy policies. We do not control these cookies.</p>

<h2>How We Use Cookies</h2>
<p>We use cookies to operate and secure the Platform, remember your preferences, analyse traffic and performance, personalise content and, with your consent, deliver relevant advertising.</p>

<h2>Managing Your Preferences</h2>
<p>When you first visit the Platform, you can accept or manage non-essential cookies through our cookie consent banner. You can change your preferences at any time and can also control cookies through your browser settings, including deleting or blocking them. Please note that disabling certain cookies may affect the functionality of the Platform.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date.</p>

<h2>Contact Us</h2>
<p>For questions about our use of cookies, contact us at <a href="mailto:support@tecbunny.com">support@tecbunny.com</a>.</p>
$policy$
  ),
  true,
  now()
)
ON CONFLICT (key) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      is_published = EXCLUDED.is_published,
      updated_at = now();

COMMIT;

-- Verify:
-- SELECT key, title, is_published, updated_at FROM public.policies ORDER BY key;
