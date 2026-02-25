import { Router } from 'express';
import {
    getTrips, getTripById, createTrip, updateTrip, deleteTrip,
    requestToJoin, updateMemberStatus,
} from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const tripRouter = Router();

tripRouter.get('/', getTrips);
tripRouter.get('/:id', getTripById);
tripRouter.post('/', authenticate, createTrip);
tripRouter.put('/:id', authenticate, updateTrip);
tripRouter.delete('/:id', authenticate, deleteTrip);
tripRouter.post('/:id/join', authenticate, requestToJoin);
tripRouter.put('/:id/members/:userId', authenticate, updateMemberStatus);
