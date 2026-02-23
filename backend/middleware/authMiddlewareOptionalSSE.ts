import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

export function authMiddlewareOptionalSSE(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token : null;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : tokenFromQuery;

        if (!token) {
            return next(new AppError('no token provided', 401));
        }

        const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token', 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expired', 401));
        }
        return next(new AppError('Unauthorized', 401));
    }
}