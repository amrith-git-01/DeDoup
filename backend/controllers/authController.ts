import type { Request, Response } from 'express';
import { signupSchemaZod, loginSchemaZod } from '../models/User.js';
import { signup, login, getUserById } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const signupController = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = signupSchemaZod.parse(req.body);

    const result = await signup({
        email: validatedData.email,
        password: validatedData.password,
        username: validatedData.username
    });

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
    });
})

export const loginController = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchemaZod.parse(req.body);

    const result = await login({
        email: validatedData.email,
        password: validatedData.password
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
    });
})

export const getMeController = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).req.user?.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }
    const user = await getUserById(userId);
    res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user
    });
})