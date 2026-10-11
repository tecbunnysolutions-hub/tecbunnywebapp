-- Corrective update for the legal policies seeded by
-- 20260804000000_seed_legal_policies.sql:
--   1. Fill template placeholders that went live ([REGISTERED OFFICE ADDRESS],
--      [CIN], [GSTIN], [PHONE], [GRIEVANCE OFFICER NAME], [CITY/JURISDICTION]).
--   2. Terms: add "Quotes, Installation and AMC Services" section.
--   3. Privacy: add "CCTV and Site Data" section.
--   4. Shipping/Returns: widen the damage reporting window from 48 hours to 7 days.
--   5. Returns: cover installed/commissioned products and manufacturer warranty routing.
--   6. Refund: add "Services, Quotes and Advance Payments" section.
--   7. Bump "Last updated" only on policies whose text changed.
-- Idempotent: each UPDATE is a no-op when its marker is already present.

-- 1. Placeholders
UPDATE public.policies
SET
  content = replace(
    replace(
      replace(
        replace(
          replace(
            replace(content::text,
              '[REGISTERED OFFICE ADDRESS]', 'H. No. 11, Nhayginwada, Parcem, Pernem, North Goa, Goa - 403512'),
            '[CIN]', 'U80200GA2025PTC017488'),
          '[GSTIN]', '30AAMCT1608G1ZO'),
        '[PHONE]', '+91 96041 36010'),
      '[GRIEVANCE OFFICER NAME]', 'Shubham Sakharam Bhisaji (Director)'),
    '[CITY/JURISDICTION]', 'Mapusa, Goa')::jsonb,
  updated_at = now()
WHERE content::text ~ '\[(REGISTERED OFFICE ADDRESS|CIN|GSTIN|PHONE|GRIEVANCE OFFICER NAME|CITY/JURISDICTION)\]';

-- 2. Terms: services section
UPDATE public.policies
SET
  content = replace(
    replace(content::text,
      '<h2>Governing Law and Dispute Resolution</h2>',
      $new$<h2>Quotes, Installation and AMC Services</h2>
<p>In addition to online sales, TecBunny provides on-site services including site surveys, CCTV and networking installation, Annual Maintenance Contracts (AMC) and IT support. For these services:</p>
<ul>
  <li><strong>Quotes and advance payments:</strong> Service work begins only after you approve a written quote. Advance payments collected against an approved quote are applied to the final invoice. If you cancel after a site survey but before materials are ordered, we refund the advance less the survey charge stated in your quote. Once materials have been ordered or work has started, advances are refundable only to the extent materials have not been procured and work has not been performed.</li>
  <li><strong>Installation and site work:</strong> We take reasonable care during installation. Our liability for accidental damage to your property caused directly by our team is limited to the reasonable cost of repair of the affected area. Pre-existing defects, structural weaknesses, and concealed wiring or plumbing not disclosed or visible to our team are excluded.</li>
  <li><strong>Customer obligations:</strong> You agree to provide safe site access, necessary permissions (including from housing societies or landlords), power points and accurate information about the site.</li>
  <li><strong>AMC:</strong> The scope, response targets and exclusions of maintenance are defined in your AMC plan document. Hardware replacement costs are separate unless expressly included in the plan.</li>
  <li><strong>Equipment warranty:</strong> Manufacturer warranties on installed equipment are provided by the respective manufacturers; for equipment supplied by us, we assist with lodging and tracking warranty claims.</li>
</ul>

<h2>Governing Law and Dispute Resolution</h2>$new$),
    '{"title": "Governing Law and Dispute Resolution"}',
    '{"title": "Quotes, Installation and AMC Services"}, {"title": "Governing Law and Dispute Resolution"}'
  )::jsonb,
  updated_at = now()
WHERE key = 'terms_of_service'
  AND content::text NOT LIKE '%Quotes, Installation and AMC Services%';

