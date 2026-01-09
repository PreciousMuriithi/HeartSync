// HeartSync Server - Context
// Made with 💕 for Precious & Safari

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export interface ContextUser {
    id: string;
    coupleId: string | null;
}

export interface Context {
    req: FastifyRequest;
    res: FastifyReply;
    prisma: PrismaClient;
    user: ContextUser | null;
}

interface CreateContextOptions {
    req: FastifyRequest;
    res: FastifyReply;
    prisma: PrismaClient;
}

export async function createContext({ req, res, prisma }: CreateContextOptions): Promise<Context> {
    let user: ContextUser | null = null;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback-secret'
            ) as { userId: string; coupleId: string | null };

            // Verify user still exists
            const dbUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, coupleId: true },
            });

            if (dbUser) {
                user = {
                    id: dbUser.id,
                    coupleId: dbUser.coupleId,
                };
            }
        } catch {
            // Invalid token, user stays null
        }
    }

    return { req, res, prisma, user };
}

// Helper to require auth
export function requireAuth(ctx: Context): asserts ctx is Context & { user: ContextUser } {
    if (!ctx.user) {
        throw new Error('Not authenticated');
    }
}

// Helper to require couple
export function requireCouple(ctx: Context): asserts ctx is Context & { user: ContextUser & { coupleId: string } } {
    requireAuth(ctx);
    if (!ctx.user.coupleId) {
        throw new Error('Not in a couple');
    }
}
