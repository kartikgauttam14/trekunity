import { Router } from 'express';
import {
    registerVehicle, getMyVehicles, getVehicleById, updateVehicle, deleteVehicle
} from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const vehicleRouter = Router();

vehicleRouter.post('/', authenticate, registerVehicle);
vehicleRouter.get('/my', authenticate, getMyVehicles);
vehicleRouter.get('/:id', authenticate, getVehicleById);
vehicleRouter.put('/:id', authenticate, updateVehicle);
vehicleRouter.delete('/:id', authenticate, deleteVehicle);
