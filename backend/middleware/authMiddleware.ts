import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            }
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {


        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('no token provided', 401));
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };

        req.user = {
            userId: decoded.userId
        }
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token', 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expired', 401));
        }
        return next(new AppError('Unauthorized', 401));
    }
}