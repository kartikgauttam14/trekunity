import { Router } from 'express';
import { getUserById, updateUser, deleteUser, getUserTrips } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/:id', getUserById);
userRouter.get('/:id/trips', getUserTrips);
userRouter.put('/:id', authenticate, updateUser);
userRouter.delete('/:id', authenticate, deleteUser);
