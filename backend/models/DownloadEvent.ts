import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDownloadEvent extends Document {
    userId: Types.ObjectId;
    fileId: Types.ObjectId;
    status: 'new' | 'duplicate';
    duration?: number;
    downloadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const downloadEventSchema = new Schema<IDownloadEvent>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    fileId: {
        type: Schema.Types.ObjectId,
        ref: 'File',
        required: [true, 'File ID is required'],
        index: true
    },
    status: {
        type: String,
        enum: ['new', 'duplicate'],
        required: [true, 'Status is required']
    },
    duration: {
        type: Number
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
})

downloadEventSchema.index({ userId: 1, downloadedAt: -1 })

downloadEventSchema.index({ userId: 1, status: 1 })

downloadEventSchema.index({ fileId: 1, downloadedAt: -1 })

export const DownloadEvent = mongoose.model<IDownloadEvent>('DownloadEvent', downloadEventSchema);