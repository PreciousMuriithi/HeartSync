// HeartSync Server - Couple Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import { router, coupleProcedure } from '../trpc';
import { HEARTS_CONFIG, TRUST_STORE_ITEMS } from '@heartsync/shared';

export const coupleRouter = router({
    // Get couple stats
    getStats: coupleProcedure.query(async ({ ctx }) => {
        const { prisma, user } = ctx;

        const couple = await prisma.couple.findUnique({
            where: { id: user.coupleId },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        nickname: true,
                        avatarEmojis: true,
                        publicKey: true,
                    },
                },
            },
        });

        if (!couple) {
            throw new Error('Couple not found');
        }

        return {
            id: couple.id,
            hearts: couple.hearts,
            trustScore: couple.trustScore,
            streak: couple.streak,
            streakStartDate: couple.streakStartDate,
            lastCheckIn: couple.lastCheckIn,
            users: couple.users,
        };
    }),

    // Daily check-in
    checkIn: coupleProcedure
        .input(z.object({
            mood: z.string().max(10), // Emoji
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const result = await prisma.$transaction(async (tx) => {
                const couple = await tx.couple.findUnique({
                    where: { id: user.coupleId },
                });

                if (!couple) throw new Error('Couple not found');

                const now = new Date();
                const lastCheckIn = couple.lastCheckIn;

                // Calculate streak
                let newStreak = couple.streak;
                let streakStartDate = couple.streakStartDate;

                if (lastCheckIn) {
                    const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);

                    if (hoursSinceLastCheckIn < 24) {
                        // Already checked in today, no streak change
                    } else if (hoursSinceLastCheckIn < 48) {
                        // Valid streak continuation
                        newStreak += 1;
                    } else {
                        // Streak broken
                        newStreak = 1;
                        streakStartDate = now;
                    }
                } else {
                    newStreak = 1;
                    streakStartDate = now;
                }

                // Calculate bonus hearts for streak
                const streakBonus = HEARTS_CONFIG.streakBonus(newStreak);
                const heartsEarned = HEARTS_CONFIG.dailyCheckIn + streakBonus;

                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: {
                        lastCheckIn: now,
                        streak: newStreak,
                        streakStartDate,
                        hearts: { increment: heartsEarned },
                        trustScore: { increment: TRUST_CONFIG.dailyCheckIn },
                    },
                });

                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'hearts_earned',
                        details: `Daily check-in with ${input.mood} (+${heartsEarned} hearts, streak: ${newStreak})`,
                    },
                });

                return { streak: newStreak, heartsEarned };
            });

            return result;
        }),

    // Trust Store - list available items
    getTrustStoreItems: coupleProcedure.query(() => {
        return TRUST_STORE_ITEMS;
    }),

    // Trust Store - purchase item
    purchaseItem: coupleProcedure
        .input(z.object({ itemId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const item = TRUST_STORE_ITEMS.find(i => i.id === input.itemId);
            if (!item) {
                throw new Error('Item not found');
            }

            const result = await prisma.$transaction(async (tx) => {
                const couple = await tx.couple.findUnique({
                    where: { id: user.coupleId },
                });

                if (!couple) throw new Error('Couple not found');

                if (couple.hearts < item.cost) {
                    throw new Error('Not enough hearts');
                }

                // Deduct hearts
                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: { hearts: { decrement: item.cost } },
                });

                // Create purchase record
                const purchase = await tx.trustStorePurchase.create({
                    data: {
                        coupleId: user.coupleId,
                        buyerId: user.id,
                        itemId: input.itemId,
                        cost: item.cost,
                    },
                });

                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'trust_store_purchase',
                        details: `Purchased "${item.name}" for ${item.cost} hearts`,
                    },
                });

                return { purchase, remainingHearts: couple.hearts - item.cost };
            });

            return result;
        }),

    // Trust Store - redeem purchased item
    redeemItem: coupleProcedure
        .input(z.object({ purchaseId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const purchase = await prisma.trustStorePurchase.findFirst({
                where: {
                    id: input.purchaseId,
                    coupleId: user.coupleId,
                    isRedeemed: false,
                },
            });

            if (!purchase) {
                throw new Error('Purchase not found or already redeemed');
            }

            await prisma.$transaction(async (tx) => {
                await tx.trustStorePurchase.update({
                    where: { id: input.purchaseId },
                    data: {
                        isRedeemed: true,
                        redeemedAt: new Date(),
                    },
                });

                const item = TRUST_STORE_ITEMS.find(i => i.id === purchase.itemId);

                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'trust_store_redeem',
                        details: `Redeemed "${item?.name || purchase.itemId}"`,
                    },
                });
            });

            return { success: true };
        }),

    // Get purchases
    getPurchases: coupleProcedure
        .input(z.object({ onlyUnredeemed: z.boolean().default(false) }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            return prisma.trustStorePurchase.findMany({
                where: {
                    coupleId: user.coupleId,
                    ...(input.onlyUnredeemed ? { isRedeemed: false } : {}),
                },
                orderBy: { purchasedAt: 'desc' },
                include: {
                    buyer: {
                        select: { id: true, name: true, avatarEmojis: true },
                    },
                },
            });
        }),

    // Get audit log
    getAuditLog: coupleProcedure
        .input(z.object({
            cursor: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const entries = await prisma.auditLogEntry.findMany({
                where: { coupleId: user.coupleId },
                orderBy: { createdAt: 'desc' },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    actor: {
                        select: { id: true, name: true, avatarEmojis: true },
                    },
                },
            });

            let nextCursor: string | undefined;
            if (entries.length > input.limit) {
                const nextItem = entries.pop();
                nextCursor = nextItem?.id;
            }

            return { entries, nextCursor };
        }),
});

// Import for hearts config
import { TRUST_CONFIG } from '@heartsync/shared';
