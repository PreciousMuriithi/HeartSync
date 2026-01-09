// HeartSync Server - tRPC Router
// Made with 💕 for Precious & Safari

import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware that requires authentication
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        },
    });
});

// Middleware that requires being in a couple
const isInCouple = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (!ctx.user.coupleId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not in a couple' });
    }
    return next({
        ctx: {
            ...ctx,
            user: { ...ctx.user, coupleId: ctx.user.coupleId },
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const coupleProcedure = t.procedure.use(isInCouple);
