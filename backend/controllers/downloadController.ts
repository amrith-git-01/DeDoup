import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import { DownloadEvent } from '../models/DownloadEvent.js'
import { File } from '../models/File.js'
import {
    getDownloadHistory,
    getDuplicateDownloads,
    getSummaryMetrics,
    getActivityTrends,
    getDailyActivity,
    getHabits,
    getFileMetrics,
    getSourceStats,
    getSizeStats
} from '../services/downloadService.js'

// ============================================
// Get Summary Metrics
// ============================================
export const getSummaryMetricsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }
    const metrics = await getSummaryMetrics(userId)
    res.json({
        success: true,
        data: metrics
    })
})

// ============================================
// Get Activity Trends (Today, Week, Month)
// ============================================
export const getTrendsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }
    const trends = await getActivityTrends(userId)
    res.json({
        success: true,
        data: trends
    })
})

// ============================================
// Get Daily Activity Breakdown (Heatmap)
// ============================================
export const getActivityController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }
    const activity = await getDailyActivity(userId)
    res.json({
        success: true,
        data: activity
    })
})

// ============================================
// Get Download Habits
// ============================================
export const getHabitsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }
    const habits = await getHabits(userId);
    res.json({
        success: true,
        data: habits
    })
})

// ============================================
// Get File Metrics (Categories & Extensions)
// ============================================
export const getFileMetricsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const filters = req.query as any;

    if (!userId) {
        throw new AppError('Unauthorized', 401);
    }

    const metrics = await getFileMetrics(userId, filters);
    res.json({ success: true, data: metrics });
});

// ============================================
// Get Source Stats
// ============================================
export const getSourceStatsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError('Unauthorized', 401);
    }
    const stats = await getSourceStats(userId);
    res.json({ success: true, data: stats });
});

// ============================================
// Get Size Stats
// ============================================
export const getSizeStatsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError('Unauthorized', 401);
    }
    const stats = await getSizeStats(userId);
    res.json({ success: true, data: stats });
});

// ============================================
// Track Download (with duplicate detection)
// ============================================

export const trackDownloadController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    const { filename, url, hash, size, fileCategory, fileExtension, mimeType, duration } = req.body

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    if (!filename || !url || !hash) {
        throw new AppError('Missing required fields', 400)
    }

    // Process source domain from URL
    let sourceDomain = 'unknown';
    try {
        sourceDomain = new URL(url).hostname;
    } catch (e) {
        // fallback to unknown
    }

    // Check if file exists
    let file = await File.findOne({ hash, userId })
    let status: 'new' | 'duplicate' = 'new'

    if (file) {
        status = 'duplicate'
    } else {
        file = await File.create({
            userId,
            filename,
            url,
            hash,
            size,
            fileCategory,
            fileExtension,
            mimeType,
            sourceDomain
        })
    }

    // Record the event
    const event = await DownloadEvent.create({
        userId,
        fileId: file._id,
        status,
        duration,
        downloadedAt: new Date()
    })

    res.json({
        success: true,
        data: {
            event,
            file
        }
    })
})

// getStatsController removed

// ============================================
// Get Download History
// ============================================

export const getHistoryController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    // Extract filters
    const filters = {
        status: req.query.status as any,
        fileCategory: req.query.fileCategory as string,
        fileExtension: req.query.fileExtension as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
        fileId: req.query.fileId as string
    }

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const result = await getDownloadHistory(userId, limit, (page - 1) * limit, filters)

    res.json({
        success: true,
        data: result.history,
        pagination: {
            current: page,
            pages: Math.ceil(result.total / limit),
            total: result.total,
            limit
        }
    })
})

// ============================================
// Get Duplicate History
// ============================================

export const getDuplicatesController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const duplicates = await getDuplicateDownloads(userId)

    res.json({
        success: true,
        data: duplicates
    })
})