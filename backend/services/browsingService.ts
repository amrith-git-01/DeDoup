import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { BrowsingVisit } from '../models/BrowsingVisit.js';
import { BrowsingDomain } from '../models/BrowsingDomain.js';
import type {
    BrowsingVisitPayload,
    BrowsingDailyActivity,
    BrowsingHabits,
    TopSiteItem,
    TodayByDomainItem,
    BrowsingOverview,
    RecentVisitItem,
    VisitHistoryResponse,
} from '../types/browsing.js'

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function startOfWeek(d: Date) {
    const x = new Date(d);
    const day = x.getDay() || 7;
    if (day !== 1) {
        x.setDate(x.getDate() - (day - 1))
    }
    x.setHours(0, 0, 0, 0);
    return x;
}

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

export async function ingestVisits(userId: string, events: BrowsingVisitPayload[]) {
    if (!events?.length) return { inserted: 0 }

    const uid = toObjectId(userId)

    const valid = events.filter(
        (e) => e.domain && e.durationSeconds > 0 && e.startTime && e.endTime
    )

    if (valid.length === 0) {
        return { inserted: 0 };
    }

    const uniqueDomains = [...new Set(valid.map((e) => e.domain))]

    const domainIds: Record<string, mongoose.Types.ObjectId> = {}

    for (const domain of uniqueDomains) {
        const doc = await BrowsingDomain.findOneAndUpdate(
            { userId: userId, domain },
            { $setOnInsert: { userId: uid, domain } },
            { upsert: true, new: true }
        )
        domainIds[domain] = doc._id
    }

    const visits = valid.map((e) => ({
        userId: uid,
        domainId: domainIds[e.domain],
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime),
        durationSeconds: e.durationSeconds,
        clickLinkCount: e.clickLinkCount ?? 0,
        clickButtonCount: e.clickButtonCount ?? 0,
        clickOtherCount: e.clickOtherCount ?? 0,
        scrollCount: e.scrollCount ?? 0,
        keyEventCount: e.keyEventCount ?? 0,
    }))

    await BrowsingVisit.insertMany(visits)
    return { inserted: visits.length }
}

export async function getTodayByDomain(
    userId: string,
    options?: { startDate: Date; endDate: Date }
): Promise<TodayByDomainItem[]> {
    const uid = toObjectId(userId)
    let startTime: Date
    let endTime: Date | undefined
    if (options?.startDate != null && options?.endDate != null) {
        startTime = options.startDate
        endTime = options.endDate
    } else {
        const now = new Date()
        startTime = startOfDay(now)
    }
    const matchFilter: Record<string, unknown> = { userId: uid }
    if (endTime != null) {
        matchFilter.startTime = { $gte: startTime, $lte: endTime }
    } else {
        matchFilter.startTime = { $gte: startTime }
    }
    const rows = await BrowsingVisit.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: '$domainId',
                totalSeconds: { $sum: '$durationSeconds' },
                visitCount: { $sum: 1 },
            },
        },
        { $sort: { totalSeconds: -1 } },
        { $limit: 30 },
        {
            $lookup: {
                from: 'browsingdomains',
                localField: '_id',
                foreignField: '_id',
                as: 'domainDoc',
            },
        },
        { $unwind: '$domainDoc' },
        {
            $project: {
                domain: '$domainDoc.domain',
                totalSeconds: 1,
                visitCount: 1,
                _id: 0,
            },
        },
    ])
    return rows.map((r) => ({
        domain: r.domain ?? '',
        totalSeconds: r.totalSeconds,
        visitCount: r.visitCount ?? 0,
    }))

}

/** Single-call overview for Screen Time Overview (today, yesterday, week, month + comparisons) */
export async function getScreenTimeOverview(userId: string): Promise<BrowsingOverview> {
    const now = new Date()
    const todayStart = startOfDay(now)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayStart)
    yesterdayEnd.setMilliseconds(-1)
    const weekStart = startOfWeek(now)
    const prevWeekStart = new Date(weekStart)
    prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    const prevWeekEnd = new Date(weekStart)
    prevWeekEnd.setMilliseconds(-1)
    const monthStart = startOfMonth(now)
    const prevMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1)
    const prevMonthEnd = new Date(monthStart)
    prevMonthEnd.setMilliseconds(-1)
    const uid = toObjectId(userId)

    const runPeriod = async (start: Date, end: Date) => {
        const rows = await BrowsingVisit.aggregate([
            {
                $match: {
                    userId: uid,
                    startTime: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSeconds: { $sum: '$durationSeconds' },
                    visitCount: { $sum: 1 },
                    domainIds: { $addToSet: '$domainId' },
                },
            },
            { $project: { totalSeconds: 1, visitCount: 1, siteCount: { $size: '$domainIds' } } },
        ])
        const r = rows[0]
        return {
            totalSeconds: r?.totalSeconds ?? 0,
            visitCount: r?.visitCount ?? 0,
            siteCount: r?.siteCount ?? 0,
        }
    }

    const [today, yesterday, week, prevWeek, month, prevMonth] = await Promise.all([
        runPeriod(todayStart, now),
        runPeriod(yesterdayStart, yesterdayEnd),
        runPeriod(weekStart, now),
        runPeriod(prevWeekStart, prevWeekEnd),
        runPeriod(monthStart, now),
        runPeriod(prevMonthStart, prevMonthEnd),
    ])

    return { today, yesterday, week, prevWeek, month, prevMonth }
}

