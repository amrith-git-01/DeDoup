import mongoose from 'mongoose'
import { AppError } from '../utils/AppError'
import { DownloadEvent } from '../models/DownloadEvent'
import { File } from '../models/File'
import {
    DownloadPayload,
    TimeBasedStats,
    SizeStats,
    SourceStats,
    DownloadHistoryFilter,
    DownloadHistoryItem,
    SummaryMetrics,
    ActivityTrend,
    DailyActivity,
    HabitsData,
    FileMetrics
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
// Get Summary Metrics (Health Bar)
// ============================================
export async function getSummaryMetrics(userId: string): Promise<SummaryMetrics> {
    try {
        const [totalDownloads, newDownloads, duplicateDownloads] = await Promise.all([
            DownloadEvent.countDocuments({ userId }),
            DownloadEvent.countDocuments({ userId, status: 'new' }),
            DownloadEvent.countDocuments({ userId, status: 'duplicate' }),
        ])

        const sizeStats = await DownloadEvent.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'files',
                    localField: 'fileId',
                    foreignField: '_id',
                    as: 'file'
                }
            },
            { $unwind: '$file' },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: '$file.size' },
                    newSize: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'new'] }, '$file.size', 0]
                        }
                    },
                    duplicateSize: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'duplicate'] }, '$file.size', 0]
                        }
                    }
                }
            }
        ]);

        const sizes = sizeStats[0] || { totalSize: 0, newSize: 0, duplicateSize: 0 };
        return {
            totalDownloads,
            newDownloads,
            duplicateDownloads,
            totalSize: sizes.totalSize,
            newSize: sizes.newSize,
            duplicateSize: sizes.duplicateSize
        };
    }
    catch (error: any) {
        throw new AppError(`Failed to fetch summary metrics: ${error.message}`, 500);
    }
}

// ============================================
// Get download history
// ============================================

export async function getDownloadHistory(
    userId: string,
    limit: number = 20,
    skip: number = 0,
    filters: DownloadHistoryFilter = {}
): Promise<{ history: DownloadHistoryItem[], total: number }> {
    try {
        const matchStage: any = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        if (filters.status) matchStage.status = filters.status;
        if (filters.fileId) {
            if (mongoose.Types.ObjectId.isValid(filters.fileId)) {
                matchStage.fileId = new mongoose.Types.ObjectId(filters.fileId);
            }
        }
        if (filters.startDate || filters.endDate) {
            matchStage.downloadedAt = {};
            if (filters.startDate) matchStage.downloadedAt.$gte = new Date(filters.startDate);
            if (filters.endDate) matchStage.downloadedAt.$lte = new Date(filters.endDate);
        }

        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'files',
                    localField: 'fileId',
                    foreignField: '_id',
                    as: 'file'
                }
            },
            { $unwind: '$file' }
        ];

        // Apply File-Level Filters
        const fileMatch: any = {};

        if (filters.fileCategory) {
            fileMatch['file.fileCategory'] = { $regex: new RegExp(`^${filters.fileCategory}$`, 'i') };
        }

        if (filters.fileExtension) {
            const ext = filters.fileExtension.startsWith('.') ? filters.fileExtension.slice(1) : filters.fileExtension;
            fileMatch['file.fileExtension'] = { $regex: new RegExp(`^${ext}$`, 'i') };
        }

        if (filters.search) {
            fileMatch['file.filename'] = { $regex: new RegExp(filters.search, 'i') };
        }

        if (Object.keys(fileMatch).length > 0) {
            pipeline.push({ $match: fileMatch });
        }

        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { downloadedAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 1,
                            status: 1,
                            downloadedAt: 1,
                            duration: 1,
                            fileId: '$file._id',
                            filename: '$file.filename',
                            url: '$file.url',
                            hash: '$file.hash',
                            size: '$file.size',
                            fileExtension: '$file.fileExtension',
                            fileCategory: '$file.fileCategory',
                            mimeType: '$file.mimeType',
                            sourceDomain: '$file.sourceDomain',
                            fileCreatedAt: '$file.createdAt',
                            fileUpdatedAt: '$file.updatedAt'
                        }
                    }
                ]
            }
        });

        const result = await DownloadEvent.aggregate(pipeline);
        return {
            history: result[0].data,
            total: result[0].metadata[0]?.total || 0
        };

    } catch (error: any) {
        throw new AppError(`Failed to fetch history: ${error.message}`, 500);
    }
}

