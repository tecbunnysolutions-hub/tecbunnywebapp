import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createSupabaseServiceClient, isSupabaseServiceConfigured } from '@tecbunny/core/server';
import { logger } from '@tecbunny/core';
import { TRPCError } from '@trpc/server';

interface OfferFilters {
  activeOnly: boolean;
  featuredOnly: boolean;
  homepageOnly: boolean;
  includeExpired: boolean;
}

export interface NormalizedOffer {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number | null;
  minimum_purchase_amount: number | null;
  maximum_discount_amount: number | null;
  offer_code: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  display_on_homepage: boolean;
  customer_eligibility: string;
  banner_text: string | null;
  banner_color: string | null;
  terms_and_conditions: string | null;
  priority: number;
  usage_limit: number | null;
  usage_count: number;
  usage_limit_per_customer: number | null;
  created_at: string | null;
  updated_at: string | null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return false;
}

function isMissingOffersRelation(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null | undefined;
  const message = candidate?.message?.toLowerCase() ?? '';
  return candidate?.code === '42P01'
    || candidate?.code === 'PGRST205'
    || message.includes('offers')
    || message.includes('offer_usage');
}

function inferDiscountType(row: Record<string, any>): string {
  const fromLegacyType = typeof row.type === 'string' ? row.type.toLowerCase() : '';
  if (row.discount_percentage !== undefined && row.discount_percentage !== null) return 'percentage';
  if (row.discount_amount !== undefined && row.discount_amount !== null) return 'fixed_amount';
  if (fromLegacyType.includes('percentage')) return 'percentage';
  if (fromLegacyType.includes('amount') || fromLegacyType.includes('fixed')) return 'fixed_amount';
  if (fromLegacyType.includes('shipping')) return 'free_shipping';
  return 'percentage';
}

function mapLegacyOffer(row: Record<string, any>): NormalizedOffer {
  const discountType = inferDiscountType(row);
  const discountValue = discountType === 'percentage'
    ? toNumber(row.discount_percentage) ?? 0
    : discountType === 'fixed_amount'
      ? toNumber(row.discount_amount) ?? 0
      : 0;

  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    discount_type: discountType,
    discount_value: discountValue,
    minimum_purchase_amount: toNumber(row.minimum_order_amount),
    maximum_discount_amount: null,
    offer_code: null,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: toBoolean(row.is_active ?? true),
    is_featured: false,
    display_on_homepage: false,
    customer_eligibility: row.customer_tier ? String(row.customer_tier).toLowerCase() : 'all',
    banner_text: null,
    banner_color: null,
    terms_and_conditions: null,
    priority: 0,
    usage_limit: null,
    usage_count: 0,
    usage_limit_per_customer: null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null
  };
}

function normalizeOffer(row: Record<string, any>): NormalizedOffer {
  if (!('discount_type' in row) && 'type' in row) {
    return mapLegacyOffer(row);
  }

  const inferredDiscountType = typeof row.discount_type === 'string' && row.discount_type.trim().length > 0
    ? row.discount_type
    : inferDiscountType(row);

  const priorityValue = toNumber(row.priority);
  const resolvedPriority = typeof priorityValue === 'number' && Number.isFinite(priorityValue) ? priorityValue : 0;

  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    discount_type: inferredDiscountType,
    discount_value: toNumber(row.discount_value) ?? 0,
    minimum_purchase_amount: toNumber(row.minimum_purchase_amount ?? row.minimum_order_amount),
    maximum_discount_amount: toNumber(row.maximum_discount_amount),
    offer_code: row.offer_code ?? null,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: toBoolean(row.is_active),
    is_featured: toBoolean(row.is_featured),
    display_on_homepage: toBoolean(row.display_on_homepage),
    customer_eligibility: typeof row.customer_eligibility === 'string' && row.customer_eligibility.trim().length > 0
      ? row.customer_eligibility
      : 'all',
    banner_text: row.banner_text ?? null,
    banner_color: row.banner_color ?? null,
    terms_and_conditions: row.terms_and_conditions ?? null,
    priority: resolvedPriority,
    usage_limit: toNumber(row.usage_limit),
    usage_count: toNumber(row.usage_count) ?? 0,
    usage_limit_per_customer: toNumber(row.usage_limit_per_customer),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null
  };
}

