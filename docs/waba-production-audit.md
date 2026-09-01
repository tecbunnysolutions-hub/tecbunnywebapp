# WABA PRODUCTION READINESS AUDIT
**Date**: 2026-09-02  
**Audit Scope**: Complete TecBunny WABA WhatsApp Business API Implementation  
**Objective**: Identify gaps and blockers preventing production deployment

---

## EXECUTIVE SUMMARY

**Overall Status**: 🟡 **SIGNIFICANT PROGRESS** — Foundation solid, core features partially implemented, many gaps remain  
**Production Ready**: ❌ **NOT YET** — 15+ critical/high issues block production deployment

**Key Findings**:
- ✅ Webhook infrastructure (signature verification, deduplication, queuing)
- ✅ Inbound message processing with AI triage
- ✅ Consent tracking (opt-out enforcement)
- ✅ Lead service integration with canonical lead schema
- ✅ Basic campaign system
- ✅ Template management
- ⚠️ Partial: Outbound messaging (Infobip only, limited template support)
- ⚠️ Partial: Lead scoring and routing
- ❌ Missing: Comprehensive retry/dead-letter system
- ❌ Missing: Human handoff workflow
- ❌ Missing: Campaign emergency stop mechanism
- ❌ Missing: Production observability/structured logging
- ❌ Missing: Comprehensive testing
- ❌ Missing: Rate limiting on public APIs

---

## CRITICAL ISSUES (Block Production)

### C1: No Comprehensive Retry + Dead-Letter System
**Severity**: 🔴 CRITICAL  
**Impact**: Message loss, duplicate sends, silent failures  
**Current State**:
- Infobip service has exponential backoff (1s, 2s, 3s)
- No persistent event queue for failed messages
- No visibility into dead-lettered events
- No recovery/replay mechanism

**Required**:
- Create `waba_outbound_events` table (PENDING → PROCESSING → DELIVERED/FAILED/DEAD_LETTER)
- Implement BullMQ job retry strategy with exponential backoff
- Create admin UI to view and replay dead-lettered events
- Metrics: attempt count, error history, timestamp tracking

**File Impact**: `packages/core/src/services/waba-outbound.service.ts` (new)  
**Test Impact**: Integration tests for retry scenarios

---

### C2: No Campaign Emergency Stop Mechanism
**Severity**: 🔴 CRITICAL  
**Impact**: Runaway campaigns, mass unintended sends, compliance breach  
**Current State**:
- Campaign status: DRAFT, SCHEDULED, RUNNING, PAUSED, COMPLETED
- No circuit breaker or kill switch
- No rate limiting per campaign
- No validation that contacts are opted-in before sending

**Required**:
- Add `HALTED` status for emergency stops
- Create `/api/campaigns/[id]/halt` endpoint (admin only)
- Implement rate limiting per campaign (default 100/min, configurable)
- Consent check before every send
- Comprehensive audit trail of all halts

**File Impact**: `apps/waba/src/app/api/campaigns/[id]/halt/route.ts` (new)  
**Database Impact**: Add `halted_at`, `halted_by`, `halt_reason` to campaigns table

---

### C3: Missing Human Handoff Workflow
**Severity**: 🔴 CRITICAL  
**Impact**: AI cannot release control, customer frustration, sales miss  
**Current State**:
- `escalate_to_human` flag exists in triage payload
- No mechanism to transfer conversation to human agent
- AI continues processing after escalation marked
- No agent notification system

**Required**:
- Create `waba_agent_assignments` table (conversation → agent)
- Implement `/api/conversations/[id]/assign-agent` endpoint
- Add agent availability check and workload balancing
- Create queue/fallback when no agent available
- Prevent AI interference once human assigned
- Email/SMS agent notification

**File Impact**: 
- `apps/waba/src/services/AgentAssignmentService.ts` (new)
- `apps/waba/src/app/api/conversations/[id]/assign-agent/route.ts` (new)

---

### C4: No Rate Limiting on Public Lead Intake APIs
**Severity**: 🔴 CRITICAL  
**Impact**: API abuse, duplicate lead spam, DOS attack  
**Current State**:
- `/api/leads/intake` (LeadEngineService) has NO rate limiting
- `/api/contact-messages` has NO rate limiting
- No payload size validation
- No origin/referer validation
- No abuse detection

**Required**:
- Add rate limiting: 5 reqs/15min per IP
- Max payload: 1MB
- Metadata key whitelist validation
- Implement Redis-based sliding window limiter
- Add captcha/challenge for suspicious patterns
- Log all abuse attempts