export async function getDailyActivity(userId: string): Promise<BrowsingDailyActivity[]> {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    start.setHours(0, 0, 0, 0)
    const uid = toObjectId(userId)
    const rows = await BrowsingVisit.aggregate([
        { $match: { userId: uid, startTime: { $gte: start } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                totalSeconds: { $sum: '$durationSeconds' },
                visitCount: { $sum: 1 },
                domainIds: { $addToSet: '$domainId' },
            },
        },
        {
            $project: {
                _id: 1,
                totalSeconds: 1,
                visitCount: 1,
                siteCount: { $size: '$domainIds' },
            },
        },
        { $sort: { _id: 1 } },
    ])
    return rows.map((r) => ({
        date: r._id,
        totalSeconds: r.totalSeconds,
        visitCount: r.visitCount,
        siteCount: r.siteCount ?? 0,
    }))
}

export async function getHabits(userId: string): Promise<BrowsingHabits> {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const uid = toObjectId(userId)
    const visits = await BrowsingVisit.find({ userId: uid, startTime: { $gte: weekStart } })
        .select('startTime durationSeconds')
        .lean()
    const byHour: Record<number, number> = {}
    const byDay: Record<string, number> = {}
    visits.forEach((v: any) => {
        const d = new Date(v.startTime)
        const h = d.getHours()
        const day = d.toLocaleDateString('en-US', { weekday: 'long' })
        byHour[h] = (byHour[h] ?? 0) + v.durationSeconds
        byDay[day] = (byDay[day] ?? 0) + v.durationSeconds
    })
    let mostActiveHour: number | null = null
    let mostActiveHourSeconds: number | null = null
    let mostActiveHourDate: string | null = null
    if (Object.keys(byHour).length > 0) {
        const [hour] = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]
        mostActiveHour = parseInt(hour, 10)
        mostActiveHourSeconds = byHour[mostActiveHour]
        const sample = visits.find((v: any) => new Date(v.startTime).getHours() === mostActiveHour)
        mostActiveHourDate = sample ? new Date(sample.startTime).toISOString() : null
    }
    let mostActiveDay = 'N/A'
    let mostActiveDaySeconds: number | null = null
    if (Object.keys(byDay).length > 0) {
        const [day] = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]
        mostActiveDay = day
        mostActiveDaySeconds = byDay[day]
    }
    return {
        mostActiveHour,
        mostActiveHourDate,
        mostActiveHourSeconds,
        mostActiveDay,
        mostActiveDaySeconds,
    }
}

export async function getTopSites(userId: string): Promise<TopSiteItem[]> {
    const uid = toObjectId(userId)
    const rows = await BrowsingVisit.aggregate([
        { $match: { userId: uid } },
        {
            $group: {
                _id: '$domainId',
                totalSeconds: { $sum: '$durationSeconds' },
                visitCount: { $sum: 1 },
            },
        },
        { $sort: { totalSeconds: -1 } },
        { $limit: 50 },
        {
            $lookup: {
                from: 'browsingdomains',
                localField: '_id',
                foreignField: '_id',
                as: 'domainDoc',
            },
        },
        { $unwind: '$domainDoc' },
        {
            $project: {
                domain: '$domainDoc.domain',
                totalSeconds: 1,
                visitCount: 1,
                _id: 0,
            },
        },
    ])
    return rows.map((r) => ({
        domain: r.domain ?? '',
        totalSeconds: r.totalSeconds,
        visitCount: r.visitCount,
    }))
}

export async function getRecentVisits(
    userId: string,
    limit = 10
): Promise<RecentVisitItem[]> {
    const uid = toObjectId(userId)
    const rows = await BrowsingVisit.aggregate([
        { $match: { userId: uid } },
        { $sort: { endTime: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'browsingdomains',
                localField: 'domainId',
                foreignField: '_id',
                as: 'domainDoc',
            },
        },
        { $unwind: '$domainDoc' },
        {
            $project: {
                domain: '$domainDoc.domain',
                durationSeconds: 1,
                endTime: 1,
                clickLinkCount: 1,
                clickButtonCount: 1,
                clickOtherCount: 1,
                scrollCount: 1,
                keyEventCount: 1,
                _id: 0,
            },
        },
    ])
    return rows.map((r) => ({
        domain: r.domain ?? '',
        durationSeconds: r.durationSeconds,
        endTime: r.endTime instanceof Date ? r.endTime.toISOString() : String(r.endTime),
        ...(r.clickLinkCount != null && { clickLinkCount: r.clickLinkCount }),
        ...(r.clickButtonCount != null && { clickButtonCount: r.clickButtonCount }),
        ...(r.clickOtherCount != null && { clickOtherCount: r.clickOtherCount }),
        ...(r.scrollCount != null && { scrollCount: r.scrollCount }),
        ...(r.keyEventCount != null && { keyEventCount: r.keyEventCount }),
    }))
}

