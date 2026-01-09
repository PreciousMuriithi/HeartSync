// HeartSync Server - tRPC Adapter for Fastify
// Made with 💕 for Precious & Safari

import type { FastifyPluginCallback } from 'fastify';
import { fastifyRequestHandler } from '@trpc/server/adapters/fastify';
import type { AnyRouter } from '@trpc/server';

interface TRPCPluginOptions {
    prefix: string;
    trpcOptions: {
        router: AnyRouter;
        createContext: (opts: { req: any; res: any }) => any;
    };
}

export const fastifyTRPCPlugin: FastifyPluginCallback<TRPCPluginOptions> = (
    fastify,
    opts,
    done
) => {
    fastify.all(`${opts.prefix}/*`, async (req, reply) => {
        const path = (req.params as { '*': string })['*'];

        const response = await fastifyRequestHandler({
            router: opts.trpcOptions.router,
            createContext: () => opts.trpcOptions.createContext({ req, res: reply }),
            req,
            path,
        });

        return response;
    });

    done();
};
