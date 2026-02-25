import mongoose, { Schema, type Document } from 'mongoose';

export interface IUserDownloadPreferences extends Document {
    userId: mongoose.Types.ObjectId;
    trackingEnabled: boolean;
    domainBlocklist: string[];
    pausedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const userDownloadPreferencesSchema = new Schema<IUserDownloadPreferences>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true,
        index: true
    },
    trackingEnabled: {
        type: Boolean,
        default: true
    },
    domainBlocklist: {
        type: [String],
        default: []
    },
    pausedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

export const UserDownloadPreferences = mongoose.model<IUserDownloadPreferences>('UserDownloadPreferences', userDownloadPreferencesSchema);