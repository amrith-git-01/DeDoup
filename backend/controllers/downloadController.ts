// backend/controllers/downloadController.ts

import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import {
    findByHash,
    logDownload,
    getUserStats,
    getDownloadHistory,
    getDuplicateDownloads,
    getAdvancedStats
} from '../services/downloadService.js'

// ============================================
// Get Advanced Statistics
// ============================================
export const getAdvancedStatsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }
    const stats = await getAdvancedStats(userId)
    res.json({
        success: true,
        data: stats
    })
})

// ============================================
// Track Download (with duplicate detection)
// ============================================

export const trackDownloadController = asyncHandler(async (req: Request, res: Response) => {
    const { filename, url, hash, size, fileExtension, mimeType, sourceDomain, fileCategory, duration } = req.body
    const userId = req.user?.userId

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    if (!filename || !url || !hash) {
        throw new AppError('Filename, URL, and hash are required', 400)
    }

    console.log('📥 Tracking download:', filename)

    // Check if this is a duplicate
    const existingDownload = await findByHash(userId, hash)
    const isDuplicate = !!existingDownload

    // Log the download (mark as duplicate if needed)
    await logDownload(userId, {
        filename,
        url,
        hash,
        size,
        fileExtension,
        mimeType,
        sourceDomain,
        fileCategory,
        duration,
        status: isDuplicate ? 'duplicate' : 'new'
    })

    res.json({
        success: true,
        data: {
            isDuplicate,
            message: isDuplicate ? 'Duplicate download detected' : 'New download tracked',
            existingFile: existingDownload ? {
                filename: existingDownload.filename,
                url: existingDownload.url,
                downloadedAt: existingDownload.createdAt
            } : null
        }
    })
})

// ============================================
// Get User Statistics
// ============================================

export const getStatsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const stats = await getUserStats(userId)

    res.json({
        success: true,
        data: stats
    })
})

// ============================================
// Get Download History
// ============================================

export const getHistoryController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const limit = parseInt(req.query.limit as string) || 50
    const skip = parseInt(req.query.skip as string) || 0

    if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', 400)
    }

    if (skip < 0) {
        throw new AppError('Skip must be non-negative', 400)
    }

    const history = await getDownloadHistory(userId, limit, skip)

    res.json({
        success: true,
        data: {
            downloads: history,
            pagination: {
                limit,
                skip,
                count: history.length
            }
        }
    })
})

// ============================================
// Get Duplicate Downloads
// ============================================

export const getDuplicatesController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const limit = parseInt(req.query.limit as string) || 20

    if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', 400)
    }

    const duplicateDownloads = await getDuplicateDownloads(userId, limit)

    res.json({
        success: true,
        data: duplicateDownloads
    })
})