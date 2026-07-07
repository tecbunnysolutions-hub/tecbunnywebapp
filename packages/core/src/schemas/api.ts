import { z } from 'zod';

// ==========================================
// Contact Messages Schemas
// ==========================================
export const createContactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().min(5).max(160),
  phone: z.string().min(6).max(32).optional().or(z.literal('').transform(() => undefined)),
  subject: z.string().min(2).max(160).optional().or(z.literal('').transform(() => undefined)),
  message: z.string().min(10).max(5000),
  company_name: z.string().max(160).optional().or(z.literal('').transform(() => undefined)),
  origin_path: z.string().max(240).optional(),
  form_identifier: z.string().max(100).optional(),
  utm_source: z.string().max(160).optional(),
  utm_medium: z.string().max(160).optional(),
  utm_campaign: z.string().max(160).optional(),
});
export type CreateContactMessagePayload = z.infer<typeof createContactMessageSchema>;

export const contactMessageStatusFilterSchema = z.object({
  status: z
    .union([
      z.enum(['New', 'Assigned', 'Contacted', 'In Progress', 'Resolved', 'Closed', 'Rejected']),
      z.literal('all'),
      z.literal('ALL'),
    ])
    .optional()
    .transform(value => {
      if (!value) return undefined;
      return value.toLowerCase() === 'all' ? undefined : value;
    }),
  limit: z
    .string()
    .transform(value => Number.parseInt(value, 10))
    .pipe(z.number().min(1).max(200))
    .optional(),
});
export type ContactMessageStatusFilter = z.infer<typeof contactMessageStatusFilterSchema>;


// ==========================================
// Quotes / Bids Schemas
// ==========================================
export const quoteBidSchema = z.object({
  quoteId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().min(10, 'Invalid phone'),
  address: z.string().optional().nullable(),
  biddedPrice: z.number().positive('Bid must be strictly greater than 0'),
  summary: z.string().max(1000).optional().nullable(),
  customSetupConfig: z.any().optional().nullable()
});
export type QuoteBidPayload = z.infer<typeof quoteBidSchema>;


// ==========================================
// Auth 2FA Schemas
// ==========================================
export const enableTwoFactorSchema = z.object({
  secret: z.string().min(1),
  backupCodes: z.array(z.string()).min(1),
  verificationCode: z.string().min(6),
});
export type EnableTwoFactorPayload = z.infer<typeof enableTwoFactorSchema>;


// ==========================================
// Promotions Schemas
// ==========================================
export const claimViralPromotionSchema = z.object({
  phone: z.string().min(10).max(15),
  serialNumber: z.string().min(3).max(64),
  action: z.string().min(1).max(64),
});
export type ClaimViralPromotionPayload = z.infer<typeof claimViralPromotionSchema>;


// ==========================================
// Warranty Schemas
// ==========================================
export const activateWarrantySchema = z.object({
  serialNumber: z.string().min(3).max(64),
  mobile: z.string().min(10).max(15),
  otp: z.string().regex(/^\d{6}$/),
  otpId: z.string().min(1),
});
export type ActivateWarrantyPayload = z.infer<typeof activateWarrantySchema>;

// ==========================================
// Response Schemas
// ==========================================
export const genericSuccessResponseSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  message: z.string().optional(),
});

export const quoteBidResponseSchema = z.object({
  success: z.boolean(),
  quoteId: z.string().optional(),
  quoteNumber: z.string().optional()
});

export const enableTwoFactorSetupResponseSchema = z.object({
  secret: z.string(),
  qrCode: z.string(),
  backupCodes: z.array(z.string()),
  message: z.string()
});

export const enableTwoFactorConfirmResponseSchema = z.object({
  message: z.string(),
  backupCodes: z.array(z.string()).optional()
});

export const activateWarrantyResponseSchema = z.object({
  success: z.boolean(),
  device: z.object({
    type: z.string(),
    model: z.string()
  }).optional()
});

export const claimViralPromotionResponseSchema = z.object({
  success: z.boolean(),
  credited: z.number().optional()
});
