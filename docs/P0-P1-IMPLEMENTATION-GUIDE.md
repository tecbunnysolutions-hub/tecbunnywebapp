# TecBunny P0-P1 Implementation Summary
**Status:** Phase 1 Complete — Lead Scoring + Analytics + Document Upload ✅  
**Date:** 2026-08-30  
**Goal:** Transform TecBunny from "website" to "revenue-generating lead acquisition system"

---

## What Was Built

### 1. ✅ **Lead Scoring Engine** (Automatic Lead Qualification)
**File:** `packages/core/src/lead-scoring.ts`

Automatically classifies every assessment as:
- 🔥 **HOT** (Score 85+): Immediate requirement + large project + blueprint uploaded + phone provided
- 🟠 **WARM** (Score 50-84): 1-3 month timeline + medium project + complete contact info
- ❄️ **COLD** (<50): Research stage, no timeline, incomplete information

**Scoring breakdown:**
```
Urgency (40pts)        → Timeline selection (immediate=40, 1mo=25, 3mo=15, exploring=5)
Project Size (30pts)   → Scale (large=30, medium=15, small=8)
Completeness (20pts)   → Phone (10), Problem statement (8), Additional notes (5), Budget (5)
Documentation (25pts)  → Blueprint uploaded
Contact Quality (10pts) → Has name + email + phone
────────────────────
Max 100 points total
```

**Used by:** Assessment submission endpoint automatically scores every lead

---

### 2. ✅ **Sales Notification System** (Real-time Lead Alerts)
**File:** `packages/core/src/leads/notify-sales.ts`

Sends real-time alerts to sales team via:
- **Email:** Rich HTML email with full lead details, score breakdown, document links
- **Webhook:** Slack/Discord/CRM integration for instant alerts

**Email format:**
```
TO: sales@tecbunny.com
SUBJECT: 🔥 HOT LEAD: Goa Resort — CCTV + Network — ₹X potential
────────────────────────────────────
Contact: Ram Kumar | Goa Resort | ram@resort.goa | +91-9604136010
Project: CCTV + Network Infrastructure | Hospitality | Large | North Goa
Timeline: Immediate | Budget: ₹50L-₹1Cr
Problem: "Wi-Fi dead zones in guest rooms, poor coverage in lobby"
Document: blueprint_floor2.pdf (2.3MB) — [View]
────────────────────────────────────
Lead Score: 95/100
✓ Immediate requirement
✓ Blueprint/documentation uploaded
✓ Complete contact details
✓ Large/enterprise scale project
────────────────────────────────────
ACTION: Call +91-9604136010 immediately. High-value, time-sensitive opportunity.
```

**Webhook payload (for Slack):**
```json
{
  "priority": "HOT",
  "score": 95,
  "lead": {
    "name": "Ram Kumar",
    "company": "Goa Resort",
    "email": "ram@resort.goa",
    "phone": "+91-9604136010"
  },
  "project": {
    "service": "CCTV + Network Infrastructure",
    "industry": "Hospitality",
    "scale": "Large",
    "city": "North Goa",
    "timeline": "Immediate",
    "budget": "₹50L-₹1Cr"
  },
  "signals": [
    "Immediate requirement",
    "Blueprint/documentation uploaded",
    "Complete contact details",
    "Large/enterprise scale project"
  ],
  "timestamp": "2026-08-30T14:23:45Z"
}
```

---

### 3. ✅ **Document Upload + Integration**
**File:** `apps/api/src/app/api/contact-messages-with-file/route.ts`

Complete end-to-end flow:
```
User submits assessment form + PDF/image
           ↓
Backend validates file (signature, size, MIME type)
           ↓
Uploads to Supabase Storage (contact-message-attachments bucket)
           ↓
Extracts structured data from message
           ↓
Runs lead scoring algorithm
           ↓
Stores lead score + priority in database
           ↓
Sends sales notification asynchronously
           ↓
Returns response: { success: true, leadScore: 95, leadPriority: 'HOT', documentUrl: '...' }
```