function applyOfferFilters(offers: NormalizedOffer[], filters: OfferFilters): NormalizedOffer[] {
  const now = new Date();

  const filtered = offers.filter((offer) => {
    if (filters.activeOnly && !offer.is_active) {
      return false;
    }

    if (filters.featuredOnly && !offer.is_featured) {
      return false;
    }

    if (filters.homepageOnly && !offer.display_on_homepage) {
      return false;
    }

    if (!filters.includeExpired && offer.end_date) {
      const end = new Date(offer.end_date);
      if (Number.isFinite(end.getTime()) && end < now) {
        return false;
      }
    }

    return true;
  });

  return filtered.sort((a, b) => {
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const getComparableDate = (offer: NormalizedOffer): number => {
      const preferred = offer.updated_at ?? offer.created_at ?? offer.end_date ?? offer.start_date;
      const parsed = preferred ? new Date(preferred).getTime() : NaN;
      if (Number.isFinite(parsed)) {
        return parsed as number;
      }
      return 0;
    };

    return getComparableDate(b) - getComparableDate(a);
  });
}

const validateOfferBusinessRules = (payload: Record<string, any>): string | null => {
  const discountType = typeof payload.discount_type === 'string' ? payload.discount_type : undefined;
  const discountValue = toNumber(payload.discount_value);

  if (discountType === 'percentage') {
    if (discountValue === null) {
      return 'Percentage offers require a discount value.';
    }
    if (discountValue <= 0 || discountValue > 100) {
      return 'Percentage discounts must be between 0 and 100.';
    }
  }

  if (discountType === 'fixed_amount') {
    if (discountValue === null) {
      return 'Fixed amount offers require a discount value.';
    }
    if (discountValue <= 0) {
      return 'Fixed amount discounts must be greater than 0.';
    }
  }

  const minimumPurchase = toNumber(payload.minimum_purchase_amount ?? payload.minimum_order_amount);
  if (minimumPurchase !== null && minimumPurchase < 0) {
    return 'Minimum purchase amount cannot be negative.';
  }

  const maximumDiscount = toNumber(payload.maximum_discount_amount);
  if (maximumDiscount !== null && maximumDiscount < 0) {
    return 'Maximum discount amount cannot be negative.';
  }

  const usageLimit = toNumber(payload.usage_limit);
  if (usageLimit !== null && usageLimit <= 0) {
    return 'Usage limit must be greater than 0.';
  }

  const usageLimitPerCustomer = toNumber(payload.usage_limit_per_customer);
  if (usageLimitPerCustomer !== null && usageLimitPerCustomer <= 0) {
    return 'Per-customer usage limit must be greater than 0.';
  }

  if (
    usageLimit !== null &&
    usageLimitPerCustomer !== null &&
    usageLimitPerCustomer > usageLimit
  ) {
    return 'Per-customer usage limit cannot exceed the total usage limit.';
  }

  return null;
};