**File Impact**: 
- Middleware enhancement for rate limiting
- Add to `apps/api/src/app/api/leads/intake/route.ts`

---

### C5: No Comprehensive Structured Logging/Observability
**Severity**: 🔴 CRITICAL  
**Impact**: Cannot debug production issues, no incident response capability  
**Current State**:
- Basic console.log/console.error scattered throughout
- No correlation IDs
- No structured fields (conversation_id, customer_id, message_id, etc.)
- No audit trail for critical operations

**Required**:
- Implement structured logging with correlation ID
- Log format: `{ timestamp, level, context, message, error, duration_ms, userId, conversationId, messageId }`
- Log every:
  - Webhook received/processed
  - Message sent/failed
  - Lead created/scored
  - Assignment made
  - Human handoff
  - Consent enforcement
  - Retry attempt
  - Dead-letter event
- Collect logs in centralized system (Cloud Logging, Datadog, etc.)
- Create dashboards for key metrics

**File Impact**: Entire codebase, use `@tecbunny/core/logger` consistently

---

### C6: Database Fragmentation — Multiple Lead/Conversation Models
**Severity**: 🔴 CRITICAL  
**Impact**: Data inconsistency, duplicate records, sync failures  
**Current State**:
```
sls_leads (Supabase canonical)
  ↓ Used by: LeadEngineService, WABA leadService, public intake
  ↓ Schema: first_name, email, phone, company_name, lead_score, heat_level, etc.

lead (Prisma legacy)
  ↓ Used by: WABA leadService.getLeadsForUser()
  ↓ Schema: sender_number, domain, sub_category, status, assigned_to
  ↓ Status: DEPRECATED but still active

Conversation (Prisma)
  ↓ Used by: WABA message flows, webhook processing
  ↓ Schema: sender_number, contact_name, status, assigned_to, ai_active
  ↓ Status: Parallel to sls_leads, creates confusion
```

**Required**:
- Audit: Which table is source of truth for EACH use case
- Consolidation decision:
  - Option A: Use only `sls_leads` (Supabase) for all leads
  - Option B: Mirror sls_leads to Prisma lead table (sync trigger)
  - Option C: Migrate Conversation metadata to sls_leads
- Create migration to backfill/deduplicate
- Add unique constraints to prevent re-fragmentation

**File Impact**: `apps/waba/src/services/leadService.ts`, `apps/waba/src/agents/AssignmentOrchestrator.ts`

---

## HIGH ISSUES (Must Fix Before Production)

### H1: No Idempotent Outbound Message Sending
**Severity**: 🟠 HIGH  
**Impact**: Duplicate WhatsApp messages sent to customers  
**Current State**:
- `sendWhatsAppMessage()` in Infobip service lacks idempotency key
- No deduplication on messageId
- Retry could cause duplicate sends

**Required**:
- Implement idempotency key (messageId prefix)
- Store sent messageIds in Redis with TTL
- Check for duplicate before sending
- Return cached result if duplicate within TTL

**File Impact**: `apps/waba/src/services/infobipService.ts`

---

### H2: Incomplete AI Triage Output
**Severity**: 🟠 HIGH  
**Impact**: Lead qualification data incomplete, routing failures  
**Current State**:
- AI extracts intent, domain, budget, timeline, city
- Missing extraction: decision-maker status, existing customer flag, pain point summary
- No confidence scores on extracted fields
- No fallback when AI fails

**Required**:
- Expand AI prompt to extract: decision_maker_status, is_existing_customer, pain_point_summary
- Add confidence_scores for each field
- Implement fallback: if AI fails, route to general queue
- Store raw AI response for audit

**File Impact**: `apps/waba/src/agents/InboundTriageAgent.ts`, `packages/core/src/services/ai-qualification.service.ts`

---

### H3: Campaign Send Not Consent-Checked
**Severity**: 🟠 HIGH  
**Impact**: GDPR/legal violation, sending to opted-out users  
**Current State**:
- Campaign broadcast endpoint exists
- No consent validation before sending

**Required**:
- Filter audience by `waba_contact_consent.opted_in = true`
- Log all consent checks
- Report skipped contacts (already opted out)
- Respect conversation windows (WhatsApp business rules)

**File Impact**: `apps/waba/src/app/api/campaigns/route.ts`

---

### H4: Template Validation Missing
**Severity**: 🟠 HIGH  
**Impact**: Template rejection from Meta, message failure  
**Current State**:
- Templates synced from Infobip
- No local validation before use
- No variable substitution validation
- No check for Meta approval status