export interface VisitHistoryParams {
    domain?: string
    startDate?: string
    endDate?: string
    excludeDomains?: string[]
    page?: number
    limit?: number
}

export async function getVisitHistory(
    userId: string,
    params: VisitHistoryParams = {}
): Promise<VisitHistoryResponse> {
    const { domain, startDate, endDate, excludeDomains = [], page = 1, limit = 20 } = params
    const uid = toObjectId(userId)
    const skip = Math.max(0, (Math.max(1, page) - 1) * Math.min(50, Math.max(1, limit)))
    const limitNum = Math.min(50, Math.max(1, limit))

    const matchBase: Record<string, unknown> = { userId: uid }
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date(8640000000000000)
        matchBase.startTime = { $gte: start, $lte: end }
    }

    const pipeline: mongoose.PipelineStage[] = [
        { $match: matchBase },
        {
            $lookup: {
                from: 'browsingdomains',
                localField: 'domainId',
                foreignField: '_id',
                as: 'domainDoc',
            },
        },
        { $unwind: '$domainDoc' },
        { $addFields: { domain: '$domainDoc.domain' } },
    ]

    const matchAfterLookup: Record<string, unknown> = {}
    if (domain) matchAfterLookup.domain = domain
    if (excludeDomains.length > 0) matchAfterLookup.domain = { $nin: excludeDomains }
    if (Object.keys(matchAfterLookup).length > 0) {
        pipeline.push({ $match: matchAfterLookup })
    }

    pipeline.push(
        { $sort: { endTime: -1 } },
        {
            $facet: {
                count: [{ $count: 'total' }],
                items: [
                    { $skip: skip },
                    { $limit: limitNum },
                    {
                        $lookup: {
                            from: 'downloadevents',
                            let: { vStart: '$startTime', vEnd: '$endTime', vUserId: '$userId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$userId', '$$vUserId'] },
                                                { $gte: ['$downloadedAt', '$$vStart'] },
                                                { $lte: ['$downloadedAt', '$$vEnd'] },
                                            ],
                                        },
                                    },
                                },
                                { $sort: { downloadedAt: -1 } },
                                {
                                    $lookup: {
                                        from: 'files',
                                        localField: 'fileId',
                                        foreignField: '_id',
                                        as: 'fileDoc',
                                    },
                                },
                                { $unwind: { path: '$fileDoc', preserveNullAndEmptyArrays: true } },
                                {
                                    $project: {
                                        _id: { $toString: '$_id' },
                                        status: 1,
                                        downloadedAt: 1,
                                        filename: '$fileDoc.filename',
                                        size: '$fileDoc.size',
                                        fileExtension: '$fileDoc.fileExtension',
                                        fileCategory: '$fileDoc.fileCategory',
                                    },
                                },
                            ],
                            as: 'downloads',
                        },
                    },
                    {
                        $project: {
                            domain: 1,
                            durationSeconds: 1,
                            endTime: 1,
                            clickLinkCount: 1,
                            clickButtonCount: 1,
                            clickOtherCount: 1,
                            scrollCount: 1,
                            keyEventCount: 1,
                            downloads: 1,
                            _id: 0,
                        },
                    },
                ],
            },
        }
    )

    const result = await BrowsingVisit.aggregate<{
        count: { total: number }[]
        items: {
            domain: string
            durationSeconds: number
            endTime: Date
            clickLinkCount?: number
            clickButtonCount?: number
            clickOtherCount?: number
            scrollCount?: number
            keyEventCount?: number
            downloads?: { _id: string; status: string; downloadedAt: Date; filename: string; size: number; fileExtension?: string; fileCategory?: string }[]
        }[]

    }>(pipeline)
    const first = result[0]
    const total = first?.count?.[0]?.total ?? 0
    const items = (first?.items ?? []).map((r) => ({
        domain: r.domain ?? '',
        durationSeconds: r.durationSeconds,
        endTime: r.endTime instanceof Date ? r.endTime.toISOString() : String(r.endTime),
        ...(r.clickLinkCount != null && { clickLinkCount: r.clickLinkCount }),
        ...(r.clickButtonCount != null && { clickButtonCount: r.clickButtonCount }),
        ...(r.clickOtherCount != null && { clickOtherCount: r.clickOtherCount }),
        ...(r.scrollCount != null && { scrollCount: r.scrollCount }),
        ...(r.keyEventCount != null && { keyEventCount: r.keyEventCount }),
        downloads: (r.downloads ?? []).map((d: any) => ({
            _id: d._id,
            status: d.status,
            downloadedAt: d.downloadedAt instanceof Date ? d.downloadedAt.toISOString() : String(d.downloadedAt),
            filename: d.filename ?? '',
            size: d.size ?? 0,
            ...(d.fileExtension && { fileExtension: d.fileExtension }),
            ...(d.fileCategory && { fileCategory: d.fileCategory }),
        })),
    }))
    return { items, total }
}