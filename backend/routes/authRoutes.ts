import express from 'express';
import multer from 'multer';

import {
    signupController,
    loginController,
    getMeController,
    updateUsernameController,
    updatePasswordController,
} from '../controllers/authController.js';
import {
    uploadProfilePhotoController,
    removeProfilePhotoController,
} from '../controllers/profilePhotoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/signup', signupController);
router.post('/login', loginController);

router.get('/me', authMiddleware, getMeController);

router.post(
    '/profile-photo',
    authMiddleware,
    upload.single('photo'),
    uploadProfilePhotoController
);
router.delete('/profile-photo', authMiddleware, removeProfilePhotoController);

router.patch('/username', authMiddleware, updateUsernameController);
router.patch('/password', authMiddleware, updatePasswordController);

export default router;