**Required**:
- Validate template exists and APPROVED before sending
- Validate variable count matches placeholder count
- Check for deprecated/rejected templates
- Log template use for compliance audit

**File Impact**: `apps/waba/src/services/infobipService.ts`

---

### H5: No Lead Scoring Persistence
**Severity**: 🟠 HIGH  
**Impact**: Cannot track scoring history, audit trail missing  
**Current State**:
- `scoreLeadPriority()` returns immediate score
- Score not stored with history
- No visibility into why a lead is scored X

**Required**:
- Create `lead_score_history` table
- Store: lead_id, score, factors, timestamp, calculated_by
- Add to sls_leads update
- Enable audit trail for sales team

**File Impact**: `packages/core/src/services/lead-engine.service.ts`, new table

---

### H6: Routing Logic Not Implemented
**Severity**: 🟠 HIGH  
**Impact**: Leads not routed to appropriate teams  
**Current State**:
- Lead scores calculated
- No routing rules defined
- Assignments are ad-hoc or empty

**Required**:
- Create `waba_routing_rules` table
- Rule format: WHEN (service = X AND score >= Y) THEN assign_to_team(Z)
- Default: if no rule matches, assign to general queue
- Support load balancing across team members
- Fallback: if no availability, queue for follow-up

**File Impact**: `apps/waba/src/services/RoutingService.ts` (new), new database table

---

### H7: No Follow-Up Automation
**Severity**: 🟠 HIGH  
**Impact**: Leads lost to follow-up failures, missed conversions  
**Current State**:
- No follow-up task creation system
- Manual follow-up only

**Required**:
- Create `lead_followup_tasks` table (exists in schema)
- Implement workflows:
  - Qualified lead → 24h follow-up
  - No response → 3-day follow-up
  - High-value lead → 4-hour follow-up
  - Abandoned conversation → 7-day re-engagement
- Respect quiet hours (9pm-9am)
- Respect opt-out status
- Support SMS and email follow-ups (not just WhatsApp)

**File Impact**: `apps/waba/src/workers/nurture.worker.ts` (enhance existing)

---

### H8: Campaign Broadcast Schedule Not Enforced
**Severity**: 🟠 HIGH  
**Impact**: Campaigns send at wrong time or not at all  
**Current State**:
- Campaign has `scheduled_at` and `timezone` fields
- No scheduler to trigger sends

**Required**:
- Implement time-based job scheduler (CRON or delayed queue)
- Honor timezone for schedule
- Support one-time and recurring campaigns
- Rate-limit sends (e.g., 100/min per campaign)
- Allow pause/resume

**File Impact**: `apps/waba/src/workers/broadcast.worker.ts`, new scheduler service

---

## MEDIUM ISSUES (Should Fix Before Production)

### M1: No Customer 360 View
**Severity**: 🟡 MEDIUM  
**Impact**: Agents lack context, poor customer experience  
**Current State**:
- Endpoint exists: `/api/customer-360`
- Likely minimal implementation

**Required**:
- Unified view: phone → all leads, conversations, orders, support tickets
- History: interactions, messages, proposals
- Lead score and heat level
- Previous outcomes and follow-ups
- Open tasks and next actions

**File Impact**: `apps/waba/src/app/api/customer-360/route.ts` (enhance)

---

### M2: Database Indexes Missing
**Severity**: 🟡 MEDIUM  
**Impact**: Poor query performance, slow dashboards  
**Current State**:
- Unknown index coverage

**Required**:
- Add indexes on:
  - `sls_leads(phone)` — frequent lookups by phone
  - `sls_leads(email)` — deduplication
  - `sls_leads(lead_score)` — filtering/sorting
  - `sls_leads(created_at)` — time-based queries
  - `Message(sender_number)` — conversation retrieval
  - `waba_contact_consent(phone, opted_in)` — consent checks
  - `Campaign(status)` — campaign state queries

**File Impact**: Database migrations

---

### M3: No Audit Trail for Sensitive Operations
**Severity**: 🟡 MEDIUM  
**Impact**: Cannot prove compliance, cannot investigate issues  
**Current State**:
- No tracking of who created/updated leads
- No tracking of campaign sends
- No tracking of consent changes

**Required**:
- Create `audit_log` table (user_id, resource_type, resource_id, action, before, after, timestamp)
- Log: lead creation/updates, campaign creation/send, consent changes, assignments
- Immutable (no deletes)
- Available for admin review

**File Impact**: Middleware enhancement, new service

---

