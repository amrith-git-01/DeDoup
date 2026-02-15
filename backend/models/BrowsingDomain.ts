import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBrowsingDomain extends Document {
    userId: Types.ObjectId;
    domain: string;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<IBrowsingDomain>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    domain: {
        type: String,
        required: [true, 'Domain is required'],
        index: true
    }
}, {
    timestamps: true
})

schema.index({ userId: 1, domain: 1 }, { unique: true })

export const BrowsingDomain = mongoose.model<IBrowsingDomain>('BrowsingDomain', schema)