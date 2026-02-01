import { AppError } from '../utils/AppError'
import { DownloadEvent } from '../models/DownloadEvent'
import { File } from '../models/File'
import {
    DownloadPayload,
    DownloadStats,
    DownloadHistoryItem,
    TimeBasedStats,
    SizeStats,
    SourceStats,
    FileTypeStats,
    DuplicateStats,
    AdvancedStats
} from '../types/stats'

// ============================================
// Find download by hash
// ============================================

export async function findByHash(userId: string, hash: string) {
    try {
        return await File.findOne({ userId, hash }).lean()
    } catch (error: any) {
        throw new AppError(`Failed to find file by hash: ${error.message}`, 500)
    }
}

// ============================================
// Log a download
// ============================================

export async function logDownload(userId: string, payload: DownloadPayload) {
    console.log('🔍 [logDownload] Starting with:', { filename: payload.filename, hash: payload.hash, status: payload.status })

    let file = await File.findOne({ userId, hash: payload.hash })
    console.log('🔍 [logDownload] Existing file found:', !!file)

    if (!file) {
        console.log('🔍 [logDownload] Creating new file...')
        file = new File({
            userId,
            hash: payload.hash,
            filename: payload.filename,
            url: payload.url,
            size: payload.size,
            fileExtension: payload.fileExtension,
            mimeType: payload.mimeType,
            sourceDomain: payload.sourceDomain,
            fileCategory: payload.fileCategory,
            firstDownloadedAt: new Date()
        })

        try {
            await file.save()
            console.log('✅ [logDownload] File saved successfully')
        } catch (error: any) {
            if (error.code === 11000) {
                throw new AppError('Duplicate file detected', 409)
            }
            throw new AppError(`Failed to save file: ${error.message}`, 500)
        }
    } else {
        console.log('🔍 [logDownload] Using existing file:', file._id)
    }

    console.log('🔍 [logDownload] Creating download event...')
    const downloadEvent = new DownloadEvent({
        userId,
        fileId: file._id,
        status: payload.status,
        duration: payload.duration,
        downloadedAt: new Date()
    })

    try {
        await downloadEvent.save()
        console.log('✅ [logDownload] Download event saved successfully')
    } catch (error: any) {
        throw new AppError(`Failed to save download event: ${error.message}`, 500)
    }

    return { file, downloadEvent }
}

// ============================================
// Get user statistics
// ============================================

export async function getUserStats(userId: string): Promise<DownloadStats> {
    try {
        const allEvents = await DownloadEvent.find({ userId }).lean()
        const totalDownloads = allEvents.length
        const uniqueDownloads = allEvents.filter(d => d.status === 'new').length
        const duplicateDownloads = allEvents.filter(d => d.status === 'duplicate').length

        const allFiles = await File.find({ userId }).lean()

        let uniqueFilesSize = 0;
        let duplicateFilesSize = 0;

        allFiles.forEach(file => {
            if (file.size) {
                uniqueFilesSize += file.size
            }
        })

        const duplicateEvents = allEvents.filter(e => e.status === 'duplicate')
        for (const event of duplicateEvents) {
            const file = allFiles.find(f => f._id.toString() === event.fileId.toString())
            if (file?.size) {
                duplicateFilesSize += file.size
            }
        }

        const totalSize = uniqueFilesSize + duplicateFilesSize

        // Calculate average duration
        const eventsWithDuration = allEvents.filter(e => e.duration && e.duration > 0)
        const totalDuration = eventsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0)
        const averageDuration = eventsWithDuration.length > 0
            ? Math.round((totalDuration / eventsWithDuration.length) * 100) / 100
            : 0

        // Calculate file category breakdown
        const fileCategories: Record<string, number> = {}
        allFiles.forEach(file => {
            const category = file.fileCategory || 'other'
            fileCategories[category] = (fileCategories[category] || 0) + 1
        })

        // Calculate ALL file extensions
        const fileExtensions: Record<string, number> = {}
        allFiles.forEach(file => {
            if (file.fileExtension) {
                const ext = file.fileExtension
                fileExtensions[ext] = (fileExtensions[ext] || 0) + 1
            }
        })

        const recentDownloads = await getDownloadHistory(userId, 20, 0)

        return {
            totalDownloads,
            uniqueDownloads,
            duplicateDownloads,
            totalSize,
            uniqueFilesSize,
            duplicateFilesSize,
            averageDuration,
            fileCategories,
            fileExtensions,
            recentDownloads
        }
    } catch (error: any) {
        throw new AppError(`Failed to fetch user statistics: ${error.message}`, 500)
    }
}