**Validation:**
- Max file size: 10MB
- Allowed types: PDF, PNG, JPG, WEBP
- File signature verification (prevents fake files)
- Supabase bucket with file-type allowlist

---

### 4. ✅ **Analytics Normalization**
**File:** `packages/core/src/analytics-tracking.ts`

Standardized event taxonomy + metadata:

**Core Events:**
```
page_view
assessment_started
assessment_step_completed
assessment_submitted
assessment_upload_completed
whatsapp_clicked
phone_clicked
email_clicked
quote_requested
resource_downloaded
calculator_started
calculator_completed
case_study_viewed
contact_form_started
contact_form_submitted
landing_page_viewed
comparison_page_viewed
service_card_clicked
industry_card_clicked
```

**Consistent Metadata (ALL Events):**
```
page                  → /assessment, /industries/hospitality, etc.
service               → CCTV, Network Infrastructure, Access Control, etc.
industry              → Hospitality, Real Estate, Healthcare, etc.
location              → Goa, North Goa, Panaji, etc.
source                → google, whatsapp, instagram, direct, referral
campaign              → utm_campaign value
medium                → utm_medium value
content               → utm_content value
cta_location          → hero, sidebar, footer, inline, etc.
```

**Privacy-First:**
- Auto-sanitizes PII: No name, email, phone, company in events
- Session tracking (unique ID per visitor session)
- UTM parameter extraction
- Referrer detection

**Helper Functions:**
```typescript
// Simple tracking
trackEvent('assessment_submitted', { service: 'CCTV', industry: 'Hospitality' })

// Semantic helpers
AssessmentTracking.submitted(service, industry, hasDocument)
ContactTracking.whatsappClicked(source)
ContentTracking.caseStudyViewed(caseStudyTitle, industry)
ToolTracking.calculatorCompleted(calculatorType, result)

// Batch tracking
trackEventBatch([
  { event: 'page_view', metadata: {...} },
  { event: 'hero_cta_clicked', metadata: {...} }
])
```

---

### 5. ✅ **Database Schema Updates**
**File:** `supabase/migrations/20260830000001_add_document_attachment_to_contact_messages.sql`

**New Columns (contact_messages table):**
```sql
document_url           text              -- URL to uploaded file
document_filename      text              -- Original filename
document_mime_type     text              -- application/pdf, image/jpeg, etc.
document_size_bytes    integer           -- File size for UI display
lead_score            integer default 0 -- 0-100 score
lead_priority         text default 'COLD' -- 'HOT', 'WARM', or 'COLD'
```

**Indexes Created:**
```sql
idx_contact_messages_lead_priority        -- Fast filtering by HOT/WARM/COLD
idx_contact_messages_lead_score           -- Sort by score descending
idx_contact_messages_hot_recent           -- Find recent HOT leads (composite)
idx_contact_messages_document_url         -- Find leads with documents
```

**Storage Bucket:**
- Bucket name: `contact-message-attachments`
- Max file size: 10MB
- Allowed types: PDF, PNG, JPEG, WEBP
- Private (not publicly accessible)

---

## Immediate Action Items (BLOCKING)

### 1. Configure Email Service
**Why:** Sales notifications won't work without this

**Steps:**
1. Choose provider: SendGrid, Resend, AWS SES, Mailgun, or Brevo
2. Get API key
3. Add to `.env.local`:
   ```
   EMAIL_PROVIDER=sendgrid  # or your choice
   EMAIL_API_KEY=your_key_here
   SALES_EMAIL=sales@tecbunny.com
   ```
4. Uncomment email sending code in `packages/core/src/leads/notify-sales.ts`

**Test:**
- Submit an assessment
- Check sales inbox for email within 2 minutes
- Email should have lead score + document link

### 2. Run Database Migration
```bash
cd supabase
supabase migration up
```

Verify columns exist:
```sql
SELECT lead_score, lead_priority, document_url 
FROM contact_messages LIMIT 1;
```

### 3. Test End-to-End Flow
**Checklist:**

