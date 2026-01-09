// HeartSync Server - Letters Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import { router, coupleProcedure } from '../trpc';
import { sendLetterSchema } from '@heartsync/shared';
import { HEARTS_CONFIG, TRUST_CONFIG } from '@heartsync/shared';

export const lettersRouter = router({
    // Get all letters (paginated)
    list: coupleProcedure
        .input(z.object({
            cursor: z.string().optional(),
            limit: z.number().min(1).max(50).default(20),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const letters = await prisma.loveLetter.findMany({
                where: { coupleId: user.coupleId },
                orderBy: { createdAt: 'desc' },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    sender: {
                        select: { id: true, name: true, avatarEmojis: true },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (letters.length > input.limit) {
                const nextItem = letters.pop();
                nextCursor = nextItem?.id;
            }

            return { letters, nextCursor };
        }),

    // Send a love letter
    send: coupleProcedure
        .input(z.object({
            titleEncrypted: z.string(),
            titleNonce: z.string(),
            contentEncrypted: z.string(),
            contentNonce: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const result = await prisma.$transaction(async (tx) => {
                const letter = await tx.loveLetter.create({
                    data: {
                        coupleId: user.coupleId,
                        senderId: user.id,
                        titleEncrypted: input.titleEncrypted,
                        titleNonce: input.titleNonce,
                        contentEncrypted: input.contentEncrypted,
                        contentNonce: input.contentNonce,
                        heartsRewarded: HEARTS_CONFIG.letterSent,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, avatarEmojis: true },
                        },
                    },
                });

                // Award hearts and trust for sending letter
                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: {
                        hearts: { increment: HEARTS_CONFIG.letterSent },
                        trustScore: { increment: TRUST_CONFIG.letterSent },
                    },
                });

                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'letter_sent',
                        details: `Sent a love letter (+${HEARTS_CONFIG.letterSent} hearts)`,
                    },
                });

                return letter;
            });

            return result;
        }),

    // Mark letter as read
    markRead: coupleProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const letter = await prisma.loveLetter.findFirst({
                where: {
                    id: input.id,
                    coupleId: user.coupleId,
                    senderId: { not: user.id },
                    isRead: false,
                },
            });

            if (!letter) {
                throw new Error('Letter not found or already read');
            }

            await prisma.$transaction(async (tx) => {
                await tx.loveLetter.update({
                    where: { id: input.id },
                    data: { isRead: true },
                });

                // Award hearts for reading
                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: { hearts: { increment: HEARTS_CONFIG.letterRead } },
                });
            });

            return { success: true };
        }),
});
