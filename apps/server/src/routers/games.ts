// HeartSync Server - Games Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import { router, coupleProcedure } from '../trpc';
import { TRUTH_OR_DARE_PROMPTS, WOULD_YOU_RATHER_PROMPTS, HEARTS_CONFIG } from '@heartsync/shared';

export const gamesRouter = router({
    // ============================================
    // Truth or Dare
    // ============================================

    // Get random prompt
    getTruthOrDare: coupleProcedure
        .input(z.object({
            type: z.enum(['truth', 'dare', 'random']),
            intensity: z.enum(['mild', 'medium', 'spicy', 'any']).default('any'),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            // Get custom prompts
            const customPrompts = await prisma.gameSession.findFirst({
                where: {
                    coupleId: user.coupleId,
                    gameType: 'truth_or_dare_custom',
                },
            });

            // Filter prompts
            let prompts = [...TRUTH_OR_DARE_PROMPTS];
            if (customPrompts?.state && Array.isArray((customPrompts.state as any).prompts)) {
                prompts.push(...(customPrompts.state as any).prompts);
            }

            const typeFilter = input.type === 'random'
                ? prompts
                : prompts.filter(p => p.type === input.type);

            const filtered = input.intensity === 'any'
                ? typeFilter
                : typeFilter.filter(p => p.intensity === input.intensity);

            if (filtered.length === 0) {
                throw new Error('No prompts available with those filters');
            }

            return filtered[Math.floor(Math.random() * filtered.length)];
        }),

    // ============================================
    // Would You Rather
    // ============================================

    // Get random WYR
    getWouldYouRather: coupleProcedure.query(async ({ ctx }) => {
        const { prisma, user } = ctx;

        // Get custom prompts
        const customPrompts = await prisma.gameSession.findFirst({
            where: {
                coupleId: user.coupleId,
                gameType: 'wyr_custom',
            },
        });

        let prompts = [...WOULD_YOU_RATHER_PROMPTS];
        if (customPrompts?.state && Array.isArray((customPrompts.state as any).prompts)) {
            prompts.push(...(customPrompts.state as any).prompts);
        }

        return prompts[Math.floor(Math.random() * prompts.length)];
    }),

    // Vote on WYR
    voteWouldYouRather: coupleProcedure
        .input(z.object({
            questionId: z.string(),
            choice: z.enum(['A', 'B']),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            // Find or create game session
            let session = await prisma.gameSession.findFirst({
                where: {
                    coupleId: user.coupleId,
                    gameType: 'wyr_votes',
                    isActive: true,
                },
            });

            const votes = (session?.state as any)?.votes || {};
            votes[input.questionId] = votes[input.questionId] || {};
            votes[input.questionId][user.id] = input.choice;

            if (session) {
                await prisma.gameSession.update({
                    where: { id: session.id },
                    data: { state: { votes } },
                });
            } else {
                await prisma.gameSession.create({
                    data: {
                        coupleId: user.coupleId,
                        gameType: 'wyr_votes',
                        state: { votes },
                    },
                });
            }

            return { success: true };
        }),

    // ============================================
    // Love Quiz
    // ============================================

    // Get quiz questions
    getQuizQuestions: coupleProcedure
        .input(z.object({
            category: z.enum(['memories', 'preferences', 'dreams', 'history', 'all']).default('all'),
        }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            return prisma.loveQuizQuestion.findMany({
                where: {
                    coupleId: user.coupleId,
                    ...(input.category !== 'all' ? { category: input.category } : {}),
                },
                orderBy: { createdAt: 'desc' },
            });
        }),

    // Add quiz question
    addQuizQuestion: coupleProcedure
        .input(z.object({
            question: z.string().min(1).max(300),
            category: z.enum(['memories', 'preferences', 'dreams', 'history']),
            answerEncrypted: z.string(),
            answerNonce: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            return prisma.loveQuizQuestion.create({
                data: {
                    coupleId: user.coupleId,
                    question: input.question,
                    category: input.category,
                    answerEncrypted: input.answerEncrypted,
                    answerNonce: input.answerNonce,
                    aboutUserId: user.id,
                },
            });
        }),

    // ============================================
    // Drawing Together
    // ============================================

    // Get drawings
    getDrawings: coupleProcedure
        .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
        .query(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            return prisma.drawing.findMany({
                where: { coupleId: user.coupleId },
                orderBy: { createdAt: 'desc' },
                take: input.limit,
            });
        }),

    // Save drawing
    saveDrawing: coupleProcedure
        .input(z.object({
            title: z.string().min(1).max(100),
            data: z.any(), // Canvas data
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            const drawing = await prisma.drawing.create({
                data: {
                    coupleId: user.coupleId,
                    title: input.title,
                    data: input.data,
                },
            });

            await prisma.$transaction(async (tx) => {
                await tx.couple.update({
                    where: { id: user.coupleId },
                    data: { hearts: { increment: HEARTS_CONFIG.gameCompleted } },
                });

                await tx.auditLogEntry.create({
                    data: {
                        coupleId: user.coupleId,
                        actorId: user.id,
                        action: 'game_played',
                        details: `Saved drawing: "${input.title}" (+${HEARTS_CONFIG.gameCompleted} hearts)`,
                    },
                });
            });

            return drawing;
        }),

    // Delete drawing
    deleteDrawing: coupleProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { prisma, user } = ctx;

            await prisma.drawing.deleteMany({
                where: {
                    id: input.id,
                    coupleId: user.coupleId,
                },
            });

            return { success: true };
        }),
});
