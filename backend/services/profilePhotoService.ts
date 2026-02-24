import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || 'us-east-1';

if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not defined in environment variables');
}

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const FOLDER = 'profile-photos';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function getExt(mimetype: string, originalname: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
    };
    return map[mimetype] || originalname.split('.').pop()?.toLowerCase() || 'jpg';
}

function buildPublicUrl(key: string): string {
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function keyFromUrl(url: string): string | null {
    try {
        const u = new URL(url);
        const path = u.pathname.slice(1);
        return path || null;
    } catch {
        return null;
    }
}

export async function uploadProfilePhoto(
    userId: string,
    buffer: Buffer,
    mimetype: string,
    originalname: string,
    size: number
) {
    if (size > MAX_SIZE) {
        throw new AppError('Image must be under 5 MB', 400);
    }
    if (!ALLOWED_TYPES.includes(mimetype)) {
        throw new AppError('Invalid file type. Use JPEG, PNG, WebP or GIF.', 400);
    }

    const ext = getExt(mimetype, originalname);
    const key = `${FOLDER}/${userId}/${Date.now()}.${ext}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
            ACL: 'public-read',
        })
    );

    const url = buildPublicUrl(key);
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const previousUrl = (user as any).profileImageUrl;
    (user as any).profileImageUrl = url;
    await user.save();

    if (previousUrl) {
        const previousKey = keyFromUrl(previousUrl);
        if (previousKey) {
            try {
                await s3.send(
                    new DeleteObjectCommand({ Bucket: bucket, Key: previousKey })
                );
            } catch (_) { }
        }
    }

    return { url };
}

export async function removeProfilePhoto(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const url = (user as any).profileImageUrl;
    if (url) {
        const key = keyFromUrl(url);
        if (key) {
            try {
                await s3.send(
                    new DeleteObjectCommand({ Bucket: bucket, Key: key })
                );
            } catch (_) { }
            (user as any).profileImageUrl = undefined;
            await user.save();
        }
    }
}