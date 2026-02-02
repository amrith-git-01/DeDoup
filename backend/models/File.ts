import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IFile extends Document {
    userId: Types.ObjectId
    hash: string
    filename: string
    url: string
    size?: number
    fileExtension?: string
    fileCategory?: string
    mimeType?: string
    sourceDomain?: string
    firstDownloadedAt: Date
    createdAt: Date
    updatedAt: Date
}

const fileSchema = new Schema<IFile>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"],
        index: true
    },
    hash: {
        type: String,
        required: [true, 'Hash is required'],
        index: true
    },
    filename: {
        type: String,
        required: [true, 'Filename is required']
    },
    url: {
        type: String,
        required: [true, 'URL is required']
    },
    size: {
        type: Number
    },
    fileExtension: {
        type: String
    },
    fileCategory: {
        type: String
    },
    mimeType: {
        type: String
    },
    sourceDomain: {
        type: String
    },
    firstDownloadedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
})

fileSchema.index({ userId: 1, hash: 1 }, { unique: true })

fileSchema.index({ userId: 1, fileCategory: 1 })

fileSchema.index({ userId: 1, fileExtension: 1 })

export const File = mongoose.model<IFile>('File', fileSchema);