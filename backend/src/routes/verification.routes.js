import { Router } from 'express';
import { submitVerification, getVerificationStatus, acceptPolicy } from '../controllers/verification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const verificationRouter = Router();

verificationRouter.post('/submit', authenticate, submitVerification);
verificationRouter.get('/status', authenticate, getVerificationStatus);
verificationRouter.post('/policies/accept', authenticate, acceptPolicy);
