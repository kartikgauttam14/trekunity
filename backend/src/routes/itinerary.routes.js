import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const itineraryRouter = Router();

// GET /api/trips/:id/itinerary
itineraryRouter.get('/:id/itinerary', async (req, res) => {
    const items = await prisma.itineraryItem.findMany({
        where: { tripId: req.params.id },
        orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }],
    });
    res.json({ success: true, data: items });
});

// POST /api/trips/:id/itinerary
itineraryRouter.post('/:id/itinerary', authenticate, async (req, res) => {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.organizerId !== req.user.id) throw new AppError('Only the organizer can edit the itinerary.', 403);

    const item = await prisma.itineraryItem.create({
        data: { tripId: req.params.id, ...req.body },
    });
    res.status(201).json({ success: true, data: item });
});

// PUT /api/trips/:id/itinerary/:itemId
itineraryRouter.put('/:id/itinerary/:itemId', authenticate, async (req, res) => {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.organizerId !== req.user.id) throw new AppError('Only the organizer can edit the itinerary.', 403);

    const item = await prisma.itineraryItem.update({
        where: { id: req.params.itemId },
        data: req.body,
    });
    res.json({ success: true, data: item });
});

// DELETE /api/trips/:id/itinerary/:itemId
itineraryRouter.delete('/:id/itinerary/:itemId', authenticate, async (req, res) => {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.organizerId !== req.user.id) throw new AppError('Only the organizer can edit the itinerary.', 403);

    await prisma.itineraryItem.delete({ where: { id: req.params.itemId } });
    res.json({ success: true, message: 'Item removed.' });
});
