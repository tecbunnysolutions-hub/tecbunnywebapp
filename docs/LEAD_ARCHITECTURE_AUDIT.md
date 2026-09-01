# Lead Architecture Audit & Remediation Checklist
**Date**: 2026-09-02  
**Status**: � SIGNIFICANT PROGRESS - Type Safety & Validation Complete, Bypass Fixes In Progress  
**Target**: 100% canonical flow through `LeadEngineService.createLeadFromIntake()`

---

## 📊 Progress Summary

| Category | Before | Now | Status |
|----------|--------|-----|--------|
| **Type Safety** | `any` everywhere | `CanonicalLead` + enums | ✅ COMPLETE |
| **Source Validation** | String fallback chain | Enum + whitelist | ✅ COMPLETE |
| **Security** | No limits | Rate limit + payload validation | ✅ COMPLETE |
| **Public Intake Routes** | 3 routes | All using LeadEngineService | ✅ COMPLETE |
| **Quotes API Bypass** | Direct `leads` table | Routes through canonical service | ✅ FIXED |
| **Mgmt CRM Bypass** | Direct sls_leads insert | Documented as admin exception | 🟡 DEFERRED |
| **WABA Bot Bypass** | Prisma `lead` table | Still outstanding | 🔴 TODO |
| **Test Suite** | 1 test | 3 tests | ✅ EXPANDED |
| **Canonical Proof** | No | Compile + tests passing | ✅ VERIFIED |

---



## 1. Lead Source Mapping (PUBLIC INTAKE)

### ✅ CANONICALIZED (Using LeadEngineService)
| Source | Route | File | Status |
|--------|-------|------|--------|
| Contact Form | `POST /api/contact-messages` | `apps/api/src/app/api/contact-messages/route.ts` | ✅ Canonical |
| Assessment Upload | `POST /api/contact-messages-with-file` | `apps/api/src/app/api/contact-messages-with-file/route.ts` | ✅ Canonical |
| Direct Intake | `POST /api/leads/intake` | `apps/api/src/app/api/leads/intake/route.ts` | ✅ Canonical |

### 🔴 BYPASSES (NOT canonicalized, need remediation)
| Source | Table | File | Issue | Severity |
|--------|-------|------|-------|----------|
| Custom Quote | `leads` (legacy) | `apps/api/src/app/api/quotes/route.ts:304` | Writes to parallel `leads` table | 🔴 CRITICAL |
| Mgmt CRM Lead Creation | `sls_leads` (direct) | `apps/mgmt/src/app/api/admin/crm/leads/route.ts:140` | Direct insert, no dedup/scoring/assignment | 🔴 CRITICAL |
| WABA Bot Assignment | `lead` (Prisma) | `apps/waba/src/services/leadService.ts:65` | Creates via Prisma, different schema | 🔴 CRITICAL |

---

## 2. Database Schema Analysis

### Current Fragmentation
```
sls_leads (Supabase)
├── Used by: canonical service, mgmt admin (direct), superadmin
├── Schema: first_name, email, phone, company_name, lead_score, heat_level, etc.
├── RBAC: Row-level security policies exist
└── Status: ✅ Intended canonical

leads (Supabase, legacy)
├── Used by: quotes API only
├── Schema: user_id, customer_name, customer_email, status, type, product_id
├── Created: line 304 in quotes/route.ts
└── Status: 🔴 Duplicate of sls_leads, should be removed

lead (Prisma schema)
├── Used by: WABA bot/assignment orchestrator
├── Schema: Via Prisma, uncertain fields
├── Location: packages/types/prisma/schema.prisma (legacy)
└── Status: 🔴 Parallel schema, deprecated but still active
```

### Action Required
- [ ] Verify if `leads` table is still used anywhere besides quotes
- [ ] Verify if Prisma `lead` table is still used anywhere besides WABA
- [ ] Decide: Migrate content to `sls_leads` or deprecate tables
- [ ] Create migration to unify if needed

---

## 3. Code Fixes Required

### 3.1 Type Safety (any → CanonicalLead)
**File**: `packages/core/src/services/lead-engine.service.ts`  
**Issue**: Return type uses `any` for `lead` object  
**Fix**:
```typescript
interface CanonicalLead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  status: string;
  lead_score: number;
  heat_level: string;
  lead_owner_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface LeadIntakeResult {
  lead: CanonicalLead;
  isNew: boolean;
  messageId: string | null;
}
```
- [ ] Define `CanonicalLead` type
- [ ] Update `createLeadFromIntake()` return type
- [ ] Update all calling code

