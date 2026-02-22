import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'
import {
    ingestVisits,
    getScreenTimeOverview,
    getDailyActivity,
    getHabits,
    getTopSites,
    getTodayByDomain,
    getRecentVisits,
    getVisitHistory,
} from '../services/browsingService.js'

export const ingestEventsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const body = req.body as { events?: Array<{ domain: string; startTime: string; endTime: string; durationSeconds: number }> }
    const events = body.events ?? []
    const result = await ingestVisits(userId, events)
    res.json({ success: true, data: result })
})

export const getOverviewController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const data = await getScreenTimeOverview(userId)
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

export const getRecentVisitsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const limit = Math.min(Number(req.query.limit) || 10, 50)
    const data = await getRecentVisits(userId, limit)
    res.json({ success: true, data })
})

export const getVisitHistoryController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined
    const excludeParam = req.query.excludeDomains
    const excludeDomains = Array.isArray(excludeParam)
        ? excludeParam.filter((x): x is string => typeof x === 'string')
        : typeof excludeParam === 'string'
          ? excludeParam.split(',').map((s) => s.trim()).filter(Boolean)
          : []
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const data = await getVisitHistory(userId, {
        domain,
        startDate,
        endDate,
        excludeDomains: excludeDomains.length ? excludeDomains : undefined,
        page,
        limit,
    })
    res.json({ success: true, data })
})