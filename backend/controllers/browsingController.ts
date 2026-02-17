import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import {
    ingestVisits,
    getSummary,
    getTrends,
    getDailyActivity,
    getHabits,
    getTopSites,
    getTodayByDomain,
    getPeriodStats,
    getRecentVisits,
} from '../services/browsingService.js'

export const ingestEventsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const body = req.body as { events?: Array<{ domain: string; startTime: string; endTime: string; durationSeconds: number }> }
    const events = body.events ?? []
    const result = await ingestVisits(userId, events)
    res.json({ success: true, data: result })
})

export const getSummaryController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getSummary(userId)
    res.json({ success: true, data })
})

export const getTrendsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getTrends(userId)
    res.json({ success: true, data })
})

export const getActivityController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getDailyActivity(userId)
    res.json({ success: true, data })
})

export const getHabitsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getHabits(userId)
    res.json({ success: true, data })
})

export const getTopSitesController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const domains = await getTopSites(userId)
    res.json({ success: true, data: { domains } })
})

export const getTodayByDomainController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getTodayByDomain(userId)
    res.json({ success: true, data })
})

export const getPeriodStatsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getPeriodStats(userId)
    res.json({ success: true, data })
})

export const getRecentVisitsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const limit = Math.min(Number(req.query.limit) || 10, 50)
    const data = await getRecentVisits(userId, limit)
    res.json({ success: true, data })
})