// HeartSync 2.0 - Main Server
// Simple, fast, secure backend
// Made with 💕 for Precious & Safari

import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import webpush from 'web-push';
import dotenv from 'dotenv';
import database from './db.js';
import {
    hashPassword,
    verifyPassword,
    generateId,
    generateInviteCode,
    generateKeyPair,
    encryptSecretKey
} from '@heartsync/crypto';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001');
const JWT_SECRET = process.env.JWT_SECRET || 'heartsync-secret-change-in-production';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Web Push VAPID keys (generate once and save)
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails('mailto:heartsync@example.com', VAPID_PUBLIC, VAPID_PRIVATE);
}

// Initialize Fastify
const app = Fastify({ logger: true });

// CORS
await app.register(fastifyCors, {
    origin: CORS_ORIGIN,
    credentials: true,
});

// Socket.IO
const io = new SocketServer(app.server, {
    cors: { origin: CORS_ORIGIN, credentials: true },
});

// Track connected users
const connectedUsers = new Map<string, string>(); // socketId -> uniqueId
const userSockets = new Map<string, string>(); // uniqueId -> socketId

// ==============================
// AUTH ENDPOINTS
// ==============================

// Create a new couple (first user signup)
app.post('/api/auth/create-couple', async (request, reply) => {
    const { name, nickname, avatarEmojis, password } = request.body as any;

    if (!name || !password) {
        return reply.status(400).send({ error: 'Name and password required' });
    }

    try {
        const coupleId = generateId();
        const inviteCode = generateInviteCode();
        const uniqueId = generateId();

        // Generate encryption keys
        const { publicKey, secretKey } = generateKeyPair();
        const encryptedPrivateKey = encryptSecretKey(secretKey, password);
        const passwordHash = hashPassword(password);

        // Create couple
        database.createCouple.run(coupleId, inviteCode);

        // Create user
        database.createUser.run(
            uniqueId,
            coupleId,
            name,
            nickname || name,
            JSON.stringify(avatarEmojis || ['💕']),
            publicKey,
            JSON.stringify(encryptedPrivateKey),
            passwordHash
        );

        // Generate JWT
        const token = jwt.sign({ uniqueId, coupleId }, JWT_SECRET, { expiresIn: '7d' });

        reply.send({
            success: true,
            token,
            inviteCode,
            user: {
                id: uniqueId,
                name,
                nickname: nickname || name,
                avatarEmojis: avatarEmojis || ['💕'],
                publicKey,
                encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
            },
            couple: {
                id: coupleId,
                hearts: 0,
                trustScore: 50,
                streak: 0,
            },
        });
    } catch (error: any) {
        console.error('Create couple error:', error);
        reply.status(500).send({ error: error.message });
    }
});