// ============================================
// Get File Metrics (Categories & Extensions)
// ============================================

export async function getFileMetrics(
    userId: string,
    filters: DownloadHistoryFilter = {}
): Promise<FileMetrics> {
    try {
        const matchStage: any = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        if (filters.status) matchStage.status = filters.status;
        if (filters.startDate || filters.endDate) {
            matchStage.downloadedAt = {};
            if (filters.startDate) matchStage.downloadedAt.$gte = new Date(filters.startDate);
            if (filters.endDate) matchStage.downloadedAt.$lte = new Date(filters.endDate);
        }

        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'files',
                    localField: 'fileId',
                    foreignField: '_id',
                    as: 'file'
                }
            },
            { $unwind: '$file' }
        ];

        // Apply File-Level Filters (if any)
        const fileMatch: any = {};
        if (filters.fileCategory) fileMatch['file.fileCategory'] = { $regex: new RegExp(`^${filters.fileCategory}$`, 'i') };
        if (filters.fileExtension) {
            const ext = filters.fileExtension.startsWith('.') ? filters.fileExtension.slice(1) : filters.fileExtension;
            fileMatch['file.fileExtension'] = { $regex: new RegExp(`^${ext}$`, 'i') };
        }
        if (filters.search) fileMatch['file.filename'] = { $regex: new RegExp(filters.search, 'i') };

        if (Object.keys(fileMatch).length > 0) {
            pipeline.push({ $match: fileMatch });
        }

        const aggregationResults = await DownloadEvent.aggregate([
            ...pipeline,
            {
                $facet: {
                    categories: [
                        {
                            $group: {
                                _id: { $toLower: { $ifNull: ["$file.fileCategory", "other"] } },
                                count: { $sum: 1 },
                                size: { $sum: "$file.size" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                count: 1,
                                size: 1
                            }
                        },
                        { $sort: { count: -1 } }
                    ],
                    extensions: [
                        {
                            $group: {
                                _id: { $toLower: { $ifNull: ["$file.fileExtension", "unknown"] } },
                                count: { $sum: 1 },
                                size: { $sum: "$file.size" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                count: 1,
                                size: 1
                            }
                        },
                        { $sort: { count: -1 } }
                    ]
                }
            }
        ]);

        return {
            categories: aggregationResults[0].categories || [],
            extensions: aggregationResults[0].extensions || []
        };

    } catch (error: any) {
        throw new AppError(`Failed to fetch file metrics: ${error.message}`, 500);
    }
}

// ============================================
// Get Activity Trends (Today/Week/Month)
// ============================================

export async function getActivityTrends(userId: string): Promise<ActivityTrend> {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

        // Week logic (Monday start)
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay() || 7;
        if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
        const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfWeek); endOfLastWeek.setMilliseconds(-1);
        // Month logic
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(startOfMonth); endOfLastMonth.setMilliseconds(-1);
        // Single Aggregation for all periods
        const results = await DownloadEvent.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $facet: {
                    today: [{ $match: { downloadedAt: { $gte: today } } }, { $count: "count" }],
                    yesterday: [{ $match: { downloadedAt: { $gte: yesterday, $lt: today } } }, { $count: "count" }],

                    week: [{ $match: { downloadedAt: { $gte: startOfWeek } } }, { $count: "count" }],
                    lastWeek: [{ $match: { downloadedAt: { $gte: startOfLastWeek, $lte: endOfLastWeek } } }, { $count: "count" }],

                    month: [{ $match: { downloadedAt: { $gte: startOfMonth } } }, { $count: "count" }],
                    lastMonth: [{ $match: { downloadedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $count: "count" }]
                }
            }
        ]);
        const data = results[0];

        const getCount = (key: string) => data[key][0]?.count || 0;
        const todayCount = getCount('today');
        const yesterdayCount = getCount('yesterday');

        const weekCount = getCount('week');
        const lastWeekCount = getCount('lastWeek');

        const monthCount = getCount('month');
        const lastMonthCount = getCount('lastMonth');
        return {
            today: { count: todayCount, change: todayCount - yesterdayCount },
            week: { count: weekCount, change: weekCount - lastWeekCount },
            month: { count: monthCount, change: monthCount - lastMonthCount }
        };
    } catch (error: any) {
        throw new AppError(`Failed to fetch activity trends: ${error.message}`, 500);
    }
}

