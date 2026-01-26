// backend/services/downloadService.ts

import { Download } from '../models/Download.js'

// ============================================
// Types
// ============================================

export interface DownloadPayload {
    filename: string
    url: string
    hash: string
    size?: number
    status: 'new' | 'duplicate'
}

export interface DownloadStats {
    totalDownloads: number
    uniqueDownloads: number
    duplicateDownloads: number
    totalSize: number
    uniqueFilesSize: number
    duplicateFilesSize: number
}

export interface DownloadHistoryItem {
    id: string
    filename: string
    url: string
    hash: string
    size?: number
    status: 'new' | 'duplicate'
    createdAt: Date
}

// ============================================
// Find download by hash
// ============================================

export async function findByHash(userId: string, hash: string) {
    return await Download.findOne({
        userId,
        hash,
        status: 'new' // Only match original downloads, not duplicates
    }).lean()
}

// ============================================
// Log a download
// ============================================

export async function logDownload(userId: string, payload: DownloadPayload) {
    const download = new Download({
        userId,
        filename: payload.filename,
        url: payload.url,
        hash: payload.hash,
        size: payload.size,
        status: payload.status
    })

    await download.save()
    return download
}

// ============================================
// Get user statistics
// ============================================

export async function getUserStats(userId: string): Promise<DownloadStats> {
    const allDownloads = await Download.find({ userId }).lean()

    const totalDownloads = allDownloads.length
    const uniqueDownloads = allDownloads.filter(d => d.status === 'new').length
    const duplicateDownloads = allDownloads.filter(d => d.status === 'duplicate').length

    // Calculate total size and saved space
    let totalSize = 0
    let uniqueFilesSize = 0
    let duplicateFilesSize = 0

    allDownloads.forEach(download => {
        if (download.size) {
            totalSize += download.size
            if (download.status === 'duplicate') {
                duplicateFilesSize += download.size
            } else {
                uniqueFilesSize += download.size
            }
        }
    })

    return {
        totalDownloads,
        uniqueDownloads,
        duplicateDownloads,
        totalSize,
        uniqueFilesSize,
        duplicateFilesSize
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
    const downloads = await Download.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean()

    return downloads.map(doc => ({
        id: doc._id.toString(),
        filename: doc.filename,
        url: doc.url,
        hash: doc.hash,
        size: doc.size,
        status: doc.status,
        createdAt: doc.createdAt
    }))
}

// ============================================
// Get recently blocked (duplicate) downloads
// ============================================

export async function getRecentlyBlocked(
    userId: string,
    limit: number = 10
): Promise<DownloadHistoryItem[]> {
    const downloads = await Download.find({
        userId,
        status: 'duplicate'
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()

    return downloads.map(doc => ({
        id: doc._id.toString(),
        filename: doc.filename,
        url: doc.url,
        hash: doc.hash,
        size: doc.size,
        status: doc.status,
        createdAt: doc.createdAt
    }))
}

// ============================================
// Get duplicate downloads
// ============================================

export async function getDuplicateDownloads(
    userId: string,
    limit: number = 20
): Promise<DownloadHistoryItem[]> {
    const downloads = await Download.find({
        userId,
        status: 'duplicate'
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()

    return downloads.map(doc => ({
        id: doc._id.toString(),
        filename: doc.filename,
        url: doc.url,
        hash: doc.hash,
        size: doc.size,
        status: doc.status,
        createdAt: doc.createdAt
    }))
}