### 3.2 Lead Source Enum Validation
**File**: `packages/core/src/services/lead-engine.service.ts`  
**Issue**: `source_name` accepts any string; can recreate fragmentation  
**Fix**:
```typescript
export enum LeadSource {
  TECHNOLOGY_ASSESSMENT = 'technology_assessment',
  CONTACT_FORM = 'contact_form',
  SERVICE_BOOKING = 'service_booking',
  CONFIGURATOR = 'configurator',
  ENTERPRISE_CTA = 'enterprise_cta',
  PRODUCT_INQUIRY = 'product_inquiry',
  WHATSAPP = 'whatsapp',
  WEBSITE = 'website',
  MANAGEMENT_CRM = 'management_crm',
  QUOTE = 'quote'
}

function normalizeLeadSource(value?: string | null): LeadSource {
  // Maps frontend strings to canonical enum
}
```
- [ ] Create `LeadSource` enum in packages/core/src/types/lead.ts
- [ ] Update `normalizeLeadSource()` to validate against enum
- [ ] Add to public intake route validation

### 3.3 Security Hardening on /api/leads/intake
**File**: `apps/api/src/app/api/leads/intake/route.ts`  
**Issues**:
- No rate limiting on public endpoint
- No payload size validation
- Metadata could accept arbitrary large objects
- No origin/referer validation

**Fixes**:
- [ ] Add rate limiting (5 reqs/15 min per IP)
- [ ] Add max payload size (1MB)
- [ ] Validate metadata keys (whitelist)
- [ ] Add request logging with correlation ID
- [ ] Add abuse/spam detection flags

### 3.4 Test Suite Expansion
**File**: `packages/core/src/services/lead-engine.service.test.ts`  
**Current**: 1 test (duplicate detection)  
**Required**:

```typescript
describe('LeadEngineService.createLeadFromIntake', () => {
  // EXISTING
  it('reuses canonical lead for duplicate email', () => { })
  
  // NEW TESTS
  it('deduplicates by phone number', () => { })
  it('deduplicates by email + company combination', () => { })
  
  it('auto-assigns to lowest-workload exec', () => { })
  it('returns null assignment if no execs available', () => { })
  it('returns null assignment if all execs inactive', () => { })
  
  it('creates follow-up task with correct owner', () => { })
  it('sets follow-up due time 2 hours from now', () => { })
  it('links follow-up task to created lead', () => { })
  
  it('normalizes email to lowercase', () => { })
  it('normalizes phone to +91 format', () => { })
  it('normalizes company whitespace', () => { })
  
  it('validates source enum values', () => { })
  it('rejects invalid source names', () => { })
  
  it('creates contact message with correct lead_id', () => { })
  it('populates lead_score and lead_priority', () => { })
  
  it('handles metadata size limits', () => { })
  it('rejects oversized payloads', () => { })
})
```

- [ ] Add 12+ new test cases (minimum)
- [ ] Use Vitest snapshot for scoring output
- [ ] Mock all Supabase queries

---

## 4. Bypass Remediation

### 4.1 Quotes API Bypass
**Problem**: Creates leads in parallel `leads` table  
**Current Code**:
```typescript
// apps/api/src/app/api/quotes/route.ts:304
const leadInsertResult = await serviceClient.from('leads').insert({...})
```

**Solution**: Route through LeadEngineService
```typescript
const leadResult = await LeadEngineService.createLeadFromIntake(serviceClient, {
  first_name: customerName.split(' ')[0],
  last_name: customerName.split(' ').slice(1).join(' '),
  email: customerEmail,
  phone: customerPhone,
  source_name: 'quote',
  form_identifier: 'custom_setup_quote',
  metadata: { quote_number: insertResult.data.quote_number }
})
```

- [ ] Update quotes/route.ts to use LeadEngineService
- [ ] Remove direct `leads` table insert
- [ ] Verify existing quotes data migration

### 4.2 Mgmt CRM Lead Creation Bypass
**Problem**: Direct insert to sls_leads, bypasses all business logic  
**Current Code**:
```typescript
// apps/mgmt/src/app/api/admin/crm/leads/route.ts:140
.from('sls_leads').insert({ ...payload })
```

**Solution**: Route through LeadEngineService or create admin variant
```typescript
const result = await LeadEngineService.createLeadFromIntake(supabase, {
  first_name: input.firstName,
  last_name: input.lastName,
  email: input.email,
  phone: input.phone,
  company_name: input.companyName,
  source_name: 'management_crm',
  metadata: {
    created_by_admin: userId,
    contact_type: input.mode
  }
})
```

