import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';

// POST /api/rentals/listings
export const createListing = async (req, res) => {
    const { vehicleId, pricePerDay, location, description, availableFrom, availableTo } = req.body;

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.ownerId !== req.user.id) throw new AppError('Only the vehicle owner can create a listing.', 403);

    const listing = await prisma.rentalListing.create({
        data: {
            vehicleId,
            hostId: req.user.id,
            pricePerDay: Number(pricePerDay),
            location,
            description,
            availableFrom: new Date(availableFrom),
            availableTo: new Date(availableTo),
        },
        include: { vehicle: true },
    });

    res.status(201).json({ success: true, data: listing });
};

// GET /api/rentals/listings
export const getListings = async (req, res) => {
    const { location, minPrice, maxPrice, type, startDate, endDate } = req.query;

    const where = { isActive: true };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minPrice || maxPrice) {
        where.pricePerDay = {};
        if (minPrice) where.pricePerDay.gte = Number(minPrice);
        if (maxPrice) where.pricePerDay.lte = Number(maxPrice);
    }
    if (type) {
        where.vehicle = { type: type.toUpperCase() };
    }
    if (startDate) {
        where.availableFrom = { lte: new Date(startDate) };
    }
    if (endDate) {
        where.availableTo = { gte: new Date(endDate) };
    }

    const listings = await prisma.rentalListing.findMany({
        where,
        include: {
            vehicle: true,
            host: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { pricePerDay: 'asc' },
    });

    res.json({ success: true, data: listings });
};

// GET /api/rentals/listings/:id
export const getListingById = async (req, res) => {
    const listing = await prisma.rentalListing.findUnique({
        where: { id: req.params.id },
        include: {
            vehicle: true,
            host: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        },
    });
    if (!listing) throw new AppError('Listing not found.', 404);
    res.json({ success: true, data: listing });
};

// POST /api/rentals/bookings
export const bookRental = async (req, res) => {
    const { listingId, startDate, endDate } = req.body;

    const listing = await prisma.rentalListing.findUnique({
        where: { id: listingId },
        include: { vehicle: true },
    });
    if (!listing) throw new AppError('Listing not found.', 404);
    if (!listing.isActive) throw new AppError('Listing is no longer active.', 400);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) throw new AppError('End date must be after start date.', 400);

    const totalPrice = listing.pricePerDay * days;

    const booking = await prisma.rentalBooking.create({
        data: {
            listingId,
            renterId: req.user.id,
            startDate: start,
            endDate: end,
            totalPrice,
            status: 'PENDING',
        },
    });

    // Notify host
    const io = req.app.get('io');
    io?.to(`user:${listing.hostId}`).emit('rental_booking_received', {
        bookingId: booking.id,
        listingTitle: `${listing.vehicle.make} ${listing.vehicle.model}`,
        renterName: req.user.name,
    });

    res.status(201).json({ success: true, data: booking });
};

// GET /api/rentals/bookings/my
export const getMyBookings = async (req, res) => {
    const bookings = await prisma.rentalBooking.findMany({
        where: { renterId: req.user.id },
        include: {
            listing: {
                include: { vehicle: true, host: { select: { name: true } } },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
};
