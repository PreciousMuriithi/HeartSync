// HeartSync Server - Memory & Calendar Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import { router, coupleProcedure } from '../trpc';
import { addMemorySchema, createEventSchema } from '@heartsync/shared';
import { HEARTS_CONFIG } from '@heartsync/shared';

export const memoryRouter = router({
    // ============================================
    // Memories
    // ============================================

    // Get memories (paginated)
    listMemories: coupleProcedure
        .input(z.object({
            cursor: z.string().optional(),
            limit: z.number().min(1).max(50).default(20),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const memories = await prisma.memory.findMany({
                where: { coupleId: user.coupleId },
                orderBy: { memoryDate: 'desc' },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    createdBy: {
                        select: { id: true, name: true, avatarEmojis: true },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (memories.length > input.limit) {
                const nextItem = memories.pop();
                nextCursor = nextItem?.id;
            }

            return { memories, nextCursor };
        }),

    // Get "On This Day" memories
    getOnThisDay: coupleProcedure.query(async ({ ctx }) => {
        const { prisma, user } = ctx;

        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Get memories from same day in previous years
        const memories = await prisma.$queryRaw`
      SELECT * FROM "Memory"
      WHERE "coupleId" = ${user.coupleId}
      AND EXTRACT(MONTH FROM "memoryDate") = ${month}
      AND EXTRACT(DAY FROM "memoryDate") = ${day}
      AND EXTRACT(YEAR FROM "memoryDate") < EXTRACT(YEAR FROM NOW())
      ORDER BY "memoryDate" DESC
    `;

        return memories;
    }),

    // Add memory
    addMemory: coupleProcedure
        .input(z.object({
            photoUrl: z.string(),
            captionEncrypted: z.string(),
            captionNonce: z.string(),
            memoryDate: z.coerce.date(),
            tags: z.array(z.string()).max(10).default([]),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const result = await prisma.$transaction(async (tx) => {
                const memory = await tx.memory.create({
                    data: {
                        coupleId: user.coupleId,
                        createdById: user.id,
                        photoUrl: input.photoUrl,
                        captionEncrypted: input.captionEncrypted,
                        captionNonce: input.captionNonce,
                        memoryDate: input.memoryDate,
                        tags: input.tags,
                    },
                });

                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: { hearts: { increment: HEARTS_CONFIG.memoryAdded } },
                });

                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'memory_added',
                        details: `Added a memory (+${HEARTS_CONFIG.memoryAdded} hearts)`,
                    },
                });

                return memory;
            });

            return result;
        }),

    // Delete memory
    deleteMemory: coupleProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            await prisma.memory.deleteMany({
                where: {
                    id: input.id,
                    coupleId: user.coupleId,
                },
            });

            return { success: true };
        }),

    // ============================================
    // Calendar Events
    // ============================================

    // Get events
    listEvents: coupleProcedure
        .input(z.object({
            startDate: z.coerce.date().optional(),
            endDate: z.coerce.date().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            return prisma.calendarEvent.findMany({
                where: {
                    coupleId: user.coupleId,
                    ...(input.startDate && input.endDate ? {
                        date: {
                            gte: input.startDate,
                            lte: input.endDate,
                        },
                    } : {}),
                },
                orderBy: { date: 'asc' },
            });
        }),

    // Get countdowns
    getCountdowns: coupleProcedure.query(async ({ ctx }) => {
        const { prisma, user } = ctx;

        return prisma.calendarEvent.findMany({
            where: {
                coupleId: user.coupleId,
                isCountdown: true,
                date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            take: 5,
        });
    }),

    // Create event
    createEvent: coupleProcedure
        .input(createEventSchema)
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const event = await prisma.calendarEvent.create({
                data: {
                    coupleId: user.coupleId,
                    title: input.title,
                    description: input.description,
                    date: input.date,
                    isRecurring: input.isRecurring,
                    recurringType: input.recurringType,
                    isCountdown: input.isCountdown,
                    color: input.color,
                },
            });

            await prisma.auditLogEntry.create({
                data: {
                    coupleId: user.coupleId,
                    actorId: user.id,
                    action: 'event_created',
                    details: `Created event: ${input.title}`,
                },
            });

            return event;
        }),

    // Update event
    updateEvent: coupleProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            date: z.coerce.date().optional(),
            isCountdown: z.boolean().optional(),
            color: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;
            const { id, ...data } = input;

            return prisma.calendarEvent.updateMany({
                where: {
                    id,
                    coupleId: user.coupleId,
                },
                data,
            });
        }),

    // Delete event
    deleteEvent: coupleProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            await prisma.calendarEvent.deleteMany({
                where: {
                    id: input.id,
                    coupleId: user.coupleId,
                },
            });

            return { success: true };
        }),
});
