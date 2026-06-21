import type { CategoryGstRates } from './utils';
import type { UserRole, CustomerCategory } from './types';
import { 
  getGstRatesFromDb, 
  getRolePermissionsFromDb, 
  getCustomerCategoriesFromDb,
  getAppSettings 
} from './config-db';

/**
 * Fetch GST Rates dynamically
 */
export async function getGstRates(): Promise<CategoryGstRates> {
  const rates = await getGstRatesFromDb();
  return rates as CategoryGstRates;
}

/**
 * Fetch Role Permissions dynamically
 */
export async function getRolePermissions() {
  return getRolePermissionsFromDb();
}

/**
 * Fetch Customer Categories dynamically
 */
export async function getCustomerCategories(): Promise<Record<string, {
  name: string;
  defaultDiscount: number;
  benefits: string[];
}>> {
  const data = await getCustomerCategoriesFromDb();
  const cats: Record<string, any> = {};
  data.forEach((row) => {
    cats[row.name] = {
      name: row.name,
      defaultDiscount: Number(row.discount_percentage),
      benefits: row.benefits ? (typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits) : [],
    };
  });
  return cats;
}

/**
 * Fetch Validation Patterns
 */
export async function getValidationPatterns() {
  const settings = await getAppSettings();
  return settings.VALIDATION_PATTERNS || {
    email: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    mobile: "^[6-9]\\d{9}$",
    gstin: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
    pan: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
    pincode: "^[1-9][0-9]{5}$",
  };
}

/**
 * Fetch Order status flow
 */
export async function getOrderStatusFlow() {
  const settings = await getAppSettings();
  return settings.ORDER_STATUS_FLOW || [
    'Pending', 'Awaiting Payment', 'Payment Failed', 'Payment Confirmed', 
    'Confirmed', 'Processing', 'Ready to Ship', 'Shipped', 
    'Ready for Pickup', 'Completed', 'Delivered'
  ];
}

/**
 * Fetch Service/repair setup lifecycle
 */
export async function getServiceOrderStatusFlow() {
  const settings = await getAppSettings();
  return settings.SERVICE_ORDER_STATUS_FLOW || [
    'Pending', 'Awaiting Payment', 'Visit Scheduled', 'Visit Completed',
    'Diagnosis Done', 'Quote Sent', 'Awaiting Customer Approval', 'Approved',
    'Parts Ordered', 'Work In Progress', 'Quality Check', 'Ready for Pickup',
    'Ready for Delivery', 'Delivered/Picked Up', 'Completed', 'Warranty/Support Active'
  ];
}

/**
 * Fetch Error messages
 */
export async function getErrorMessages() {
  const settings = await getAppSettings();
  return settings.ERROR_MESSAGES || {
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_MOBILE: 'Please enter a valid 10-digit mobile number',
    INVALID_GSTIN: 'Please enter a valid GSTIN',
    REQUIRED_FIELD: 'This field is required',
    NETWORK_ERROR: 'Network error. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    SERVER_ERROR: 'Server error. Please try again later.',
  };
}

/**
 * Check if user has permission for a specific action
 * Note: Now asynchronous because roles are in DB
 */
export async function hasPermission(role: UserRole, permission: string): Promise<boolean> {
  const rolePermsAll = await getRolePermissionsFromDb();
  const rolePerms = rolePermsAll[role];
  if (!rolePerms) return false;
  if ('canManageEverything' in rolePerms) return true;
  return permission in rolePerms && rolePerms[permission];
}

/**
 * Get customer category benefits
 * Note: Now asynchronous
 */
export async function getCustomerBenefits(category: CustomerCategory) {
  const cats = await getCustomerCategories();
  return cats[category] || null;
}