### M4: WhatsApp Conversation Window Not Enforced
**Severity**: 🟡 MEDIUM  
**Impact**: Legal/compliance violation, message failure  
**Current State**:
- No check for 24h conversation window
- Could send messages outside window

**Required**:
- Track last customer message timestamp
- Only allow:
  - Customer-initiated within 24h
  - Template messages (OTP, transactional) always
  - Marketing messages only within 24h of customer message

**File Impact**: `apps/waba/src/services/infobipService.ts`

---

### M5: No Service-to-Team Mapping
**Severity**: 🟡 MEDIUM  
**Impact**: Leads routed to wrong team  
**Current State**:
- No mapping: AI Automation → AI Team, CCTV → Infrastructure Team, etc.

**Required**:
- Create `waba_service_team_mappings` table
- Maintain mappings: service_name → team_id → available_agents
- Use in routing logic

**File Impact**: `apps/waba/src/services/RoutingService.ts`

---

### M6: No Lead Export/Analytics API
**Severity**: 🟡 MEDIUM  
**Impact**: Cannot generate reports, business intelligence blocked  
**Current State**:
- No way to extract lead data for reporting

**Required**:
- Create `/api/leads/export` endpoint (CSV, JSON)
- Support filters: date range, score, status, owner
- Create `/api/leads/analytics` endpoint:
  - Leads by source, score distribution, status distribution
  - Conversion metrics
  - Team performance
  - Campaign ROI

**File Impact**: New API routes

---

## LOW ISSUES (Nice to Have, Post-Production)

### L1: Agent Dashboard Missing
**Severity**: 🔵 LOW  
**Impact**: Agents less efficient  
**Current State**:
- No UI for agents to view assigned leads

**Required**: Create React component in WABA app

---

### L2: Campaign Analytics Missing
**Severity**: 🔵 LOW  
**Impact**: Cannot measure campaign effectiveness  
**Current State**:
- Campaigns sent, no tracking of outcomes

**Required**:
- Track sends, deliveries, reads, responses
- Calculate conversion rate
- Calculate ROI

---

### L3: AI Response Caching
**Severity**: 🔵 LOW  
**Impact**: Slower AI response on repeat messages  
**Current State**:
- Every message triggers AI call

**Required**: Cache AI responses for duplicate messages (same sender, same text)

---

## SECURITY ASSESSMENT

### ✅ Implemented
- Webhook signature verification (HMAC-SHA256)
- Timing-safe comparison (no timing oracle attack)
- Replay attack prevention (5-min timestamp window)
- Environment variable secrets (no hardcoded values)
- Service client (not user-level) for Supabase queries

### ⚠️ Gaps
- No rate limiting on public APIs (leads to DOS/spam)
- No input validation/schema validation (injection risks)
- No CORS configuration visible
- No API key rotation mechanism
- No encryption for sensitive data in transit or at rest (needs review)
- Metadata fields could accept arbitrary JSON (injection risk)

### Required
- Add rate limiting middleware
- Schema validation on all inputs (use Zod)
- Add CORS configuration
- Regular secret rotation
- PII field encryption (phone, email)

---

## TESTING ASSESSMENT

### ✅ Implemented
- Basic tests for lead deduplication (1-2 tests)

### ❌ Missing
- Unit tests for:
  - Phone/email normalization
  - Lead scoring algorithm
  - Consent logic
  - Template validation
  - Message idempotency
  - Routing rules
  - AI triage output parsing
  
- Integration tests for:
  - End-to-end webhook → lead creation
  - Duplicate webhook prevention
  - Campaign send with consent check
  - Follow-up task creation
  - Human handoff workflow
  - Dead-letter recovery
  
- Failure tests for:
  - Infobip API timeout
  - Invalid webhook signature
  - Malformed payload
  - Duplicate message
  - Opted-out contact
  - AI failure fallback
  - Database connection loss
  - Queue unavailable

### Required
- Add Vitest test suite (minimum 50+ tests)
- Mock Supabase, Infobip, Gemini APIs
- Integration tests with test database
- Failure scenario coverage

---

## ARCHITECTURE ISSUES

### A1: Synchronous AI in Webhook Request
**Issue**: InboundTriageAgent calls Gemini AI inside webhook handler  
**Risk**: Timeout if AI is slow, webhook fails  
**Fix**: Queue message for async processing, respond immediately

**File Impact**: `apps/waba/src/app/api/webhook/whatsapp/route.ts`

---

