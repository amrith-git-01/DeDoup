import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBrowsingVisit extends Document {
    userId: Types.ObjectId;
    domainId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    durationSeconds: number;
    clickLinkCount?: number;
    clickButtonCount?: number;
    clickOtherCount?: number;
    scrollCount?: number;
    keyEventCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<IBrowsingVisit>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    domainId: {
        type: Schema.Types.ObjectId,
        ref: 'BrowsingDomain',
        required: [true, 'Domain is required'],
        index: true
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
        index: true
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
        index: true
    },
    durationSeconds: {
        type: Number,
        required: [true, 'Duration seconds is required'],
        index: true
    },
    clickLinkCount: { type: Number, default: 0 },
    clickButtonCount: { type: Number, default: 0 },
    clickOtherCount: { type: Number, default: 0 },
    scrollCount: { type: Number, default: 0 },
    keyEventCount: { type: Number, default: 0 }
}, {
    timestamps: true
})

schema.index({ userId: 1, startTime: -1 })

export const BrowsingVisit = mongoose.model<IBrowsingVisit>('BrowsingVisit', schema)