// ============================================
// Get Daily Activity Heatmap (35 Days)
// ============================================
export async function getDailyActivity(userId: string): Promise<DailyActivity[]> {
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 35); // Last 35 days
        start.setHours(0, 0, 0, 0);
        const activity = await DownloadEvent.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    downloadedAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" } },
                    total: { $sum: 1 },
                    unique: {
                        $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] }
                    },
                    duplicate: {
                        $sum: { $cond: [{ $eq: ["$status", "duplicate"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return activity.map(item => ({
            date: item._id,
            total: item.total,
            unique: item.unique,
            duplicate: item.duplicate
        }));
    } catch (error: any) {
        throw new AppError(`Failed to fetch daily activity: ${error.message}`, 500);
    }
}

// ============================================
// Get Habits (Streak, Peak Hour/Day)
// ============================================

export async function getHabits(userId: string): Promise<HabitsData> {
    try {
        const events = await DownloadEvent.find({ userId: new mongoose.Types.ObjectId(userId) })
            .select('downloadedAt')
            .sort({ downloadedAt: 1 })
            .lean();

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setHours(0, 0, 0, 0);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        // --- Peak Hour (This Week) ---
        const thisWeekEvents = events.filter((e: any) => new Date(e.downloadedAt) >= startOfWeek);
        const weeklyHourCounts: Record<number, { count: number; latestDate: Date }> = {};

        thisWeekEvents.forEach((e: any) => {
            const date = new Date(e.downloadedAt);
            const hour = date.getHours();
            if (!weeklyHourCounts[hour]) {
                weeklyHourCounts[hour] = { count: 0, latestDate: date };
            }
            weeklyHourCounts[hour].count++;
            if (date > weeklyHourCounts[hour].latestDate) {
                weeklyHourCounts[hour].latestDate = date;
            }
        });

        let mostActiveHour: number | null = null;
        let mostActiveHourDate: Date | null = null;

        if (Object.keys(weeklyHourCounts).length > 0) {
            const sortedHours = Object.entries(weeklyHourCounts).sort((a, b) => {
                const [, dataA] = a;
                const [, dataB] = b;
                if (dataB.count !== dataA.count) return dataB.count - dataA.count;
                return dataB.latestDate.getTime() - dataA.latestDate.getTime();
            });
            const [hour, data] = sortedHours[0];
            mostActiveHour = parseInt(hour);
            mostActiveHourDate = data.latestDate;
        }

        // --- Peak Day (This Week) ---
        const dayOfWeekCounts: Record<string, { count: number; latestDate: Date }> = {};
        thisWeekEvents.forEach((e: any) => {
            const date = new Date(e.downloadedAt);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

            if (!dayOfWeekCounts[dayName]) {
                dayOfWeekCounts[dayName] = { count: 0, latestDate: date };
            }
            dayOfWeekCounts[dayName].count++;
            if (date > dayOfWeekCounts[dayName].latestDate) {
                dayOfWeekCounts[dayName].latestDate = date;
            }
        });

        let mostActiveDay = 'N/A';
        if (Object.keys(dayOfWeekCounts).length > 0) {
            const sortedDays = Object.entries(dayOfWeekCounts).sort((a, b) => {
                const [, dataA] = a;
                const [, dataB] = b;
                if (dataB.count !== dataA.count) return dataB.count - dataA.count;
                return dataB.latestDate.getTime() - dataA.latestDate.getTime();
            });
            const [day] = sortedDays[0];
            mostActiveDay = day;
        }

        // --- Streaks ---
        const uniqueDates = Array.from(new Set(events.map((e: any) => new Date(e.downloadedAt).toDateString())))
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

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
            } else {
                tempStreak = 1;
            }

            if (tempStreak > longestStreak) longestStreak = tempStreak;
        }

        const lastDownloadDateStr = uniqueDates[uniqueDates.length - 1];
        if (lastDownloadDateStr) {
            const lastDownloadDate = new Date(lastDownloadDateStr);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const yesterdayDate = new Date(todayDate);
            yesterdayDate.setDate(todayDate.getDate() - 1);

            const lastDateMidnight = new Date(lastDownloadDate);
            lastDateMidnight.setHours(0, 0, 0, 0); // Normalize to midnight

            // Current streak is valid if last download was today or yesterday
            if (lastDateMidnight.getTime() === todayDate.getTime() || lastDateMidnight.getTime() === yesterdayDate.getTime()) {
                currentStreak = tempStreak;
            } else {
                currentStreak = 0;
            }
        }

        return {
            mostActiveHour,
            mostActiveHourDate,
            mostActiveDay,
            currentStreak,
            longestStreak
        };

    } catch (error: any) {
        throw new AppError(`Failed to fetch habits: ${error.message}`, 500);
    }
}

// ============================================
// Get user statistics
// ============================================

// getUserStats removed as it's replaced by granular endpoints

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
                _id: event._id.toString(),
                status: event.status,
                downloadedAt: new Date(event.downloadedAt),
                duration: event.duration,
                fileId: file._id.toString(),
                filename: file.filename,
                url: file.url,
                hash: file.hash,
                size: file.size,
                fileExtension: file.fileExtension,
                fileCategory: file.fileCategory,
                mimeType: file.mimeType,
                sourceDomain: file.sourceDomain,
                fileCreatedAt: new Date(file.createdAt),
                fileUpdatedAt: new Date(file.updatedAt)
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
                _id: event._id.toString(),
                status: event.status,
                downloadedAt: new Date(event.downloadedAt),
                duration: event.duration,
                fileId: file._id.toString(),
                filename: file.filename,
                url: file.url,
                hash: file.hash,
                size: file.size,
                fileExtension: file.fileExtension,
                fileCategory: file.fileCategory,
                mimeType: file.mimeType,
                sourceDomain: file.sourceDomain,
                fileCreatedAt: new Date(file.createdAt),
                fileUpdatedAt: new Date(file.updatedAt)
            }
        })
    } catch (error: any) {
        throw new AppError(`Failed to fetch duplicate downloads: ${error.message}`, 500)
    }
}

