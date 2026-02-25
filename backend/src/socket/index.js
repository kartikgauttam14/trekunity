import { prisma } from '../utils/prisma.js';

export const registerSocketHandlers = (io) => {
    // Authenticate socket connections via JWT in handshake auth
    io.use(async (socket, next) => {
        const userId = socket.handshake.auth?.userId;
        if (!userId) return next(new Error('Unauthenticated'));
        socket.userId = userId;
        next();
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

        // Join user-specific room for notifications
        socket.join(`user:${socket.userId}`);

        // Join a trip chat room
        socket.on('join_trip_room', (tripId) => {
            socket.join(`trip:${tripId}`);
            console.log(`User ${socket.userId} joined room trip:${tripId}`);
        });

        socket.on('leave_trip_room', (tripId) => {
            socket.leave(`trip:${tripId}`);
        });

        // Chat message
        socket.on('send_message', async ({ tripId, content }) => {
            if (!tripId || !content?.trim()) return;

            try {
                const message = await prisma.message.create({
                    data: { tripId, userId: socket.userId, content: content.trim() },
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                });

                io.to(`trip:${tripId}`).emit('new_message', message);
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message.' });
            }
        });

        // Typing indicator
        socket.on('typing', ({ tripId, isTyping }) => {
            socket.to(`trip:${tripId}`).emit('user_typing', {
                userId: socket.userId, isTyping,
            });
        });

        // Poll vote
        socket.on('vote', async ({ pollId, selectedOption, tripId }) => {
            try {
                await prisma.pollVote.upsert({
                    where: { pollId_userId: { pollId, userId: socket.userId } },
                    update: { selectedOption },
                    create: { pollId, userId: socket.userId, selectedOption },
                });

                const votes = await prisma.pollVote.findMany({ where: { pollId } });
                io.to(`trip:${tripId}`).emit('poll_updated', { pollId, votes });
            } catch (err) {
                socket.emit('error', { message: 'Failed to record vote.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
};
