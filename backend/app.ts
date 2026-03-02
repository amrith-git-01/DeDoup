import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { contentTypeMiddleware } from './middleware/contentTypeMiddleware.js';
import { requestIdMiddleware } from './middleware/requestIdMiddleware.js';
import { csrfMiddleware } from './middleware/csrfMiddleware.js';
import { globalApiLimiter } from './middleware/rateLimiters.js';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import downRoutes from './routes/downloadRoutes.js';
import browsingRoutes from './routes/browsingRoutes.js';
import sseRoutes from './routes/sseRoutes.js';
import { initSSE } from './services/sseService.js';

const app = express();
initSSE();

app.use(requestIdMiddleware);
app.use(helmet());

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(null, false);
        },
        credentials: true,
    })
);

app.use(contentTypeMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.get('/health', (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    const dbStatus = dbReady ? 'connected' : 'disconnected';
    res.status(200).json({
        status: dbReady ? 'ok' : 'degraded',
        db: dbStatus,
        uptime: process.uptime(),
        version: process.env.npm_package_version,
        environment: env.NODE_ENV,
    });
});

app.use('/api/v1', globalApiLimiter);
app.use('/api/v1', csrfMiddleware);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/downloads', downRoutes);
app.use('/api/v1/browsing', browsingRoutes);
app.use('/api/v1/sse', sseRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;