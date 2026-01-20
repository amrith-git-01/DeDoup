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
        username: user.username
    }
}