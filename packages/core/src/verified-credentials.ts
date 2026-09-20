/**
 * Central registry of verifiable company credentials.
 *
 * GOVERNANCE RULE: Public pages must not claim certifications, partnerships,
 * licenses, accreditations, or compliance standards that are not listed here
 * with `status: 'verified'`. Everything defaults to 'unverified' until
 * documentary evidence (certificate ID, contract, audit report) is attached
 * in the `evidence` field and the entry is flipped to 'verified'.
 *
 * Do NOT invent, infer, or assume credentials. When in doubt, leave the
 * entry unverified and use the generic wording from `UNVERIFIED_WORDING`.
 */

export type CredentialStatus = 'verified' | 'unverified';

export interface VerifiedCredential {
  /** Machine-readable key used by components. */
  key: string;
  /** Human-readable label, shown only when verified. */
  label: string;
  /** What kind of claim this governs. */
  category: 'certification' | 'partnership' | 'license' | 'accreditation' | 'compliance';
  /** Current verification state. Defaults to 'unverified'. */
  status: CredentialStatus;
  /**
   * Evidence reference (certificate number, contract ref, audit report path).
   * Required before flipping status to 'verified'.
   */
  evidence?: string;
}

/**
 * All credential claims currently used (or previously used) in public copy.
 * Every entry is 'unverified' until evidence is attached.
 */
export const VERIFIED_CREDENTIALS: readonly VerifiedCredential[] = [
  {
    key: 'engineering-team-certifications',
    label: 'Certified Engineering Team',
    category: 'certification',
    status: 'unverified',
  },
  {
    key: 'oem-authorized-distributorship',
    label: 'Authorized OEM Distribution Partner',
    category: 'partnership',
    status: 'unverified',
  },
  {
    key: 'fluke-cable-certification',
    label: 'Fluke-Certified Cable Testing',
    category: 'certification',
    status: 'unverified',
  },
  {
    key: 'hipaa-compliance',
    label: 'HIPAA-Compliant Infrastructure',
    category: 'compliance',
    status: 'unverified',
  },
  {
    key: 'dod-data-destruction',
    label: 'DoD-Standard Data Destruction',
    category: 'compliance',
    status: 'unverified',
  },
  {
    key: 'ewaste-authorized-recycler',
    label: 'Authorized E-Waste Recycler Network',
    category: 'license',
    status: 'unverified',
  },
] as const;

/** Look up a credential by key. */
export function getCredential(key: string): VerifiedCredential | undefined {
  return VERIFIED_CREDENTIALS.find((c) => c.key === key);
}

/** True only when the credential exists AND has verified status with evidence. */
export function isCredentialVerified(key: string): boolean {
  const c = getCredential(key);
  return c?.status === 'verified' && Boolean(c.evidence);
}

/**
 * Approved generic wording for unverified claims. Pages should use these
 * strings instead of certification-specific language until the matching
 * credential is verified.
 */
export const UNVERIFIED_WORDING = {
  engineeringTeam: 'experienced field engineering team',
  oemSourcing: 'genuine enterprise equipment sourced through established distribution channels',
  cableTesting: 'certified cable testing with documented test reports',
  clinicalNetworking: 'privacy-focused, segregated clinical networking',
  dataWiping: 'multi-pass secure data wiping aligned with recognized data-destruction standards',
  ewaste: 'e-waste disposal through authorized recyclers',
} as const;

export type UnverifiedWording = typeof UNVERIFIED_WORDING;
