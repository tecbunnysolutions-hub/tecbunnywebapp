/**
 * Lead types - Canonical CRM data model
 */

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
  QUOTE = 'quote',
}

export enum LeadHeatLevel {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  ASSIGNED = 'ASSIGNED',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Canonical lead record as stored in sls_leads table
 */
export interface CanonicalLead {
  id: string;
  org_id?: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  status: LeadStatus;
  lead_score: number;
  heat_level: LeadHeatLevel;
  lead_owner_id: string | null;
  tracking_session_id: string | null;
  source_id: string | null;
  requirement: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Result from canonical lead creation service
 */
export interface LeadIntakeResult {
  lead: CanonicalLead;
  isNew: boolean;
  messageId: string | null;
}

/**
 * Validated lead source - returns canonical enum or null
 */
export function validateLeadSource(value?: string | null): LeadSource | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  
  // Direct enum match
  if (Object.values(LeadSource).includes(normalized as LeadSource)) {
    return normalized as LeadSource;
  }

  // Alias mapping for common variations
  const aliasMap: Record<string, LeadSource> = {
    'website': LeadSource.WEBSITE,
    'website_form': LeadSource.CONTACT_FORM,
    'contact': LeadSource.CONTACT_FORM,
    'contact_form': LeadSource.CONTACT_FORM,
    'form': LeadSource.CONTACT_FORM,
    'assessment': LeadSource.TECHNOLOGY_ASSESSMENT,
    'tech_assessment': LeadSource.TECHNOLOGY_ASSESSMENT,
    'technology_assessment_funnel': LeadSource.TECHNOLOGY_ASSESSMENT,
    'service': LeadSource.SERVICE_BOOKING,
    'book_service': LeadSource.SERVICE_BOOKING,
    'booking': LeadSource.SERVICE_BOOKING,
    'config': LeadSource.CONFIGURATOR,
    'enterprise': LeadSource.ENTERPRISE_CTA,
    'enterprise_cta': LeadSource.ENTERPRISE_CTA,
    'product': LeadSource.PRODUCT_INQUIRY,
    'product_inquiry': LeadSource.PRODUCT_INQUIRY,
    'whatsapp': LeadSource.WHATSAPP,
    'waba': LeadSource.WHATSAPP,
    'crm': LeadSource.MANAGEMENT_CRM,
    'manual': LeadSource.MANAGEMENT_CRM,
  };

  return aliasMap[normalized] || null;
}
