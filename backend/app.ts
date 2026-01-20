import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import morgan from 'morgan';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json());
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
    })
})

app.use(errorHandler);
app.use(notFoundHandler);

export default app;