import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getAdminDb } from '@tecbunny/core/db';
import { TRPCError } from '@trpc/server';
import { logger } from '@tecbunny/core';

export const projectsRouter = router({
  getAll: publicProcedure
    .query(async () => {
      try {
        logger.info('rpc_projects.audit.get_all_requested');
        const db = getAdminDb();
        const { data, error } = await db.from('upcoming_projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42P01') {
            return [];
          }
          logger.error('rpc_projects.audit.get_all_failed', { error: error.message });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        logger.info('rpc_projects.audit.get_all_success', { count: data?.length ?? 0 });
        return data || [];
      } catch (err) {
        logger.error('rpc_projects.audit.get_all_unhandled', { error: err instanceof Error ? err.message : String(err) });
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' });
      }
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      explanation: z.string(),
      target_amount: z.number(),
      amount_raised: z.number().optional(),
      motive: z.string(),
      detailed_information: z.string(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      logger.info('rpc_projects.audit.create_requested', { name: input.name });
      if (ctx.role !== 'superadmin') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      try {
        const db = getAdminDb();
        const insertData = {
          ...input,
          amount_raised: input.amount_raised ?? 0,
          status: input.status || 'Pipeline',
        };

        const { data, error } = await db.from('upcoming_projects')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          logger.error('rpc_projects.audit.create_failed', { error: error.message });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        logger.info('rpc_projects.audit.create_success', { id: data?.id ?? null });
        return data;
      } catch (err) {
        logger.error('rpc_projects.audit.create_unhandled', { error: err instanceof Error ? err.message : String(err) });
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      logger.info('rpc_projects.audit.delete_requested', { id: input.id });
      if (ctx.role !== 'superadmin') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      try {
        const db = getAdminDb();
        const { error } = await db.from('upcoming_projects')
          .delete()
          .eq('id', input.id);
        
        if (error) {
          logger.error('rpc_projects.audit.delete_failed', { id: input.id, error: error.message });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        logger.info('rpc_projects.audit.delete_success', { id: input.id });
        return { success: true };
      } catch (err) {
        logger.error('rpc_projects.audit.delete_unhandled', { error: err instanceof Error ? err.message : String(err) });
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' });
      }
    }),
});
