// HeartSync Server - Messages Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import { router, coupleProcedure } from '../trpc';
import { sendMessageSchema, reactionSchema } from '@heartsync/shared';

export const messagesRouter = router({
    // Get messages (paginated)
    list: coupleProcedure
        .input(z.object({
            cursor: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const messages = await prisma.message.findMany({
                where: {
                    coupleId: user.coupleId,
                    OR: [
                        { isDeletedForBoth: false },
                        { senderId: user.id, isDeletedBySender: false },
                    ],
                },
                orderBy: { createdAt: 'desc' },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    reactions: true,
                    replyTo: {
                        select: {
                            id: true,
                            senderId: true,
                            contentEncrypted: true,
                            contentNonce: true,
                            type: true,
                        },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (messages.length > input.limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.id;
            }

            return {
                messages: messages.reverse(),
                nextCursor,
            };
        }),

    // Send a message
    send: coupleProcedure
        .input(z.object({
            contentEncrypted: z.string(),
            contentNonce: z.string(),
            type: z.enum(['text', 'emoji', 'sticker', 'voice', 'image']).default('text'),
            replyToId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const message = await prisma.message.create({
                data: {
                    coupleId: user.coupleId,
                    senderId: user.id,
                    contentEncrypted: input.contentEncrypted,
                    contentNonce: input.contentNonce,
                    type: input.type,
                    replyToId: input.replyToId,
                },
                include: {
                    reactions: true,
                    replyTo: {
                        select: {
                            id: true,
                            senderId: true,
                            contentEncrypted: true,
                            contentNonce: true,
                            type: true,
                        },
                    },
                },
            });

            return message;
        }),

    // Mark messages as read
    markRead: coupleProcedure
        .input(z.object({
            messageIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            await prisma.message.updateMany({
                where: {
                    id: { in: input.messageIds },
                    coupleId: user.coupleId,
                    senderId: { not: user.id }, // Can't mark own messages as read
                },
                data: { isRead: true },
            });

            return { success: true };
        }),

    // Add reaction to message
    addReaction: coupleProcedure
        .input(z.object({
            messageId: z.string(),
            emoji: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            // Verify message belongs to couple
            const message = await prisma.message.findFirst({
                where: {
                    id: input.messageId,
                    coupleId: user.coupleId,
                },
            });

            if (!message) {
                throw new Error('Message not found');
            }

            const reaction = await prisma.reaction.upsert({
                where: {
                    messageId_userId_emoji: {
                        messageId: input.messageId,
                        userId: user.id,
                        emoji: input.emoji,
                    },
                },
                create: {
                    messageId: input.messageId,
                    userId: user.id,
                    emoji: input.emoji,
                },
                update: {},
            });

            return reaction;
        }),

    // Remove reaction
    removeReaction: coupleProcedure
        .input(z.object({
            messageId: z.string(),
            emoji: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            await prisma.reaction.deleteMany({
                where: {
                    messageId: input.messageId,
                    userId: user.id,
                    emoji: input.emoji,
                },
            });

            return { success: true };
        }),

    // Delete message
    delete: coupleProcedure
        .input(z.object({
            messageId: z.string(),
            forBoth: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const message = await prisma.message.findFirst({
                where: {
                    id: input.messageId,
                    coupleId: user.coupleId,
                },
            });

            if (!message) {
                throw new Error('Message not found');
            }

            if (message.senderId !== user.id && input.forBoth) {
                throw new Error('Can only delete for both if you sent the message');
            }

            if (input.forBoth) {
                await prisma.message.update({
                    where: { id: input.messageId },
                    data: { isDeletedForBoth: true },
                });
            } else if (message.senderId === user.id) {
                await prisma.message.update({
                    where: { id: input.messageId },
                    data: { isDeletedBySender: true },
                });
            }

            return { success: true };
        }),
});
