export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV !== 'production') {
        console.error(`[ERROR] ${req.method} ${req.path}:`, err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