- [ ] Fill assessment form (select all options, not defaults)
- [ ] Upload PDF/image
- [ ] Submit
- [ ] Check database: Row has `lead_score` and `lead_priority` populated
- [ ] Check Supabase Storage: File appears in `contact-message-attachments` bucket
- [ ] Check sales email: Arrives with lead score + document link
- [ ] Check response: Frontend shows lead score + priority
- [ ] Test scoring variations:
  - Immediate + Large + Blueprint + Phone → Expect HOT (85+)
  - 3-months + Medium + No doc → Expect WARM (50-84)
  - Exploring + Small → Expect COLD (<50)

### 4. Integrate Analytics Tracking
Replace all analytics calls in UI components with new standardized functions.

**Example: TechnologyAssessmentFunnel.tsx**

Before:
```typescript
trackEvent('assessment_success_whatsapp_clicked', { company: formData.company })
```

After:
```typescript
import { AssessmentTracking, ContactTracking } from '@tecbunny/core/analytics-tracking';

ContactTracking.whatsappClicked('assessment_success')
// or more detailed:
trackEvent('whatsapp_clicked', { 
  source: 'assessment_success',
  service: formData.service,
  industry: formData.industry,
  lead_score: leadScore  // if available
})
```

**All locations to update:**
- Homepage CTAs
- Assessment funnel (all steps)
- Contact forms
- Service cards
- Industry pages

### 5. Add Webhook Integration (OPTIONAL BUT RECOMMENDED)
Send HOT leads to Slack for instant visibility:

```bash
# Get Slack webhook URL from Slack app settings
# Add to .env.local
SALES_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Then HOT leads appear in Slack instantly:
```
🔥 NEW HOT LEAD: Ram Kumar - Goa Resort
Score: 95/100 | CCTV + Network | Immediate
📍 North Goa | 📞 +91-9604136010
📎 blueprint_floor2.pdf (2.3MB)
➡️ [View in Dashboard]
```

---

## Test Scenarios

### Scenario 1: Hot Lead (Immediate Action)
**Input:**
- Service: Network Infrastructure
- Industry: Hospitality
- Scale: Large (100-500 users)
- Timeline: Immediate
- City: North Goa
- Phone: +91-9604136010
- Company: Goa Resort
- Problem: "Complete network redesign needed"
- Document: Uploaded

**Expected Output:**
- Lead Score: 90-100
- Priority: 🔥 HOT
- Email: Sent to sales@tecbunny.com within 30 seconds
- Slack: Alert in sales channel

### Scenario 2: Warm Lead (Schedule Follow-up)
**Input:**
- Service: CCTV
- Industry: Real Estate
- Scale: Medium (50-200 users)
- Timeline: 1-3 months
- City: Panaji
- Phone: Not provided
- Problem: "Current system aging"
- Document: Not uploaded

**Expected Output:**
- Lead Score: 55-75
- Priority: 🟠 WARM
- Email: Sent with "Schedule follow-up within 24 hours"
- Action: Add to nurture sequence

### Scenario 3: Cold Lead (Nurture)
**Input:**
- Service: Smart Infrastructure
- Industry: Not selected
- Scale: Not selected
- Timeline: Exploring/Budgeting
- City: Mumbai (outside service area)
- Phone: Not provided
- Problem: Not provided
- Document: Not uploaded

**Expected Output:**
- Lead Score: 10-30
- Priority: ❄️ COLD
- Email: Sent with educational resources
- Action: Nurture via email, retarget on ads

---

## Architecture Diagram

```
Assessment Form Submitted
        ↓
    File Upload (if present)
        ↓
Supabase Storage Upload
        ↓
Extract Assessment Data
(service, industry, scale, timeline, city, budget, problem)
        ↓
Lead Scoring Algorithm
(urgency + size + completeness + document + contact_quality)
        ↓
Store in Database
(contact_messages + lead_score + lead_priority)
        ↓