export const offersRouter = router({
  getAll: publicProcedure
    .input(z.object({
      activeOnly: z.boolean().default(false),
      featuredOnly: z.boolean().default(false),
      homepageOnly: z.boolean().default(false),
      includeExpired: z.boolean().default(false),
    }).optional())
    .query(async ({ input, ctx }: { input: any, ctx: any }) => {
      const filters = input || {
        activeOnly: false,
        featuredOnly: false,
        homepageOnly: false,
        includeExpired: false,
      };

      const supabase = createSupabaseServiceClient();
      
      const fetchResult = await supabase
        .from('offers')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      let normalizedOffers: NormalizedOffer[] | null = null;

      if (fetchResult.error) {
        logger.warn('offers.fetch.modern_failed', {
          code: fetchResult.error.code,
          message: fetchResult.error.message,
          details: fetchResult.error.details
        });

        const legacyResult = await supabase
          .from('offers')
          .select('id,title,description,type,discount_percentage,discount_amount,start_date,end_date,is_active,category,customer_tier,minimum_order_amount,created_at,updated_at')
          .order('start_date', { ascending: false });

        if (legacyResult.error) {
          logger.error('offers.fetch.legacy_failed', {
            code: legacyResult.error.code,
            message: legacyResult.error.message,
            details: legacyResult.error.details
          });
          if (isMissingOffersRelation(legacyResult.error)) {
            return { offers: [], count: 0 };
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch offers' });
        }

        normalizedOffers = (legacyResult.data || []).map((row: any) => mapLegacyOffer(row));
      } else {
        normalizedOffers = (fetchResult.data || []).map((row: any) => normalizeOffer(row));
      }

      const filteredOffers = applyOfferFilters(normalizedOffers ?? [], filters);

      return {
        offers: filteredOffers,
        count: filteredOffers.length
      };
    }),

  create: protectedProcedure
    .input(z.any()) // Using z.any() for simplicity, can type strictly later
    .mutation(async ({ input, ctx }: { input: any, ctx: any }) => {
      if (!isSupabaseServiceConfigured) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Supabase config missing' });
      }

      const supabaseAdmin = createSupabaseServiceClient();
      const offerData = input;

      const requiredFields = ['title', 'discount_type', 'start_date', 'end_date'];
      for (const field of requiredFields) {
        if (!offerData[field]) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Missing required field: ${field}` });
        }
      }

      const startDate = new Date(offerData.start_date);
      const endDate = new Date(offerData.end_date);
      if (endDate <= startDate) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'End date must be after start date' });
      }

      if (offerData.offer_code) {
        const { data: existingOffer } = await supabaseAdmin
          .from('offers')
          .select('id')
          .eq('offer_code', offerData.offer_code)
          .single();

        if (existingOffer) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer code already exists' });
        }
      }

      const businessRuleError = validateOfferBusinessRules(offerData);
      if (businessRuleError) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: businessRuleError });
      }

      const { data: newOffer, error: insertError } = await supabaseAdmin
        .from('offers')
        .insert([{ ...offerData, created_by: ctx.session.user.id }])
        .select()
        .single();

      if (insertError) {
        if (isMissingOffersRelation(insertError)) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Offers storage is not migrated yet' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create offer' });
      }

      return { offer: newOffer, message: 'Offer created successfully' };
    }),

  update: protectedProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }: { input: any, ctx: any }) => {
      if (!isSupabaseServiceConfigured) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Supabase config missing' });
      }

      const supabaseAdmin = createSupabaseServiceClient();
      const { id, ...updateData } = input;

      if (!id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer ID is required' });
      }

      const { data: existingOffer, error: existingOfferError } = await supabaseAdmin
        .from('offers')
        .select('*')
        .eq('id', id)
        .single();

      if (existingOfferError) {
        if (isMissingOffersRelation(existingOfferError)) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Offers storage is not migrated yet' });
        }
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
      }

      const effectiveStartDate = updateData.start_date ?? existingOffer.start_date;
      const effectiveEndDate = updateData.end_date ?? existingOffer.end_date;
      if (effectiveStartDate && effectiveEndDate) {
        const startDate = new Date(effectiveStartDate);
        const endDate = new Date(effectiveEndDate);
        if (endDate <= startDate) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'End date must be after start date' });
        }
      }

      if (updateData.offer_code && updateData.offer_code !== existingOffer.offer_code) {
        const { data: conflictingOffer } = await supabaseAdmin
          .from('offers')
          .select('id')
          .eq('offer_code', updateData.offer_code)
          .neq('id', id)
          .single();

        if (conflictingOffer) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer code already exists' });
        }
      }

      const mergedOffer = { ...existingOffer, ...updateData };
      const businessRuleError = validateOfferBusinessRules(mergedOffer);
      if (businessRuleError) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: businessRuleError });
      }

      const { data: updatedOffer, error: updateError } = await supabaseAdmin
        .from('offers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        if (isMissingOffersRelation(updateError)) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Offers storage is not migrated yet' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update offer' });
      }

      return { offer: updatedOffer, message: 'Offer updated successfully' };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }: { input: any, ctx: any }) => {
      if (!isSupabaseServiceConfigured) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Supabase config missing' });
      }

      const supabaseAdmin = createSupabaseServiceClient();
      const { id } = input;

      const { data: usageData } = await supabaseAdmin
        .from('offer_usage')
        .select('id')
        .eq('offer_id', id)
        .limit(1);

      if (usageData && usageData.length > 0) {
        const { error: deactivateError } = await supabaseAdmin
          .from('offers')
          .update({ is_active: false })
          .eq('id', id);

        if (deactivateError) {
          if (isMissingOffersRelation(deactivateError)) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Offers storage is not migrated yet' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to deactivate offer' });
        }

        return { message: 'Offer has been deactivated (cannot delete used offers)' };
      }

      const { error: deleteError } = await supabaseAdmin
        .from('offers')
        .delete()
        .eq('id', id);

      if (deleteError) {
        if (isMissingOffersRelation(deleteError)) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Offers storage is not migrated yet' });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete offer' });
      }

      return { message: 'Offer deleted successfully' };
    }),
});
