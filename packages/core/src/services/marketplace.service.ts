/**
 * TecBunny Marketplace & Third-Party Seller Management Service
 * Implements White-Label B2B2C Marketplace Architecture & Business Rules
 */

export interface MarketplaceSeller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: 'DRAFT' | 'PENDING_VERIFICATION' | 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'REJECTED' | 'BLOCKED' | 'INACTIVE';
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'PENDING_REVIEW' | 'VERIFICATION_IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMarginRule {
  category: string;
  minMarginPercent: number;
  defaultMarginPercent: number;
}

export const CATEGORY_MARGIN_RULES: Record<string, CategoryMarginRule> = {
  'CCTV & Surveillance': { category: 'CCTV & Surveillance', minMarginPercent: 18, defaultMarginPercent: 22 },
  'Networking & IT': { category: 'Networking & IT', minMarginPercent: 15, defaultMarginPercent: 18 },
  'Computers & Laptops': { category: 'Computers & Laptops', minMarginPercent: 12, defaultMarginPercent: 15 },
  'Accessories': { category: 'Accessories', minMarginPercent: 25, defaultMarginPercent: 30 },
  'Web & Software': { category: 'Web & Software', minMarginPercent: 20, defaultMarginPercent: 25 },
  'Default': { category: 'Default', minMarginPercent: 15, defaultMarginPercent: 20 },
};

export interface PriceCalculationInput {
  sellerPurchasePrice: number;
  category: string;
  customMarginPercent?: number;
  packagingCost?: number;
  shippingRecovery?: number;
  gstRatePercent?: number;
}

export interface PriceCalculationResult {
  sellerPurchasePrice: number;
  appliedMarginPercent: number;
  marginAmount: number;
  packagingCost: number;
  shippingRecovery: number;
  taxAmount: number;
  calculatedCustomerPrice: number;
  finalCustomerPrice: number;
  isBelowMinimumMargin: boolean;
  minCategoryMarginPercent: number;
  requiresSuperadminOverride: boolean;
}

/**
 * Calculates Customer Selling Price based on White-Label Marketplace Pricing Formula
 */
export function calculateMarketplacePrice(input: PriceCalculationInput): PriceCalculationResult {
  const rule = CATEGORY_MARGIN_RULES[input.category] || CATEGORY_MARGIN_RULES['Default'];
  const minMarginPercent = rule.minMarginPercent;
  const appliedMarginPercent = input.customMarginPercent !== undefined ? input.customMarginPercent : rule.defaultMarginPercent;
  
  const isBelowMinimumMargin = appliedMarginPercent < minMarginPercent;
  const requiresSuperadminOverride = isBelowMinimumMargin;

  const baseMarginAmount = (input.sellerPurchasePrice * appliedMarginPercent) / 100;
  const packaging = input.packagingCost || 0;
  const shipping = input.shippingRecovery || 0;
  const subtotalBeforeTax = input.sellerPurchasePrice + baseMarginAmount + packaging + shipping;

  const gstPercent = input.gstRatePercent !== undefined ? input.gstRatePercent : 18;
  const taxAmount = (subtotalBeforeTax * gstPercent) / 100;

  const calculatedCustomerPrice = Math.ceil(subtotalBeforeTax + taxAmount);

  return {
    sellerPurchasePrice: input.sellerPurchasePrice,
    appliedMarginPercent,
    marginAmount: Math.round(baseMarginAmount * 100) / 100,
    packagingCost: packaging,
    shippingRecovery: shipping,
    taxAmount: Math.round(taxAmount * 100) / 100,
    calculatedCustomerPrice,
    finalCustomerPrice: calculatedCustomerPrice,
    isBelowMinimumMargin,
    minCategoryMarginPercent: minMarginPercent,
    requiresSuperadminOverride,
  };
}

export interface SettlementCalculationInput {
  sellerPurchasePrice: number;
  shippingDeduction?: number;
  commissionFeePercent?: number;
  tdsDeductionPercent?: number;
  penalties?: number;
  gstAdjustment?: number;
}

export interface SettlementCalculationResult {
  sellerPurchasePrice: number;
  commissionFee: number;
  shippingDeduction: number;
  tdsDeduction: number;
  penalties: number;
  gstAdjustment: number;
  totalDeductions: number;
  netSettlementAmount: number;
  isEligibleForRelease: boolean;
}

/**
 * Calculates Net Seller Settlement based on Double-Entry Wallet Ledger Rules
 * Net Settlement = Seller Purchase Price - Deductions (Shipping + Commission + TDS + Penalties + GST)
 */
export function calculateSellerSettlement(
  input: SettlementCalculationInput,
  orderDelivered: boolean,
  returnWindowExpired: boolean,
  hasOpenDispute: boolean
): SettlementCalculationResult {
  const commissionPercent = input.commissionFeePercent || 0;
  const commissionFee = (input.sellerPurchasePrice * commissionPercent) / 100;

  const tdsPercent = input.tdsDeductionPercent || 1; // 1% Section 194O TDS standard
  const tdsDeduction = (input.sellerPurchasePrice * tdsPercent) / 100;

  const shipping = input.shippingDeduction || 0;
  const penalties = input.penalties || 0;
  const gstAdj = input.gstAdjustment || 0;

  const totalDeductions = Math.round((commissionFee + shipping + tdsDeduction + penalties + gstAdj) * 100) / 100;
  const netSettlementAmount = Math.max(0, Math.round((input.sellerPurchasePrice - totalDeductions) * 100) / 100);

  const isEligibleForRelease = orderDelivered && returnWindowExpired && !hasOpenDispute;

  return {
    sellerPurchasePrice: input.sellerPurchasePrice,
    commissionFee: Math.round(commissionFee * 100) / 100,
    shippingDeduction: shipping,
    tdsDeduction: Math.round(tdsDeduction * 100) / 100,
    penalties,
    gstAdjustment: gstAdj,
    totalDeductions,
    netSettlementAmount,
    isEligibleForRelease,
  };
}

export interface GSTValidationResult {
  isValidFormat: boolean;
  stateCode: string;
  panFromGST: string;
  entityType: string;
}

/**
 * Validates Indian GST Identification Number (GSTIN) structure
 */
export function validateGSTIN(gstin: string): GSTValidationResult {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const cleanGST = gstin.trim().toUpperCase();
  const isValidFormat = gstRegex.test(cleanGST);

  if (!isValidFormat) {
    return {
      isValidFormat: false,
      stateCode: '',
      panFromGST: '',
      entityType: '',
    };
  }

  const stateCode = cleanGST.substring(0, 2);
  const panFromGST = cleanGST.substring(2, 12);
  const entityTypeChar = cleanGST.charAt(5);

  let entityType = 'Other';
  if (entityTypeChar === 'P') entityType = 'Proprietorship';
  else if (entityTypeChar === 'C') entityType = 'Company (Pvt/Public Ltd)';
  else if (entityTypeChar === 'F') entityType = 'Partnership / LLP';
  else if (entityTypeChar === 'H') entityType = 'HUF';
  else if (entityTypeChar === 'A') entityType = 'AOP';
  else if (entityTypeChar === 'T') entityType = 'Trust';

  return {
    isValidFormat: true,
    stateCode,
    panFromGST,
    entityType,
  };
}