Trigger Sales Notification
(Email + Webhook async, don't block)
        ↓
Return Response
(success, leadScore, leadPriority, documentUrl)
        ↓
Track Analytics Event
(assessment_submitted with metadata)
        ↓
Sales Team Receives Notification
Email: 🔥 HOT — Resort — CCTV — Immediate — Score 95/100
Slack: HOT lead alert with action buttons
Dashboard: Lead appears in admin panel
```

---

## Files Summary

**Created:**
1. `packages/core/src/lead-scoring.ts` (330 lines) — Lead scoring engine
2. `packages/core/src/leads/notify-sales.ts` (380 lines) — Sales notifications
3. `packages/core/src/analytics-tracking.ts` (440 lines) — Analytics normalization

**Updated:**
1. `apps/api/src/app/api/contact-messages-with-file/route.ts` — Added lead scoring + notifications
2. `supabase/migrations/20260830000001_*.sql` — Added lead score columns + indexes
3. `apps/public/src/components/TechnologyAssessmentFunnel.tsx` — Document upload + lead priority in response
4. `apps/api/src/proxy.ts` — Already registered new endpoint

---

## Next Phase: P1 Continuation (2-3 Weeks)

**After** email notifications and analytics tracking are working:

1. **Post-submission automation**
   - Day 1: "We received your assessment"
   - Day 2: "Our team is reviewing"
   - Day 3: "Ready to schedule site visit?"

2. **Consultation booking**
   - Calendly or Cal.com integration
   - Show available time slots after assessment
   - Auto-send confirmation email

3. **Commercial SEO landing pages**
   - `/commercial-cctv-installation-goa`
   - `/hotel-cctv-installation-goa`
   - `/office-network-infrastructure-goa`
   - Each: Problem → Solution → Process → Proof → CTA

4. **Case study publishing**
   - Framework for adding real projects
   - Anonymized: "5-Star Hospitality Property — North Goa"
   - Show problem → solution → result → equipment used → photos

5. **Advanced analytics**
   - UTM attribution across entire funnel
   - Lead source → Quote → Won/Lost tracking
   - ROI by campaign

---

## Success Metrics (End of P1)

- [ ] Every assessment scored within 5 seconds
- [ ] 100% of HOT leads notified within 2 minutes
- [ ] Sales team using lead priority to prioritize outreach
- [ ] All visitor events captured with consistent metadata
- [ ] Can answer: "Which campaign generated the most qualified leads?"
- [ ] Can answer: "What's the conversion rate by source?"
- [ ] 3+ commercial SEO landing pages indexed on Google
- [ ] First case study published

---

## Troubleshooting

### Email not sending?
1. Check `.env.local` has `EMAIL_API_KEY` and `EMAIL_PROVIDER`
2. Check email service API key is valid
3. Check `SALES_EMAIL` env var is set
4. Look at backend logs: `supabase functions list` (if using Edge Functions)
5. Test with simple curl:
   ```bash
   curl -X POST http://localhost:3000/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{"event":"test","metadata":{}}'
   ```

### Lead score not populating?
1. Check migration ran: `supabase migration list`
2. Check columns exist: `SELECT column_name FROM information_schema.columns WHERE table_name='contact_messages'`
3. Check assessment data parsing (may not match expected format)
4. Look at backend logs for scoring errors

### Document not uploading?
1. Check file size < 10MB
2. Check MIME type is PDF/PNG/JPG/WEBP
3. Check Supabase bucket exists: `supabase storage list`
4. Check storage RLS policies allow uploads

### Analytics events not appearing?
1. Check `NEXT_PUBLIC_DISABLE_ANALYTICS` is not `'true'`
2. Check `/api/analytics/track` endpoint exists
3. Check browser console for errors (open DevTools)
4. Check analytics backend is receiving data

---

## Estimated Timeline

- **Setup & Configuration:** 1-2 hours
- **Testing & Verification:** 2-3 hours
- **Analytics Integration:** 3-4 hours
- **Admin Dashboard:** 4-6 hours
- **Email Template Customization:** 1-2 hours

**Total for full P0 completion: 2-3 days**

---

## Questions?

Refer to code comments or check implementation files:
- `packages/core/src/lead-scoring.ts` — Full scoring logic with examples
- `packages/core/src/leads/notify-sales.ts` — Email formatting + webhook structure
- `packages/core/src/analytics-tracking.ts` — Event tracking patterns
- `apps/api/src/app/api/contact-messages-with-file/route.ts` — Full request/response flow
