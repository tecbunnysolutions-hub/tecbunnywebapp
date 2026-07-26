import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { logger } from '@tecbunny/core';

// We mock the service call here for the proof of concept. 
// In a real migration, we would import PageContentService from '@tecbunny/core'.
export const pageContentRouter = router({
  get: publicProcedure
    .input(z.object({ key: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      try {
        // Instead of manual fetch to /api/page-content, we call the DB directly here
        // But for our POC, we will just simulate a fetch or use the DB client
        const key = input?.key || 'home';
        logger.info('rpc_page_content.audit.get', { key });

        // Since we don't have the PageContentService imported right now in this POC,
        // we'll just return a mock response that matches what the frontend expects to prove typing works
        return {
          id: "mock-id",
          page_key: key,
          title: "Welcome",
          content: { title: "Welcome", sections: [] },
          seo_metadata: {},
          is_published: true,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } catch (error) {
        logger.error('rpc_page_content.audit.get_failed', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    }),
  update: protectedProcedure
    .input(z.object({
      pageKey: z.string(),
      title: z.string().optional(),
      content: z.any().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('rpc_page_content.audit.update', { pageKey: input.pageKey });
        // Mock update
        return {
          id: "mock-id",
          page_key: input.pageKey,
          title: input.title || 'Updated Title',
          content: input.content,
          meta_description: input.metaDescription,
          meta_keywords: input.metaKeywords,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } catch (error) {
        logger.error('rpc_page_content.audit.update_failed', { error: error instanceof Error ? error.message : String(error), pageKey: input.pageKey });
        throw error;
      }
    }),
  list_all: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        logger.info('rpc_page_content.audit.list_all');
        // Mock list all
        return [];
      } catch (error) {
        logger.error('rpc_page_content.audit.list_all_failed', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    }),
});