// ============================================
// Get Source Statistics
// ============================================
export async function getSourceStats(userId: string): Promise<SourceStats> {
    try {
        const allFiles = await File.find({ userId }).lean();

        const domainCounts: Record<string, number> = {};
        allFiles.forEach(f => {
            if (f.sourceDomain) {
                domainCounts[f.sourceDomain] = (domainCounts[f.sourceDomain] || 0) + 1;
            }
        });

        const topSources = Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([domain, count]) => ({ domain, count }));

        const mostDownloadedDomain = topSources[0]?.domain || null;

        return {
            topSources,
            downloadsByDomain: domainCounts,
            mostDownloadedDomain
        };
    } catch (error: any) {
        throw new AppError(`Failed to fetch source statistics: ${error.message}`, 500);
    }
}

// ============================================
// Get Size Statistics
// ============================================
export async function getSizeStats(userId: string): Promise<SizeStats> {
    try {
        const [allEvents, allFiles] = await Promise.all([
            DownloadEvent.find({ userId }).lean(),
            File.find({ userId }).lean()
        ]);

        const filesWithSize = allFiles.filter(f => f.size && f.size > 0);
        const totalSize = filesWithSize.reduce((sum, f) => sum + (f.size || 0), 0);
        const averageFileSize = filesWithSize.length > 0 ? totalSize / filesWithSize.length : 0;

        const largestFile = filesWithSize.length > 0
            ? filesWithSize.reduce((max, f) => (f.size! > (max.size || 0) ? f : max))
            : null;

        const smallestFile = filesWithSize.length > 0
            ? filesWithSize.reduce((min, f) => {
                const minSize = min.size || Number.MAX_SAFE_INTEGER;
                const fSize = f.size || Number.MAX_SAFE_INTEGER;
                return fSize < minSize ? f : min;
            })
            : null;

        const duplicateEvents = allEvents.filter(e => e.status === 'duplicate');
        const duplicateSize = duplicateEvents.reduce((sum, e) => {
            const file = allFiles.find(f => f._id.toString() === e.fileId.toString());
            return sum + (file?.size || 0);
        }, 0);

        const totalStorageUsed = totalSize + duplicateSize;
        const potentialSavingsPercent = totalStorageUsed > 0
            ? (duplicateSize / totalStorageUsed) * 100
            : 0;

        return {
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
        };
    } catch (error: any) {
        throw new AppError(`Failed to fetch size statistics: ${error.message}`, 500);
    }
}

// getAdvancedStats removed
