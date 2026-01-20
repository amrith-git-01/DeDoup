import express from 'express';

import {
    signupController,
    loginController,
    getMeController
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/me', getMeController);

export default router;