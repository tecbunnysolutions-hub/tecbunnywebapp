import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createSupabaseServiceClient, isSupabaseServiceConfigured } from '@tecbunny/core/server';
import { TRPCError } from '@trpc/server';
export const couponsRouter = router({
    getAll: publicProcedure.query(async () => {
        if (!isSupabaseServiceConfigured) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Supabase configuration missing',
            });
        }
        const supabaseAdmin = createSupabaseServiceClient();
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
            });
        }
        return data;
    }),
    getByCode: publicProcedure
        .input(z.object({ code: z.string() }))
        .query(async ({ input }) => {
        if (!isSupabaseServiceConfigured) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Supabase configuration missing',
            });
        }
        const supabaseAdmin = createSupabaseServiceClient();
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', input.code.toUpperCase())
            .eq('status', 'active')
            .single();
        if (error) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Coupon not found',
            });
        }
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Coupon has expired',
            });
        }
        const totalUsage = data.usage_count ?? data.used_count ?? 0;
        if (data.usage_limit && totalUsage >= data.usage_limit) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Coupon usage limit exceeded',
            });
        }
        return data;
    }),
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
        if (!isSupabaseServiceConfigured) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Supabase configuration missing',
            });
        }
        const supabaseAdmin = createSupabaseServiceClient();
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('id', input.id)
            .single();
        if (error) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: error.message,
            });
        }
        return data;
    }),
    create: protectedProcedure
        .input(z.object({
        code: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        type: z.string(),
        value: z.number(),
        min_purchase: z.number().optional().nullable(),
        usage_limit: z.number().optional().nullable(),
        usage_count: z.number().optional().nullable(),
        per_user_limit: z.number().optional().nullable(),
        applicable_category: z.string().optional().nullable(),
        applicable_product_id: z.string().optional().nullable(),
        start_date: z.string().optional(),
        expiry_date: z.string().optional().nullable(),
        status: z.string().default('active'),
    }))
        .mutation(async ({ input }) => {
        if (!isSupabaseServiceConfigured) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Supabase configuration missing',
            });
        }
        const supabaseAdmin = createSupabaseServiceClient();
        const now = new Date().toISOString();
        const record = {
            code: input.code.toUpperCase(),
            title: input.title ?? input.code.toUpperCase(),
            description: input.description ?? null,
            type: input.type,
            value: input.value,
            min_purchase: input.min_purchase ?? null,
            usage_limit: input.usage_limit ?? null,
            usage_count: input.usage_count ?? 0,
            per_user_limit: input.per_user_limit ?? null,
            applicable_category: input.applicable_category ?? null,
            applicable_product_id: input.applicable_product_id ?? null,
            status: input.status,
            start_date: input.start_date || now,
            expiry_date: input.expiry_date || null,
            created_at: now,
            updated_at: now,
        };
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .insert(record)
            .select()
            .single();
        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
            });
        }
        return { coupon: data, message: 'Coupon created successfully' };
    }),
    update: protectedProcedure
        .input(z.object({
        id: z.string(),
        code: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        value: z.number().optional(),
        min_purchase: z.number().optional().nullable(),
        usage_limit: z.number().optional().nullable(),
        usage_count: z.number().optional().nullable(),
        per_user_limit: z.number().optional().nullable(),
        applicable_category: z.string().optional().nullable(),
        applicable_product_id: z.string().optional().nullable(),
        status: z.string().optional(),
        start_date: z.string().optional(),
        expiry_date: z.string().optional().nullable(),
    }))
        .mutation(async ({ input }) => {
        if (!isSupabaseServiceConfigured) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Supabase configuration missing',
            });
        }
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (input.code !== undefined)
            updateData.code = input.code.toUpperCase();
        if (input.title !== undefined)
            updateData.title = input.title;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.type !== undefined)
            updateData.type = input.type;
        if (input.value !== undefined)
            updateData.value = input.value;
        if (input.min_purchase !== undefined)
            updateData.min_purchase = input.min_purchase;
        if (input.usage_limit !== undefined)
            updateData.usage_limit = input.usage_limit;
        if (input.usage_count !== undefined)
            updateData.usage_count = input.usage_count;
        if (input.per_user_limit !== undefined)
            updateData.per_user_limit = input.per_user_limit;
        if (input.applicable_category !== undefined)
            updateData.applicable_category = input.applicable_category;
        if (input.applicable_product_id !== undefined)
            updateData.applicable_product_id = input.applicable_product_id;
        if (input.status !== undefined)
            updateData.status = input.status;
        if (input.start_date !== undefined)
            updateData.start_date = input.start_date;
        if (input.expiry_date !== undefined)
            updateData.expiry_date = input.expiry_date;
        const supabaseAdmin = createSupabaseServiceClient();
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .update(updateData)
            .eq('id', input.id)
            .select()
            .single();
        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
            });
        }
        return { coupon: data, message: 'Coupon updated successfully' };
    }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
        if (!isSupabaseServiceConfigured) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Supabase configuration missing',
            });
        }
        const supabaseAdmin = createSupabaseServiceClient();
        const { error } = await supabaseAdmin
            .from('coupons')
            .delete()
            .eq('id', input.id);
        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
            });
        }
        return { message: 'Coupon deleted successfully' };
    }),
});
