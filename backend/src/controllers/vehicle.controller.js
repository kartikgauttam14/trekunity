import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';

// POST /api/vehicles
export const registerVehicle = async (req, res) => {
    const { make, model, year, type, licensePlate, seats, fuelType, transmission, images, rcUrl } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { licensePlate } });
    if (existing) throw new AppError('A vehicle with this license plate already exists.', 400);

    const vehicle = await prisma.vehicle.create({
        data: {
            ownerId: req.user.id,
            make,
            model,
            year: Number(year),
            type: type || 'CAR',
            licensePlate,
            seats: Number(seats),
            fuelType,
            transmission,
            images: images || [],
            rcUrl,
        },
    });

    res.status(201).json({ success: true, data: vehicle });
};

// GET /api/vehicles/my
export const getMyVehicles = async (req, res) => {
    const vehicles = await prisma.vehicle.findMany({
        where: { ownerId: req.user.id },
        include: { _count: { select: { listings: true } } },
    });
    res.json({ success: true, data: vehicles });
};

// GET /api/vehicles/:id
export const getVehicleById = async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({
        where: { id: req.params.id },
        include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
    });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    res.json({ success: true, data: vehicle });
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('Only the owner can update this vehicle.', 403);
    }

    const updated = await prisma.vehicle.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json({ success: true, data: updated });
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);
    if (vehicle.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new AppError('Only the owner can delete this vehicle.', 403);
    }

    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Vehicle deleted.' });
};
