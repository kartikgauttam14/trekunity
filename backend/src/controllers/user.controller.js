import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';

// GET /api/users/:id
export const getUserById = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true, name: true, email: true, avatarUrl: true, bio: true, role: true, createdAt: true,
            organizedTrips: {
                where: { status: { not: 'CANCELLED' } },
                select: { id: true, title: true, destination: true, startDate: true, coverImageUrl: true, status: true },
                orderBy: { startDate: 'desc' },
                take: 6,
            },
        },
    });

    if (!user) throw new AppError('User not found.', 404);
    res.json({ success: true, data: user });
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
    if (req.params.id !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You can only update your own profile.', 403);
    }

    const { name, bio, avatarUrl } = req.body;
    const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { name, bio, avatarUrl },
        select: { id: true, name: true, email: true, avatarUrl: true, bio: true, role: true },
    });

    res.json({ success: true, data: updated });
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    if (req.params.id !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('You can only delete your own account.', 403);
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Account deleted.' });
};

// GET /api/users/:id/trips — past & upcoming trips for a user
export const getUserTrips = async (req, res) => {
    const memberships = await prisma.tripMember.findMany({
        where: { userId: req.params.id, status: 'APPROVED' },
        include: {
            trip: {
                include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
            },
        },
        orderBy: { trip: { startDate: 'asc' } },
    });

    const trips = memberships.map((m) => m.trip);
    res.json({ success: true, data: trips });
};
