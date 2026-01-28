import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDownload extends Document {
    userId: Types.ObjectId;
    filename: string;
    url: string;
    etag?: string;
    contentLength?: string;
    hash: string;
    size?: number;
    status: 'new' | 'duplicate';
    fileExtension?: string;
    mimeType?: string;
    sourceDomain?: string;
    fileCategory?: string;
    createdAt: Date;
    updatedAt: Date;
}

const downloadSchema = new Schema<IDownload>({
    userId: {
        type: Schema.Types.ObjectId, // This is the correct runtime type
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    filename: {
        type: String,
        required: [true, 'Filename is required'],
    },
    url: {
        type: String,
        required: [true, 'URL is required'],
    },
    etag: {
        type: String,
        index: true, // Optimizes "Level 2" Header checks
    },
    contentLength: {
        type: String,
    },
    hash: {
        type: String,
        index: true, // Optimizes "Level 3" Hash checks
    },
    size: {
        type: Number,
    },
    fileExtension: {
        type: String,
        lowercase: true,
    },
    mimeType: {
        type: String,
    },
    sourceDomain: {
        type: String,
        lowercase: true,
    },
    fileCategory: {
        type: String,
        enum: ['document', 'image', 'video', 'audio', 'archive', 'executable', 'other'],
        default: 'other',
    },
    status: {
        type: String,
        enum: ['new', 'duplicate'],
        default: 'new',
    }
}, {
    timestamps: true,
});

// Create the model
export const Download = mongoose.model<IDownload>('Download', downloadSchema);