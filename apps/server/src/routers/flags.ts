// HeartSync Server - Flags Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import { router, coupleProcedure } from '../trpc';
import { sendFlagSchema, customFlagSchema } from '@heartsync/shared';
import { TRUST_CONFIG, HEARTS_CONFIG } from '@heartsync/shared';

export const flagsRouter = router({
    // Get all flags (paginated)
    list: coupleProcedure
        .input(z.object({
            cursor: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const flags = await prisma.flag.findMany({
                where: { coupleId: user.coupleId },
                orderBy: { createdAt: 'desc' },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    sender: {
                        select: { id: true, name: true, avatarEmojis: true },
                    },
                    customFlag: true,
                },
            });

            let nextCursor: string | undefined;
            if (flags.length > input.limit) {
                const nextItem = flags.pop();
                nextCursor = nextItem?.id;
            }

            return { flags, nextCursor };
        }),

    // Send a flag
    send: coupleProcedure
        .input(z.object({
            intensity: z.number().int().min(-5).max(5).refine(n => n !== 0),
            messageEncrypted: z.string().optional(),
            messageNonce: z.string().optional(),
            customFlagId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            // Create flag and update trust/hearts in transaction
            const result = await prisma.$transaction(async (tx) => {
                const flag = await tx.flag.create({
                    data: {
                        coupleId: user.coupleId,
                        senderId: user.id,
                        intensity: input.intensity,
                        messageEncrypted: input.messageEncrypted,
                        messageNonce: input.messageNonce,
                        customFlagId: input.customFlagId,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, avatarEmojis: true },
                        },
                        customFlag: true,
                    },
                });

                // Update couple's trust score and hearts
                const trustChange = input.intensity > 0
                    ? TRUST_CONFIG.positiveFlag(input.intensity)
                    : TRUST_CONFIG.negativeFlag(Math.abs(input.intensity));

                const heartsChange = input.intensity > 0 ? HEARTS_CONFIG.positiveFlag : 0;

                const couple = await tx.couple.findUnique({
                    where: { id: user.coupleId },
                });

                const newTrust = Math.max(0, Math.min(100,
                    (couple?.trustScore || 50) + (input.intensity > 0 ? trustChange : -trustChange)
                ));

                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: {
                        trustScore: newTrust,
                        hearts: { increment: heartsChange },
                    },
                });

                // Add audit log
                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'flag_sent',
                        details: `Sent ${input.intensity > 0 ? 'green' : 'red'} flag with intensity ${Math.abs(input.intensity)}`,
                    },
                });

                return { flag, trustChange: input.intensity > 0 ? trustChange : -trustChange };
            });

            return result;
        }),

    // Get custom flags
    getCustomFlags: coupleProcedure.query(async ({ ctx }) => {
        const { prisma, user } = ctx;

        return prisma.customFlag.findMany({
            where: { coupleId: user.coupleId },
            orderBy: { intensity: 'desc' },
        });
    }),

    // Create custom flag
    createCustomFlag: coupleProcedure
        .input(customFlagSchema)
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            // Check limit
            const count = await prisma.customFlag.count({
                where: { coupleId: user.coupleId },
            });

            if (count >= 20) {
                throw new Error('Maximum 20 custom flags allowed');
            }

            return prisma.customFlag.create({
                data: {
                    coupleId: user.coupleId,
                    intensity: input.intensity,
                    name: input.name,
                    icon: input.icon,
                    description: input.description,
                },
            });
        }),

    // Delete custom flag
    deleteCustomFlag: coupleProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            return prisma.customFlag.deleteMany({
                where: {
                    id: input.id,
                    coupleId: user.coupleId,
                },
            });
        }),
});