### A2: Missing Message Queue Abstraction
**Issue**: Infobip service sends directly, no abstraction  
**Risk**: Tight coupling, hard to swap providers  
**Fix**: Create `CommunicationService` interface, implement Infobip + SMS + Email

---

### A3: Hardcoded Business Logic
**Issue**: Domain, sub_category, routing rules hardcoded  
**Risk**: Brittle, cannot be updated without code change  
**Fix**: Move to database tables (automation_rules, service_mappings, etc.)

---

## COMPLIANCE CHECKLIST

| Requirement | Status | Notes |
|------------|--------|-------|
| GDPR: Consent tracking | ⚠️ Partial | Opt-out tracked, but no consent history |
| GDPR: Right to be forgotten | ❌ Missing | Cannot delete customer data |
| GDPR: Data export | ❌ Missing | No export endpoint |
| WhatsApp: 24h conversation window | ❌ Missing | Not enforced |
| WhatsApp: Template approval | ⚠️ Partial | No validation before use |
| WhatsApp: Business verification | ⚠️ Unknown | Assumed configured at Infobip |
| Anti-spam: Rate limiting | ❌ Missing | No protection |
| Anti-spam: Opt-out enforcement | ✅ Implemented | Keyword detection works |

---

## DATABASE SCHEMA IMPROVEMENTS

### Required Additions
```sql
-- Retry/Dead-Letter Tracking
CREATE TABLE waba_outbound_events (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  message_type TEXT,
  payload JSONB,
  status TEXT DEFAULT 'PENDING',
  attempt_count INT DEFAULT 0,
  last_error TEXT,
  dead_lettered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
);

-- Consent History
CREATE TABLE waba_consent_history (
  id UUID PRIMARY KEY,
  phone TEXT,
  consent_status TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ
);

-- Lead Score History
CREATE TABLE lead_score_history (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES sls_leads(id),
  score INT,
  factors JSONB,
  timestamp TIMESTAMPTZ
);

-- Agent Assignments (for handoff)
CREATE TABLE waba_agent_assignments (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  agent_id UUID,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Routing Rules
CREATE TABLE waba_routing_rules (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  conditions JSONB,
  target_team TEXT,
  priority INT,
  is_active BOOLEAN
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  resource_type TEXT,
  resource_id TEXT,
  action TEXT,
  before JSONB,
  after JSONB,
  timestamp TIMESTAMPTZ
);
```

---

## MIGRATION PATH TO PRODUCTION

### Phase 1: Foundation (Week 1)
- [ ] Fix critical database fragmentation (sls_leads vs Conversation)
- [ ] Implement structured logging throughout
- [ ] Add rate limiting to public APIs
- [ ] Add comprehensive input validation

### Phase 2: Reliability (Week 2)
- [ ] Implement retry/dead-letter system
- [ ] Add campaign emergency stop
- [ ] Implement idempotent outbound sending
- [ ] Add consent checking to campaign sends

### Phase 3: Features (Week 3)
- [ ] Implement human handoff workflow
- [ ] Build routing system
- [ ] Implement follow-up automation
- [ ] Add campaign scheduler

### Phase 4: Quality (Week 4)
- [ ] Add comprehensive test suite
- [ ] Implement observability/dashboards
- [ ] Security audit and hardening
- [ ] Performance testing under load

### Phase 5: Launch (Week 5)
- [ ] Final production checklist
- [ ] Load testing
- [ ] Incident runbook preparation
- [ ] Team training
- [ ] Soft launch with monitoring
- [ ] Full production launch

---

## FINAL PRODUCTION READINESS VERDICT

**Current Status**: 🟡 **NOT PRODUCTION READY**

**Blockers to Fix**:
1. ❌ No comprehensive retry/dead-letter system → could lose messages
2. ❌ No campaign emergency stop → risk of runaway sends
3. ❌ No human handoff mechanism → AI cannot release control
4. ❌ No rate limiting on public APIs → DOS vulnerability
5. ❌ No structured logging → cannot debug production issues
6. ❌ Database fragmentation → data inconsistency
7. ❌ Missing consent enforcement in campaigns → GDPR violation
8. ❌ No comprehensive testing → unknown failure modes

**Estimated Effort**:
- Fix CRITICAL issues: 2-3 weeks
- Fix HIGH issues: 2 weeks
- Add comprehensive testing: 1-2 weeks
- **Total**: 5-7 weeks to production ready

**Recommendation**: 
- Use this audit as implementation roadmap
- Implement CRITICAL issues first
- Target soft launch (monitoring + kill switch ready) in 4 weeks
- Full production launch after 5-7 weeks

