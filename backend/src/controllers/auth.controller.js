import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { signAccessToken, signRefreshToken, setCookies, clearCookies } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

// POST /api/auth/register
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already in use.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { name, email, passwordHash },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    setCookies(res, accessToken, refreshToken);

    const { passwordHash: _, refreshToken: __, ...safeUser } = user;
    res.status(201).json({ success: true, user: safeUser, accessToken });
};

// POST /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new AppError('Invalid credentials.', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials.', 401);

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    setCookies(res, accessToken, refreshToken);

    const { passwordHash: _, refreshToken: __, ...safeUser } = user;
    res.json({ success: true, user: safeUser, accessToken });
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    const userId = req.user?.id;
    if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    }
    clearCookies(res);
    res.json({ success: true, message: 'Logged out successfully.' });
};

// POST /api/auth/refresh
export const refreshAccessToken = async (req, res) => {
    const token = req.cookies?.refresh_token;
    if (!token) throw new AppError('No refresh token.', 401);

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token.', 401);

    const accessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
    setCookies(res, accessToken, newRefreshToken);

    res.json({ success: true, accessToken });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
    const { passwordHash: _, refreshToken: __, ...safeUser } = req.user;
    res.json({ success: true, user: safeUser });
};
