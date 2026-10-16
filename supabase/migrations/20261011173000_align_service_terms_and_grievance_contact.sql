-- Align public policy text with the owner-confirmed service, warranty, area
-- and grievance-contact details. This migration is idempotent.

UPDATE public.policies
SET
  content = replace(
    replace(
      replace(content::text,
        'Shubham Sakharam Bhisaji (Director)',
        'Shubham Bhisaji'),
      'mailto:support@tecbunny.com">support@tecbunny.com</a>',
      'mailto:shubham@tecbunny.com">shubham@tecbunny.com</a>'),
    '<strong>Phone:</strong> +91 96041 36010',
    '<strong>Phone:</strong> 7387375651')::jsonb,
  updated_at = now()
WHERE key = 'privacy_policy'
  AND content::text NOT LIKE '%shubham@tecbunny.com%';

UPDATE public.policies
SET
  content = replace(
    replace(
      content::text,
      '<h2>Governing Law and Dispute Resolution</h2>',
      $service_terms$<h2>Service Visits, Warranty and Service Area</h2>
<p>For RFID Locks, Networking and IT Support in North Goa, the site visit charge is Rs 599. It is waived when you go ahead and the total hardware and service charge is more than Rs 1,499. Final price is confirmed in a written quote before work starts.</p>
<p>Equipment is covered by the manufacturer warranty that applies to its brand and product. For equipment supplied by TecBunny, we handle brand warranty claims for the customer. TecBunny workmanship warranty is 6 months. Torn or cut cables and physical damage are not covered by our workmanship warranty.</p>
<p>Our service area is all of North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra, near the Goa border. We confirm the visit time when you book; we do not promise a fixed response time.</p>

<h2>Governing Law and Dispute Resolution</h2>$service_terms$),
    'Mapusa, Goa, India',
    'Pernem, Goa, India')::jsonb,
  updated_at = now()
WHERE key = 'terms_of_service'
  AND content::text NOT LIKE '%Service Visits, Warranty and Service Area%';

UPDATE public.policies
SET
  content = replace(
    content::text,
    'We will acknowledge grievances within a reasonable time and endeavour to resolve them in accordance with applicable law.',
    'We will acknowledge and resolve grievances within 3 days.')::jsonb,
  updated_at = now()
WHERE key = 'privacy_policy'
  AND content::text NOT LIKE '%acknowledge and resolve grievances within 3 days%';
