import mongoose, { Schema, type Document } from 'mongoose';
import { z } from 'zod';

export const userSchemaZod = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    username: z.string().min(5, "Username must be at least 5 characters long")
})

export type UserInput = z.infer<typeof userSchemaZod>;

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    username: {
        type: String,
        text: true,
        required: [true, 'Username is required'],
        minlength: [5, 'Username must be at least 5 characters long'],
        trim: true,
        index: true
    }
}, {
    timestamps: true
})

export const User = mongoose.model<IUser>("User", userSchema);