// ============================================
// Get download history
// ============================================

export async function getDownloadHistory(
    userId: string,
    limit: number = 50,
    skip: number = 0
): Promise<DownloadHistoryItem[]> {
    try {
        const events = await DownloadEvent.find({ userId })
            .populate('fileId')
            .sort({ downloadedAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean()

        return events.map(event => {
            const file = event.fileId as any
            return {
                id: event._id.toString(),
                filename: file.filename,
                url: file.url,
                hash: file.hash,
                size: file.size,
                fileCategory: file.fileCategory,
                status: event.status,
                duration: event.duration,
                createdAt: event.downloadedAt
            }
        })
    } catch (error: any) {
        throw new AppError(`Failed to fetch download history: ${error.message}`, 500)
    }
}

// ============================================
// Get recently blocked (duplicate) downloads
// ============================================

export async function getRecentlyBlocked(
    userId: string,
    limit: number = 10
): Promise<DownloadHistoryItem[]> {
    try {
        const events = await DownloadEvent.find({
            userId,
            status: 'duplicate'
        })
            .populate('fileId')
            .sort({ downloadedAt: -1 })
            .limit(limit)
            .lean()

        return events.map(event => {
            const file = event.fileId as any
            return {
                id: event._id.toString(),
                filename: file.filename,
                url: file.url,
                hash: file.hash,
                size: file.size,
                fileCategory: file.fileCategory,
                status: event.status,
                duration: event.duration,
                createdAt: event.downloadedAt
            }
        })
    } catch (error: any) {
        throw new AppError(`Failed to fetch recently blocked downloads: ${error.message}`, 500)
    }
}

// ============================================
// Get Duplicate downloads
// ============================================

export async function getDuplicateDownloads(
    userId: string,
    limit: number = 20
): Promise<DownloadHistoryItem[]> {
    try {
        const events = await DownloadEvent.find({
            userId,
            status: 'duplicate'
        })
            .populate('fileId')
            .sort({ downloadedAt: -1 })
            .limit(limit)
            .lean()

        return events.map(event => {
            const file = event.fileId as any
            return {
                id: event._id.toString(),
                filename: file.filename,
                url: file.url,
                hash: file.hash,
                size: file.size,
                fileCategory: file.fileCategory,
                status: event.status,
                duration: event.duration,
                createdAt: event.downloadedAt
            }
        })
    } catch (error: any) {
        throw new AppError(`Failed to fetch duplicate downloads: ${error.message}`, 500)
    }
}

// ============================================
// Get Advanced Statistics
// ============================================

export async function getAdvancedStats(userId: string): Promise<AdvancedStats> {
    try {
        const allEvents = await DownloadEvent.find({ userId })
            .populate('fileId')
            .sort({ downloadedAt: 1 })
            .lean()


        const allFiles = await File.find({ userId }).lean();

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const downloadsToday = allEvents.filter(e => new Date(e.downloadedAt) >= today).length;
        const downloadsThisWeek = allEvents.filter(e => new Date(e.downloadedAt) >= weekAgo).length;
        const downloadsThisMonth = allEvents.filter(e => new Date(e.downloadedAt) >= monthAgo).length;

        const firstDownloadDate = allEvents.length > 0 ? allEvents[0].downloadedAt : null;
        const firstDownloadEvent = allEvents.length > 0 ? allEvents[0] : null;
        const daysSinceFirst = firstDownloadDate ? Math.ceil((now.getTime() - firstDownloadDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const averagePerDay = allEvents.length / daysSinceFirst;

        const hourCounts: Record<string, number> = {};
        allEvents.forEach(e => {
            const date = new Date(e.downloadedAt);
            const key = `${date.toDateString()}-${date.getHours()}`;
            hourCounts[key] = (hourCounts[key] || 0) + 1;
        });

        let firstDownloadFile = null;
        if (firstDownloadEvent) {
            const fileData = firstDownloadEvent.fileId as any;
            // Case 1: Populated
            if (fileData && fileData.filename) {
                firstDownloadFile = { filename: fileData.filename, size: fileData.size || 0 };
            }
            // Case 2: Not populated (just ID or Partial), look in allFiles
            else {
                // If fileData is string/ObjectId, use it. If object with _id, use that.
                const searchId = fileData?._id ? fileData._id.toString() : (fileData ? fileData.toString() : null);
                if (searchId) {
                    const found = allFiles.find(f => f._id.toString() === searchId);
                    if (found) {
                        firstDownloadFile = { filename: found.filename, size: found.size || 0 };
                    }
                }
            }
        }

        const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
        const mostActiveEntry = sortedHours[0];

        let mostActiveHour = 0;
        let mostActiveHourDate: Date | null = null;

        if (mostActiveEntry) {
            const [key] = mostActiveEntry;
            // Key format: "Fri Jan 30 2026-14"
            const lastDashIndex = key.lastIndexOf('-');
            const dateStr = key.substring(0, lastDashIndex);
            const hourStr = key.substring(lastDashIndex + 1);
            mostActiveHour = parseInt(hourStr);
            mostActiveHourDate = new Date(dateStr);
        }

        const dayCounts: Record<string, number> = {}
        allEvents.forEach(e => {
            const day = new Date(e.downloadedAt).toLocaleDateString()
            dayCounts[day] = (dayCounts[day] || 0) + 1
        })
        const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const filesWithSize = allFiles.filter(f => f.size && f.size > 0)
        const totalSize = filesWithSize.reduce((sum, f) => sum + (f.size || 0), 0)
        const averageFileSize = filesWithSize.length > 0 ? totalSize / filesWithSize.length : 0
        const largestFile = filesWithSize.length > 0
            ? filesWithSize.reduce((max, f) => (f.size! > (max.size || 0) ? f : max))
            : null

        const smallestFile = filesWithSize.length > 0
            ? filesWithSize.reduce((min, f) => {
                const minSize = min.size || Number.MAX_SAFE_INTEGER;
                const fSize = f.size || Number.MAX_SAFE_INTEGER;
                return fSize < minSize ? f : min;
            })
            : null

        const duplicateEvents = allEvents.filter(e => e.status === 'duplicate')
        const duplicateSize = duplicateEvents.reduce((sum, e) => {
            const file = allFiles.find(f => f._id.toString() === e.fileId.toString())
            return sum + (file?.size || 0)
        }, 0)
        const totalStorageUsed = totalSize + duplicateSize
        const potentialSavingsPercent = totalStorageUsed > 0
            ? (duplicateSize / totalStorageUsed) * 100
            : 0

        const uniqueDates = Array.from(new Set(allEvents.map(e => new Date(e.downloadedAt).toDateString())
        )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i]);
            const prevDate = i > 0 ? new Date(uniqueDates[i - 1]) : null;

            if (prevDate) {
                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }
            else {
                tempStreak = 1;
            }

            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }

        }

        const lastDownloadDateStr = uniqueDates[uniqueDates.length - 1];
        if (lastDownloadDateStr) {
            const lastDownloadDate = new Date(lastDownloadDateStr);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const yesterdayDate = new Date(todayDate);
            yesterdayDate.setDate(todayDate.getDate() - 1);

            const lastDateMidnight = new Date(lastDownloadDate);
            lastDateMidnight.setHours(0, 0, 0, 0);
            if (lastDateMidnight.getTime() === todayDate.getTime() || lastDateMidnight.getTime() === yesterdayDate.getTime()) {
                currentStreak = tempStreak;
            } else {
                currentStreak = 0;
            }
        }



        const domainCounts: Record<string, number> = {}
        allFiles.forEach(f => {
            if (f.sourceDomain) {
                domainCounts[f.sourceDomain] = (domainCounts[f.sourceDomain] || 0) + 1
            }
        })
        const topSources = Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([domain, count]) => ({ domain, count }))
        const mostDownloadedDomain = topSources[0]?.domain || null

        const extensionCounts: Record<string, number> = {}
        allFiles.forEach(f => {
            if (f.fileExtension) {
                extensionCounts[f.fileExtension] = (extensionCounts[f.fileExtension] || 0) + 1
            }
        })
        const mostDownloadedType = Object.entries(extensionCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null
        const categorySizes: Record<string, number> = {}
        allFiles.forEach(f => {
            const category = f.fileCategory || 'other'
            categorySizes[category] = (categorySizes[category] || 0) + (f.size || 0)
        })
        const largestCategoryBySize = Object.entries(categorySizes)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null
        // Duplicate rate by category
        const duplicateRateByCategory: Record<string, number> = {}
        const categoryTotals: Record<string, number> = {}
        const categoryDuplicates: Record<string, number> = {}
        allEvents.forEach(e => {
            const file = allFiles.find(f => f._id.toString() === e.fileId.toString())
            const category = file?.fileCategory || 'other'
            categoryTotals[category] = (categoryTotals[category] || 0) + 1
            if (e.status === 'duplicate') {
                categoryDuplicates[category] = (categoryDuplicates[category] || 0) + 1
            }
        })
        Object.keys(categoryTotals).forEach(category => {
            const total = categoryTotals[category]
            const duplicates = categoryDuplicates[category] || 0
            duplicateRateByCategory[category] = total > 0 ? (duplicates / total) * 100 : 0
        })
        // Duplicate Intelligence
        const duplicateRatePercent = allEvents.length > 0
            ? (duplicateEvents.length / allEvents.length) * 100
            : 0
        // Most duplicated file
        const fileDuplicateCounts: Record<string, { filename: string; count: number }> = {}
        duplicateEvents.forEach(e => {
            const file = allFiles.find(f => f._id.toString() === e.fileId.toString())
            if (file) {
                const key = file._id.toString()
                if (!fileDuplicateCounts[key]) {
                    fileDuplicateCounts[key] = { filename: file.filename, count: 0 }
                }
                fileDuplicateCounts[key].count++
            }
        })
        const mostDuplicatedFile = Object.values(fileDuplicateCounts)
            .sort((a, b) => b.count - a.count)[0] || null
        const averageDuplicateCount = Object.keys(fileDuplicateCounts).length > 0
            ? Object.values(fileDuplicateCounts).reduce((sum, f) => sum + f.count, 0) / Object.keys(fileDuplicateCounts).length
            : 0

        const dailyActivityMap = new Map<string, { total: number, unique: number, duplicate: number }>();

        for (let i = 0; i < 35; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyActivityMap.set(dateStr, { total: 0, unique: 0, duplicate: 0 });
        }

        allEvents.forEach(e => {
            const d = new Date(e.downloadedAt);
            const dateStr = d.toISOString().split('T')[0];
            const dayStats = dailyActivityMap.get(dateStr);
            if (dayStats) {
                dayStats.total++;
                if (e.status === 'new') {
                    dayStats.unique++;
                } else {
                    dayStats.duplicate++;
                }
            }
        })

        const dailyActivity = Array.from(dailyActivityMap.entries())
            .map(([date, stats]) => ({
                date,
                ...stats
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            dailyActivity,
            timeStats: {
                downloadsToday,
                downloadsThisWeek,
                downloadsThisMonth,
                averagePerDay: Math.round(averagePerDay * 100) / 100,
                mostActiveHour: Number(mostActiveHour),
                mostActiveHourDate,
                mostActiveDay,
                firstDownloadDate,
                firstDownloadFile,
                currentStreak,
                longestStreak
            },
            sizeStats: {
                averageFileSize: Math.round(averageFileSize),
                largestFile: largestFile ? {
                    filename: largestFile.filename,
                    size: largestFile.size!
                } : null,
                smallestFile: smallestFile ? {
                    filename: smallestFile.filename,
                    size: smallestFile.size!
                } : null,
                totalStorageUsed,
                potentialSavingsPercent: Math.round(potentialSavingsPercent * 100) / 100
            },
            sourceStats: {
                topSources,
                downloadsByDomain: domainCounts,
                mostDownloadedDomain
            },
            fileTypeStats: {
                mostDownloadedType,
                largestCategoryBySize,
                duplicateRateByCategory
            },
            duplicateStats: {
                duplicateRatePercent: Math.round(duplicateRatePercent * 100) / 100,
                mostDuplicatedFile,
                averageDuplicateCount: Math.round(averageDuplicateCount * 100) / 100
            }
        }
    } catch (error: any) {
        throw new AppError(`Failed to fetch advanced statistics: ${error.message}`, 500)
    }
}