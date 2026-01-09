// HeartSync Server - Auth Router
// Made with 💕 for Precious & Safari

import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
    generateKeyPair,
    encryptSecretKey,
    hashPassword,
    verifyPassword,
    generateInviteCode
} from '@heartsync/crypto';
import { signupSchema, loginSchema, joinCoupleSchema } from '@heartsync/shared';

export const authRouter = router({
    // Create a new couple (first user)
    createCouple: publicProcedure
        .input(signupSchema)
        .mutation(async ({ ctx, input }) => {
            const { prisma } = ctx;

            // Generate encryption keys
            const keyPair = generateKeyPair();
            const encryptedSecretKey = encryptSecretKey(keyPair.secretKey, input.password);
            const passwordHash = hashPassword(input.password);
            const inviteCode = generateInviteCode();

            // Create couple and user in transaction
            const result = await prisma.$transaction(async (tx) => {
                const couple = await tx.couple.create({
                    data: {
                        inviteCode,
                        hearts: 0,
                        trustScore: 50,
                        streak: 0,
                    },
                });

                const user = await tx.user.create({
                    data: {
                        name: input.name,
                        nickname: input.nickname,
                        avatarEmojis: input.avatarEmojis,
                        passwordHash,
                        publicKey: keyPair.publicKey,
                        privateKeyEncrypted: encryptedSecretKey.ciphertext,
                        privateKeyNonce: encryptedSecretKey.nonce,
                        coupleId: couple.id,
                        isUser1: true,
                    },
                });

                return { couple, user };
            });

            // Generate JWT
            const token = jwt.sign(
                { userId: result.user.id, coupleId: result.couple.id },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return {
                token,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    nickname: result.user.nickname,
                    avatarEmojis: result.user.avatarEmojis,
                    publicKey: result.user.publicKey,
                },
                couple: {
                    id: result.couple.id,
                    inviteCode: result.couple.inviteCode,
                },
                privateKey: keyPair.secretKey, // Client stores this encrypted
            };
        }),

    // Join existing couple (second user)
    joinCouple: publicProcedure
        .input(joinCoupleSchema)
        .mutation(async ({ ctx, input }) => {
            const { prisma } = ctx;

            // Find couple by invite code
            const couple = await prisma.couple.findUnique({
                where: { inviteCode: input.inviteCode },
                include: { users: true },
            });

            if (!couple) {
                throw new Error('Invalid invite code');
            }

            if (couple.users.length >= 2) {
                throw new Error('This couple already has two members');
            }

            // Generate encryption keys
            const keyPair = generateKeyPair();
            const encryptedSecretKey = encryptSecretKey(keyPair.secretKey, input.password);
            const passwordHash = hashPassword(input.password);

            // Create second user
            const user = await prisma.user.create({
                data: {
                    name: input.name,
                    nickname: input.nickname,
                    avatarEmojis: input.avatarEmojis,
                    passwordHash,
                    publicKey: keyPair.publicKey,
                    privateKeyEncrypted: encryptedSecretKey.ciphertext,
                    privateKeyNonce: encryptedSecretKey.nonce,
                    coupleId: couple.id,
                    isUser1: false,
                },
            });

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, coupleId: couple.id },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Get partner info
            const partner = couple.users[0];

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    nickname: user.nickname,
                    avatarEmojis: user.avatarEmojis,
                    publicKey: user.publicKey,
                },
                partner: {
                    id: partner.id,
                    name: partner.name,
                    nickname: partner.nickname,
                    avatarEmojis: partner.avatarEmojis,
                    publicKey: partner.publicKey,
                },
                couple: {
                    id: couple.id,
                },
                privateKey: keyPair.secretKey,
            };
        }),

    // Login
    login: publicProcedure
        .input(z.object({
            coupleCode: z.string(),
            name: z.string(),
            password: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { prisma } = ctx;

            // Find couple
            const couple = await prisma.couple.findUnique({
                where: { inviteCode: input.coupleCode },
                include: { users: true },
            });

            if (!couple) {
                throw new Error('Invalid couple code');
            }

            // Find user in couple
            const user = couple.users.find(
                u => u.name.toLowerCase() === input.name.toLowerCase()
            );

            if (!user) {
                throw new Error('User not found in this couple');
            }

            // Verify password
            if (!verifyPassword(input.password, user.passwordHash)) {
                throw new Error('Invalid password');
            }

            // Get partner
            const partner = couple.users.find(u => u.id !== user.id);

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, coupleId: couple.id },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    nickname: user.nickname,
                    avatarEmojis: user.avatarEmojis,
                    publicKey: user.publicKey,
                    privateKeyEncrypted: user.privateKeyEncrypted,
                    privateKeyNonce: user.privateKeyNonce,
                },
                partner: partner ? {
                    id: partner.id,
                    name: partner.name,
                    nickname: partner.nickname,
                    avatarEmojis: partner.avatarEmojis,
                    publicKey: partner.publicKey,
                } : null,
                couple: {
                    id: couple.id,
                    hearts: couple.hearts,
                    trustScore: couple.trustScore,
                    streak: couple.streak,
                },
            };
        }),

    // Get current user
    me: protectedProcedure.query(async ({ ctx }) => {
        const { prisma, user } = ctx;

        const dbUser = await prisma.user.findUnique({
            where: { id: user!.id },
            include: {
                couple: {
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
                },
            },
        });

        if (!dbUser) {
            throw new Error('User not found');
        }

        const partner = dbUser.couple?.users.find(u => u.id !== dbUser.id);

        return {
            user: {
                id: dbUser.id,
                name: dbUser.name,
                nickname: dbUser.nickname,
                avatarEmojis: dbUser.avatarEmojis,
                publicKey: dbUser.publicKey,
            },
            partner: partner || null,
            couple: dbUser.couple ? {
                id: dbUser.couple.id,
                inviteCode: dbUser.couple.inviteCode,
                hearts: dbUser.couple.hearts,
                trustScore: dbUser.couple.trustScore,
                streak: dbUser.couple.streak,
            } : null,
        };
    }),
});
