import { UserDownloadPreferences } from '../models/UserDownloadPreferences.js';

const DEFAULT_PREFS = {
    trackingEnabled: true,
    domainBlocklist: [] as string[],
    pausedUntil: null as Date | null,
}

export async function getDownloadPreferences(userId: string) {
    const doc = await UserDownloadPreferences.findOne({ userId }).lean();
    if (!doc) {
        return { ...DEFAULT_PREFS, domainBlocklist: [] };
    }
    const isPaused = doc.pausedUntil && new Date(doc.pausedUntil) > new Date();
    return {
        trackingEnabled: doc.trackingEnabled,
        domainBlocklist: doc.domainBlocklist || [],
        pausedUntil: doc.pausedUntil ? doc.pausedUntil.toISOString() : null,
        isPaused,
    };
}

function normalizeDomain(d: string): string {
    return d.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
}

export function shouldTrackDomain(sourceDomain: string, domainBlocklist: string[]): boolean {
    const normalized = normalizeDomain(sourceDomain);
    const list = domainBlocklist.map(normalizeDomain).filter(Boolean);
    if (list.length === 0) return true;
    const inBlocklist = list.some((d) => d === normalized || normalized.endsWith('.' + d));
    return !inBlocklist;
}

export async function updateDownloadPreferences(
    userId: string,
    body: {
        trackingEnabled?: boolean;
        domainBlocklist?: string[];
        pausedUntil?: Date | null;
        pauseForSeconds?: number;
    }
) {
    const update: Record<string, unknown> = {};
    if (typeof body.trackingEnabled === 'boolean') update.trackingEnabled = body.trackingEnabled;
    if (Array.isArray(body.domainBlocklist)) {
        update.domainBlocklist = body.domainBlocklist.map((d) => normalizeDomain(d)).filter(Boolean);
    }
    if (body.pauseForSeconds != null && body.pauseForSeconds >= 0) {
        const until = new Date(Date.now() + body.pauseForSeconds * 1000);
        update.pausedUntil = until;
    } else if (body.pausedUntil !== undefined) {
        update.pausedUntil = body.pausedUntil;
    }

    const doc = await UserDownloadPreferences.findOneAndUpdate(
        { userId },
        { $set: update },
        { new: true, upsert: true, runValidators: true }
    ).lean();

    const isPaused = doc.pausedUntil && new Date(doc.pausedUntil) > new Date();
    return {
        trackingEnabled: doc.trackingEnabled,
        domainBlocklist: doc.domainBlocklist || [],
        pausedUntil: doc.pausedUntil ? doc.pausedUntil.toISOString() : null,
        isPaused,
    };
}