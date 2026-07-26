import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@tecbunny/rpc';
import { logger } from '@tecbunny/core';

const handler = async (req: Request) => {
  try {
    logger.info('trpc_adapter.audit.requested', { method: req.method });
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext,
    });
  } catch (error) {
    logger.error('trpc_adapter.audit.failed', { error: error instanceof Error ? error.message : String(error), method: req.method });
    return new Response(JSON.stringify({ error: 'TRPC request failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export { handler as GET, handler as POST };
