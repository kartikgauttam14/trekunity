import { Router } from 'express';
import { register, login, logout, refreshAccessToken, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', authenticate, logout);
authRouter.post('/refresh', refreshAccessToken);
authRouter.get('/me', authenticate, getMe);
