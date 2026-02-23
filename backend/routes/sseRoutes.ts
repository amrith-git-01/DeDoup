import { Router, Request, Response } from 'express';
import { authMiddlewareOptionalSSE } from '../middleware/authMiddlewareOptionalSSE.js';
import { addSSEClient } from '../services/sseService.js';

const router = Router();

router.get('/stream', authMiddlewareOptionalSSE, (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    addSSEClient(res, userId);

    req.on('close', () => {
        res.end();
    });
});

export default router;