import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import downRoutes from './routes/downloadRoutes.js';
import browsingRoutes from './routes/browsingRoutes.js';

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
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

const downloadsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/downloads', downloadsLimiter);

const browsingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/browsing', browsingLimiter);

app.use(express.json({ limit: '100kb' }));

app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
else {
    app.use(morgan('combined'))
}

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: "Server is running",
        environment: process.env.NODE_ENV || 'development',
    })
})

app.use('/api/auth', authRoutes);
app.use('/api/downloads', downRoutes);
app.use('/api/browsing', browsingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;