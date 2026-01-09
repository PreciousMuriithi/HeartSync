// HeartSync Server - Socket.io Real-time Handlers
// Made with 💕 for Precious & Safari

import type { Server, Socket } from 'socket.io';
import type { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
    userId: string;
    coupleId: string;
}

interface SocketUser {
    id: string;
    coupleId: string;
    isTyping: boolean;
    lastSeen: Date;
}

// Track online users
const onlineUsers = new Map<string, SocketUser>();

export function setupSocketHandlers(io: Server, prisma: PrismaClient) {
    // Authentication middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback-secret'
            ) as { userId: string; coupleId: string };

            (socket as AuthenticatedSocket).userId = decoded.userId;
            (socket as AuthenticatedSocket).coupleId = decoded.coupleId;

            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const authSocket = socket as AuthenticatedSocket;
        const { userId, coupleId } = authSocket;

        console.log(`💕 User ${userId} connected to couple ${coupleId}`);

        // Join couple room
        socket.join(`couple:${coupleId}`);

        // Track user as online
        onlineUsers.set(userId, {
            id: userId,
            coupleId,
            isTyping: false,
            lastSeen: new Date(),
        });

        // Notify partner
        socket.to(`couple:${coupleId}`).emit('partner:online', { userId });

        // ============================================
        // Presence Events
        // ============================================

        socket.on('typing:start', () => {
            const user = onlineUsers.get(userId);
            if (user) {
                user.isTyping = true;
            }
            socket.to(`couple:${coupleId}`).emit('partner:typing', { userId, isTyping: true });
        });

        socket.on('typing:stop', () => {
            const user = onlineUsers.get(userId);
            if (user) {
                user.isTyping = false;
            }
            socket.to(`couple:${coupleId}`).emit('partner:typing', { userId, isTyping: false });
        });

        // ============================================
        // Message Events
        // ============================================

        socket.on('message:send', async (data) => {
            // Broadcast to partner
            socket.to(`couple:${coupleId}`).emit('message:new', {
                ...data,
                senderId: userId,
            });
        });

        socket.on('message:read', async (data) => {
            socket.to(`couple:${coupleId}`).emit('message:read', {
                messageIds: data.messageIds,
                readBy: userId,
            });
        });

        socket.on('message:reaction', async (data) => {
            socket.to(`couple:${coupleId}`).emit('message:reaction', {
                ...data,
                userId,
            });
        });

        socket.on('message:delete', async (data) => {
            socket.to(`couple:${coupleId}`).emit('message:deleted', data);
        });

        // ============================================
        // Flag & Letter Events
        // ============================================

        socket.on('flag:send', async (data) => {
            socket.to(`couple:${coupleId}`).emit('flag:new', {
                ...data,
                senderId: userId,
            });
        });

        socket.on('letter:send', async (data) => {
            socket.to(`couple:${coupleId}`).emit('letter:new', {
                ...data,
                senderId: userId,
            });
        });

        // ============================================
        // Beacon (Attention Request)
        // ============================================

        socket.on('beacon:send', async (data) => {
            socket.to(`couple:${coupleId}`).emit('beacon:received', {
                senderId: userId,
                message: data.message,
                urgency: data.urgency || 'normal',
            });
        });

        socket.on('beacon:respond', async (data) => {
            socket.to(`couple:${coupleId}`).emit('beacon:response', {
                responderId: userId,
                message: data.message,
            });
        });

        // ============================================
        // Games Events
        // ============================================

        socket.on('game:start', async (data) => {
            socket.to(`couple:${coupleId}`).emit('game:started', {
                gameType: data.gameType,
                startedBy: userId,
            });
        });

        socket.on('game:action', async (data) => {
            socket.to(`couple:${coupleId}`).emit('game:action', {
                ...data,
                userId,
            });
        });

        // Drawing canvas updates (throttled on client)
        socket.on('drawing:update', async (data) => {
            socket.to(`couple:${coupleId}`).emit('drawing:updated', {
                ...data,
                userId,
            });
        });

        // ============================================
        // Disconnect
        // ============================================

        socket.on('disconnect', () => {
            console.log(`💔 User ${userId} disconnected`);

            onlineUsers.delete(userId);

            socket.to(`couple:${coupleId}`).emit('partner:offline', {
                userId,
                lastSeen: new Date(),
            });
        });
    });

    // ============================================
    // Utility functions
    // ============================================

    return {
        // Get online status for a user
        isUserOnline: (userId: string) => onlineUsers.has(userId),

        // Get all online users for a couple
        getCouplePresence: (coupleId: string) => {
            const users: SocketUser[] = [];
            onlineUsers.forEach((user) => {
                if (user.coupleId === coupleId) {
                    users.push(user);
                }
            });
            return users;
        },

        // Send event to a specific couple
        emitToCouple: (coupleId: string, event: string, data: any) => {
            io.to(`couple:${coupleId}`).emit(event, data);
        },
    };
}
