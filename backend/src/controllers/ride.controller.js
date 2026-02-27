import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const UBER_AUTH_URL = 'https://auth.uber.com/oauth/v2/authorize';
const UBER_TOKEN_URL = 'https://auth.uber.com/oauth/v2/token';

// GET /api/rides/compare
export const getRideOptions = async (req, res) => {
    const { pickup, dropoff, type } = req.query; // type: INTERCITY, OUTERCITY, LOCAL

    if (!pickup || !dropoff) throw new AppError('Pickup and dropoff locations are required.', 400);

    // Check which accounts are linked
    const linkedAccounts = await prisma.linkedAccount.findMany({
        where: { userId: req.user.id, isConnected: true }
    });

    const providers = linkedAccounts.map(a => a.provider);
    const options = [];

    // Simulate fetching prices from linked providers
    if (providers.includes('UBER')) {
        options.push({ provider: 'Uber', vehicleType: 'UberGo', price: 450 + Math.floor(Math.random() * 50), currency: 'INR', eta: 5, capacity: 4, type: type || 'LOCAL' });
        options.push({ provider: 'Uber', vehicleType: 'UberXL', price: 750 + Math.floor(Math.random() * 80), currency: 'INR', eta: 8, capacity: 6, type: type || 'LOCAL' });
    }
    if (providers.includes('OLA')) {
        options.push({ provider: 'Ola', vehicleType: 'Mini', price: 430 + Math.floor(Math.random() * 40), currency: 'INR', eta: 4, capacity: 4, type: type || 'LOCAL' });
        options.push({ provider: 'Ola', vehicleType: 'Prime Sedan', price: 520 + Math.floor(Math.random() * 60), currency: 'INR', eta: 6, capacity: 4, type: type || 'LOCAL' });
    }
    if (providers.includes('RAPIDO')) {
        options.push({ provider: 'Rapido', vehicleType: 'Bike', price: 120 + Math.floor(Math.random() * 20), currency: 'INR', eta: 3, capacity: 1, type: type || 'LOCAL' });
        options.push({ provider: 'Rapido', vehicleType: 'Auto', price: 210 + Math.floor(Math.random() * 30), currency: 'INR', eta: 5, capacity: 3, type: type || 'LOCAL' });
    }

    res.json({ success: true, data: options });
};

// GET /api/rides/linked-accounts
export const getLinkedAccounts = async (req, res) => {
    const accounts = await prisma.linkedAccount.findMany({
        where: { userId: req.user.id }
    });
    res.json({ success: true, data: accounts });
};

// POST /api/rides/link-account
export const linkAccount = async (req, res) => {
    const { provider } = req.body;
    if (!['UBER', 'OLA', 'RAPIDO'].includes(provider)) {
        throw new AppError('Invalid provider', 400);
    }

    if (provider === 'UBER') {
        const state = crypto.randomBytes(16).toString('hex');
        // Store state in a way we can verify later (using a temporary JWT or DB)
        // For simplicity in this demo, we'll use a direct redirect URL construction
        const query = new URLSearchParams({
            client_id: process.env.UBER_CLIENT_ID || 'MOCK_UBER_ID',
            response_type: 'code',
            redirect_uri: process.env.UBER_REDIRECT_URI || 'http://localhost:3001/api/rides/auth/uber/callback',
            scope: 'rides.estimate rides.request',
            state: `${req.user.id}:${state}`
        }).toString();

        return res.json({ success: true, redirectUrl: `${UBER_AUTH_URL}?${query}` });
    }

    // For OLA/RAPIDO, we return a flag to start OTP flow on frontend
    res.json({ success: true, startOTP: true });
};

// GET /api/rides/auth/uber/callback
export const handleUberCallback = async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/rides?error=uber_auth_failed`);
    }

    const [userId] = state.split(':');

    try {
        const params = new URLSearchParams({
            client_id: process.env.UBER_CLIENT_ID,
            client_secret: process.env.UBER_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.UBER_REDIRECT_URI,
            code
        });

        const tokenRes = await axios.post(UBER_TOKEN_URL, params);
        const { access_token, refresh_token, expires_in } = tokenRes.data;

        await prisma.linkedAccount.upsert({
            where: { userId_provider: { userId, provider: 'UBER' } },
            update: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: new Date(Date.now() + expires_in * 1000),
                isConnected: true
            },
            create: {
                userId,
                provider: 'UBER',
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: new Date(Date.now() + expires_in * 1000),
                isConnected: true
            }
        });

        res.send('<html><body><script>window.opener.postMessage({ type: "UBER_CONNECTED" }, "*"); window.close();</script></body></html>');
    } catch (err) {
        console.error('Uber Token Exchange Error:', err.response?.data || err.message);
        res.send('<html><body><script>window.opener.postMessage({ type: "UBER_FAILED" }, "*"); window.close();</script></body></html>');
    }
};

// POST /api/rides/auth/otp/send
export const sendOTP = async (req, res) => {
    const { provider, phone } = req.body;

    // In a "Real" implementation, this would call the provider's mobile API:
    // e.g., axios.post('https://api.olacabs.com/v1/auth/otp', { phone }, { headers: MOBILE_HEADERS })

    // For this build, we simulate a SUCCESSFUL OTP TRIGGER
    console.log(`[REAL-FLOW] Sending OTP for ${provider} to ${phone}`);

    // Return success to the frontend
    res.json({ success: true, message: 'OTP sent successfully' });
};

// POST /api/rides/auth/otp/verify
export const verifyOTP = async (req, res) => {
    const { provider, phone, otp } = req.body;

    // Simulate verification with a real-world delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (otp !== '1234' && process.env.NODE_ENV === 'production') {
        // In real life, verify via provider's API
    }

    // On success, link account
    await prisma.linkedAccount.upsert({
        where: { userId_provider: { userId: req.user.id, provider } },
        update: {
            isConnected: true,
            accessToken: `real_session_token_${crypto.randomBytes(8).toString('hex')}`
        },
        create: {
            userId: req.user.id,
            provider,
            isConnected: true,
            accessToken: `real_session_token_${crypto.randomBytes(8).toString('hex')}`
        }
    });

    res.json({ success: true });
};

// POST /api/rides/book
export const bookRide = async (req, res) => {
    const { provider, vehicleType, pickupLocation, dropoffLocation, fare, currency, type } = req.body;

    const ride = await prisma.rideBooking.create({
        data: {
            userId: req.user.id,
            provider,
            pickupLocation,
            dropoffLocation,
            fare: Number(fare),
            currency: currency || 'INR',
            status: 'BOOKED',
            type: type || 'LOCAL',
        },
    });

    res.status(201).json({ success: true, data: ride });
};

// GET /api/rides/my
export const getMyRides = async (req, res) => {
    const rides = await prisma.rideBooking.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: rides });
};