// Join existing couple (second user)
app.post('/api/auth/join-couple', async (request, reply) => {
    const { inviteCode, name, nickname, avatarEmojis, password } = request.body as any;

    if (!inviteCode || !name || !password) {
        return reply.status(400).send({ error: 'Invite code, name, and password required' });
    }

    try {
        const couple = database.getCoupleByInvite.get(inviteCode) as any;
        if (!couple) {
            return reply.status(404).send({ error: 'Invalid invite code' });
        }

        // Check if couple already has 2 users
        const existingUsers = database.getUsersByCouple.all(couple.id);
        if (existingUsers.length >= 2) {
            return reply.status(400).send({ error: 'Couple already complete' });
        }

        const uniqueId = generateId();
        const { publicKey, secretKey } = generateKeyPair();
        const encryptedPrivateKey = encryptSecretKey(secretKey, password);
        const passwordHash = hashPassword(password);

        database.createUser.run(
            uniqueId,
            couple.id,
            name,
            nickname || name,
            JSON.stringify(avatarEmojis || ['💕']),
            publicKey,
            JSON.stringify(encryptedPrivateKey),
            passwordHash
        );

        const token = jwt.sign({ uniqueId, coupleId: couple.id }, JWT_SECRET, { expiresIn: '7d' });

        // Get partner
        const users = database.getUsersByCouple.all(couple.id) as any[];
        const partner = users.find(u => u.id !== uniqueId);

        reply.send({
            success: true,
            token,
            user: {
                id: uniqueId,
                name,
                nickname: nickname || name,
                avatarEmojis: avatarEmojis || ['💕'],
                publicKey,
                encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
            },
            partner: partner ? {
                id: partner.id,
                name: partner.name,
                nickname: partner.nickname,
                avatarEmojis: JSON.parse(partner.avatar_emojis || '["💕"]'),
                publicKey: partner.public_key,
            } : null,
            couple: {
                id: couple.id,
                hearts: couple.hearts,
                trustScore: couple.trust_score,
                streak: couple.streak,
            },
        });
    } catch (error: any) {
        console.error('Join couple error:', error);
        reply.status(500).send({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (request, reply) => {
    const { coupleCode, name, password } = request.body as any;

    if (!coupleCode || !name || !password) {
        return reply.status(400).send({ error: 'All fields required' });
    }

    try {
        const couple = database.getCoupleByInvite.get(coupleCode) as any;
        if (!couple) {
            return reply.status(404).send({ error: 'Couple not found' });
        }

        const user = database.getUserByNameAndCouple.get(name, couple.id) as any;
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        const validPassword = verifyPassword(password, user.password_hash);
        if (!validPassword) {
            return reply.status(401).send({ error: 'Invalid password' });
        }

        const token = jwt.sign({ uniqueId: user.id, coupleId: couple.id }, JWT_SECRET, { expiresIn: '7d' });

        // Get partner
        const users = database.getUsersByCouple.all(couple.id) as any[];
        const partner = users.find(u => u.id !== user.id);

        reply.send({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                nickname: user.nickname,
                avatarEmojis: JSON.parse(user.avatar_emojis || '["💕"]'),
                publicKey: user.public_key,
                encryptedPrivateKey: user.encrypted_private_key,
            },
            partner: partner ? {
                id: partner.id,
                name: partner.name,
                nickname: partner.nickname,
                avatarEmojis: JSON.parse(partner.avatar_emojis || '["💕"]'),
                publicKey: partner.public_key,
            } : null,
            couple: {
                id: couple.id,
                hearts: couple.hearts,
                trustScore: couple.trust_score,
                streak: couple.streak,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        reply.status(500).send({ error: error.message });
    }
});

// ==============================
// HEART TAP ENDPOINT
// ==============================

app.post('/api/hearts/tap', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const { count } = request.body as any;
        if (!count || count < 1) {
            return reply.status(400).send({ error: 'Invalid count' });
        }

        const user = database.getUserById.get(decoded.uniqueId) as any;
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        // Update couple hearts
        database.updateCoupleHearts.run(count, decoded.coupleId);

        // Log the tap
        const tapId = generateId();
        database.createHeartTap.run(tapId, decoded.coupleId, user.id, count);

        // Get updated couple
        const couple = database.getCoupleById.get(decoded.coupleId) as any;

        // Get partner for notification
        const users = database.getUsersByCouple.all(decoded.coupleId) as any[];
        const partner = users.find(u => u.id !== user.id);

        // Send real-time update to partner
        if (partner) {
            const partnerSocket = userSockets.get(partner.id);
            if (partnerSocket) {
                io.to(partnerSocket).emit('hearts:received', {
                    fromId: user.id,
                    fromName: user.nickname || user.name,
                    count,
                    newTotal: couple.hearts,
                });
            }

            // Send push notification
            const pushSub = database.getPushSubscription.get(partner.id) as any;
            if (pushSub && VAPID_PUBLIC) {
                try {
                    await webpush.sendNotification(
                        JSON.parse(pushSub.subscription),
                        JSON.stringify({
                            title: 'HeartSync 💕',
                            body: `${user.nickname || user.name} sent you ${count} heart${count > 1 ? 's' : ''}! ❤️`,
                            icon: '/icon-192.png',
                            data: { type: 'hearts', count },
                        })
                    );
                } catch (pushError) {
                    console.error('Push notification error:', pushError);
                }
            }
        }

        reply.send({
            success: true,
            newTotal: couple.hearts,
        });
    } catch (error: any) {
        console.error('Heart tap error:', error);
        reply.status(500).send({ error: error.message });
    }
});

// ==============================
// COUPLE DATA ENDPOINT
// ==============================

app.get('/api/couple', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const couple = database.getCoupleById.get(decoded.coupleId) as any;
        if (!couple) {
            return reply.status(404).send({ error: 'Couple not found' });
        }

        reply.send({
            id: couple.id,
            hearts: couple.hearts,
            trustScore: couple.trust_score,
            streak: couple.streak,
        });
    } catch (error: any) {
        reply.status(401).send({ error: 'Invalid token' });
    }
});

// ==============================
// SOCKET.IO HANDLERS
// ==============================

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Authenticate and register user
    socket.on('auth', async (data: { token: string }) => {
        try {
            const decoded = jwt.verify(data.token, JWT_SECRET) as any;
            connectedUsers.set(socket.id, decoded.uniqueId);
            userSockets.set(decoded.uniqueId, socket.id);

            // Join couple room
            socket.join(`couple:${decoded.coupleId}`);

            // Notify partner
            socket.to(`couple:${decoded.coupleId}`).emit('partner:online', {
                uniqueId: decoded.uniqueId,
            });

            socket.emit('auth:success');
            console.log('✅ User authenticated:', decoded.uniqueId);
        } catch (error) {
            socket.emit('auth:error', { message: 'Invalid token' });
        }
    });

    // Typing indicator
    socket.on('typing:start', (data: { coupleId: string }) => {
        socket.to(`couple:${data.coupleId}`).emit('typing:partner', { isTyping: true });
    });

    socket.on('typing:stop', (data: { coupleId: string }) => {
        socket.to(`couple:${data.coupleId}`).emit('typing:partner', { isTyping: false });
    });

    // Message sent
    socket.on('message:send', async (data: { coupleId: string; messageId: string; encryptedContent: string; nonce: string }) => {
        const uniqueId = connectedUsers.get(socket.id);
        if (!uniqueId) return;

        // Save to database
        database.createMessage.run(data.messageId, data.coupleId, uniqueId, data.encryptedContent, data.nonce);

        // Broadcast to partner
        socket.to(`couple:${data.coupleId}`).emit('message:received', {
            id: data.messageId,
            senderId: uniqueId,
            encryptedContent: data.encryptedContent,
            nonce: data.nonce,
            createdAt: new Date().toISOString(),
        });
    });

    // Beacon
    socket.on('beacon:send', (data: { coupleId: string; type: string }) => {
        const uniqueId = connectedUsers.get(socket.id);
        if (!uniqueId) return;

        socket.to(`couple:${data.coupleId}`).emit('beacon:received', {
            fromId: uniqueId,
            type: data.type,
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const uniqueId = connectedUsers.get(socket.id);
        if (uniqueId) {
            userSockets.delete(uniqueId);

            // Notify partner
            const user = database.getUserById.get(uniqueId) as any;
            if (user) {
                socket.to(`couple:${user.couple_id}`).emit('partner:offline', { uniqueId });
            }
        }
        connectedUsers.delete(socket.id);
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// ==============================
// HEALTH CHECK
// ==============================

app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// ==============================
// START SERVER
// ==============================

const start = async () => {
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   💕 HeartSync Server Running!                 ║
║                                                ║
║   HTTP: http://localhost:${PORT}                 ║
║   WebSocket: ws://localhost:${PORT}              ║
║                                                ║
║   Made with love for Precious & Safari 💕       ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();

export { app, io };