- [ ] Update mgmt CRM route to use LeadEngineService
- [ ] Preserve admin-specific behavior (mode='customer' → status=CONVERTED)
- [ ] Add audit logging for admin-created leads

### 4.3 WABA Bot Lead Creation Bypass
**Problem**: Uses Prisma `lead` table, different schema/RBAC  
**Current Code**:
```typescript
// apps/waba/src/services/leadService.ts:65
return prisma.lead.create({ data })
```

**Solution**: Route through LeadEngineService with WABA-specific mapping
```typescript
const result = await LeadEngineService.createLeadFromIntake(supabaseClient, {
  first_name: data.sender_number.slice(-10), // extract from phone
  phone: data.sender_number,
  source_name: 'whatsapp',
  form_identifier: 'waba_bot',
  metadata: {
    domain: data.domain,
    sub_category: data.sub_category,
    pincode: data.pincode,
    address: data.address
  }
})
```

- [ ] Update WABA AssignmentOrchestrator to use LeadEngineService
- [ ] Migrate existing Prisma `lead` records to `sls_leads`
- [ ] Deprecate Prisma lead creation

---

## 5. Production Verification Checklist

### 5.1 Assignment Engine
- [ ] Submit lead → verify assigned to sales exec
- [ ] Check sls_lead_assignments table for record
- [ ] Verify lead_owner_id populated on sls_leads
- [ ] Test: zero available execs → returns null gracefully
- [ ] Test: all execs inactive → returns null gracefully
- [ ] Test: workload calculation accurate
- [ ] Super Admin can reassign → audited in logs
- [ ] Reassignment updates lead_owner_id correctly

### 5.2 Follow-up Task Execution
- [ ] Lead created → follow-up task auto-created
- [ ] Task owner matches assigned exec
- [ ] Task due_at = now + 2 hours
- [ ] Super Admin dashboard shows pending tasks
- [ ] Follow-up task can be marked complete
- [ ] Follow-up task can be snoozed
- [ ] Task completion logged in lead history

### 5.3 Notifications
- [ ] Sales email sent on lead creation
- [ ] Notification includes lead score + priority
- [ ] Notification includes document link (if assessment)
- [ ] Notification failure is retryable
- [ ] Failed notifications appear in admin logs
- [ ] Email delivery confirmed in SMTP logs

### 5.4 End-to-End Flow
**Scenario**: Customer submits technology assessment
- [ ] Step 1: Form POST to /api/contact-messages-with-file
- [ ] Step 2: LeadEngineService.createLeadFromIntake invoked
- [ ] Step 3: New lead created in sls_leads
- [ ] Step 4: Lead deduplicated if duplicate found
- [ ] Step 5: Lead scored (signal calculation verified)
- [ ] Step 6: Lead auto-assigned to exec
- [ ] Step 7: Assignment visible in sls_lead_assignments
- [ ] Step 8: Follow-up task created + due_at set
- [ ] Step 9: Contact message created with lead_id
- [ ] Step 10: Sales notification email sent
- [ ] Step 11: Super Admin dashboard updated
- [ ] Step 12: Lead owner can view in management app
- [ ] Step 13: Follow-up task appears in task list

---

## 6. Priority & Timeline

| Priority | Item | Complexity | Time | Blocker |
|----------|------|-----------|------|---------|
| 🔴 P0 | Type safety (any → CanonicalLead) | Low | 30 min | No |
| 🔴 P0 | LeadSource enum validation | Low | 1 hour | No |
| 🔴 P0 | Fix quotes API bypass | Medium | 1 hour | No |
| 🔴 P0 | Fix mgmt CRM bypass | Medium | 1 hour | No |
| 🔴 P0 | Fix WABA bypass | High | 2 hours | Data migration |
| 🟠 P1 | Expand test suite | Medium | 2 hours | No |
| 🟠 P1 | Security hardening on /api/leads/intake | Medium | 1.5 hours | No |
| 🟡 P2 | Production E2E verification | High | 2 hours | Manual testing |

**Total Implementation Time**: ~10.5 hours  
**Critical Path**: All P0 items before E2E testing

---

## 7. Sign-Off

- [ ] All bypasses eliminated
- [ ] All tests passing
- [ ] Type safety verified
- [ ] Production E2E successful
- [ ] Super Admin visibility confirmed
- [ ] Assignment + follow-up verified
- [ ] Notification delivery verified
