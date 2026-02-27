import { Router } from 'express';
import {
    createListing, getListings, getListingById, bookRental, getMyBookings
} from '../controllers/rental.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const rentalRouter = Router();

rentalRouter.post('/listings', authenticate, createListing);
rentalRouter.get('/listings', getListings);
rentalRouter.get('/listings/:id', getListingById);
rentalRouter.post('/bookings', authenticate, bookRental);
rentalRouter.get('/bookings/my', authenticate, getMyBookings);
