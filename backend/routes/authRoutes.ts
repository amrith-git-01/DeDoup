import express from 'express';

import {
    signupController,
    loginController,
    getMeController
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);

router.get('/me', authMiddleware, getMeController);

export default router;