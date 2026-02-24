import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// Validate JWT_SECRET exists first
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

// Assign to properly typed constants
const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

interface SignupData {
    email: string
    password: string
    username: string
}

interface LoginData {
    email: string
    password: string
}

interface AuthResult {
    user: {
        id: string
        email: string
        username: string
    }
    token: string
}

export async function signup(data: SignupData): Promise<AuthResult> {
    const { email, password, username } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        username
    })

    const token = jwt.sign(
        {
            userId: user._id.toString()
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        } as any
    );

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username
        },
        token
    }
}

export async function login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
        {
            userId: user._id.toString()
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        } as any
    );

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username
        },
        token
    }
}

export async function getUserById(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl
    }
}

export async function updateUsername(userId: string, username: string) {
    const existing = await User.findOne({ username, _id: { $ne: userId } });
    if (existing) {
        throw new AppError('Username is already in use', 400);
    }
    const user = await User.findByIdAndUpdate(
        userId,
        { username: username.trim() },
        { new: true, runValidators: true }
    );
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl
    };
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
        throw new AppError('Current password is incorrect', 400);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { runValidators: true });
    return { success: true };
}