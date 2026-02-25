import jwt from 'jsonwebtoken';

export const signAccessToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

export const signRefreshToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

export const setCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const clearCookies = (res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
};
