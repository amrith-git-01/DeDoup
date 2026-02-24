import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { uploadProfilePhoto, removeProfilePhoto } from '../services/profilePhotoService.js';

export const uploadProfilePhotoController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('Unauthorized', 401);
        if (!req.file) throw new AppError('No file uploaded', 400);

        const result = await uploadProfilePhoto(
            userId,
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname,
            req.file.size
        );

        res.status(200).json({
            success: true,
            message: 'Profile photo updated',
            data: { url: result.url },
        });
    }
);

export const removeProfilePhotoController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('Unauthorized', 401);

        await removeProfilePhoto(userId);

        res.status(200).json({
            success: true,
            message: 'Profile photo removed',
        });
    }
);