-- 3. Privacy: CCTV and site data section
UPDATE public.policies
SET
  content = replace(
    replace(content::text,
      '<h2>Grievance Officer and Contact</h2>',
      $new$<h2>CCTV and Site Data</h2>
<p>When we install or service CCTV, access control or networking equipment at your premises, our engineers may have temporary access to camera footage, device configurations and network layouts. We treat this information as confidential: we do not view, copy or retain your camera footage except as strictly needed to complete the work you requested; any remote access we configure is documented and handed over to you at completion; and we recommend you change default passwords after handover. Footage recorded by your own systems remains your property and under your control.</p>

<h2>Grievance Officer and Contact</h2>$new$),
    '{"title": "Grievance Officer and Contact"}',
    '{"title": "CCTV and Site Data"}, {"title": "Grievance Officer and Contact"}'
  )::jsonb,
  updated_at = now()
WHERE key = 'privacy_policy'
  AND content::text NOT LIKE '%CCTV and Site Data%';

-- 4. Shipping/Returns: 48 hours -> 7 days
UPDATE public.policies
SET content = replace(content::text, 'contact us within 48 hours of delivery', 'contact us within 7 days of delivery')::jsonb,
    updated_at = now()
WHERE key = 'shipping_policy' AND content::text LIKE '%within 48 hours of delivery%';

UPDATE public.policies
SET content = replace(content::text, 'notify us within 48 hours of delivery', 'notify us within 7 days of delivery')::jsonb,
    updated_at = now()
WHERE key = 'return_policy' AND content::text LIKE '%within 48 hours of delivery%';

-- 5. Returns: installed/commissioned products and warranty routing
UPDATE public.policies
SET
  content = replace(
    replace(content::text,
      '<h2>Return Window</h2>',
      $new$<p>Products that have been installed, configured or commissioned on-site (for example CCTV cameras or networking equipment set up by our team) are treated as used and are not eligible for change-of-mind returns. Defects in such products are handled under the manufacturer warranty or your service plan.</p>

<h2>Return Window</h2>$new$),
    '<h2>Non-Returnable Items</h2>',
    $new$<p>Manufacturer warranty claims are serviced by the respective brand network. For equipment supplied by us, we will help you lodge and track the claim.</p>

<h2>Non-Returnable Items</h2>$new$
  )::jsonb,
  updated_at = now()
WHERE key = 'return_policy'
  AND content::text NOT LIKE '%installed, configured or commissioned%';

-- 6. Refund: services and advance payments section
UPDATE public.policies
SET
  content = replace(
    replace(content::text,
      '<h2>Contact Us</h2>',
      $new$<h2>Services, Quotes and Advance Payments</h2>
<p>For on-site services (site surveys, installation, AMC and IT support), advance payments collected against an approved quote are refundable as follows: before a site survey, in full; after a site survey but before materials are ordered, less the survey charge stated in your quote; after materials are ordered or work has started, only to the extent materials have not been procured and work has not been performed. Refunds of service advances are processed within the timelines stated in this policy.</p>

<h2>Contact Us</h2>$new$),
    '{"title": "Contact Us"}',
    '{"title": "Services, Quotes and Advance Payments"}, {"title": "Contact Us"}'
  )::jsonb,
  updated_at = now()
WHERE key = 'refund_cancellation_policy'
  AND content::text NOT LIKE '%Services, Quotes and Advance Payments%';

-- 7. Refresh "Last updated" only on the policies whose text changed.
UPDATE public.policies
SET
  content = replace(content::text, 'Last updated: 4 August 2026', 'Last updated: 10 October 2026')::jsonb,
  updated_at = now()
WHERE key IN ('privacy_policy', 'terms_of_service', 'shipping_policy', 'return_policy', 'refund_cancellation_policy')
  AND content::text LIKE '%Last updated: 4 August 2026%';
-- 8. Privacy: disclose third-party AI processing for the AI research tool
UPDATE public.policies
SET
  content = replace(
    replace(content::text,
      '<h2>Sharing and Disclosure</h2>',
      $new$<h2>AI Tools</h2>
<p>If you use our AI-assisted research or recommendation tools, the text you enter is processed by a third-party AI provider (Google Gemini) to generate a response. Please do not enter passwords, financial details or other sensitive personal information into these tools.</p>

<h2>Sharing and Disclosure</h2>$new$),
    '{"title": "Sharing and Disclosure"}',
    '{"title": "AI Tools"}, {"title": "Sharing and Disclosure"}'
  )::jsonb,
  updated_at = now()
WHERE key = 'privacy_policy'
  AND content::text NOT LIKE '%<h2>AI Tools</h2>%';