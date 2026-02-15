import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { BrowsingVisit } from '../models/BrowsingVisit.js';
import { BrowsingDomain } from '../models/BrowsingDomain.js';
import type {
    BrowsingVisitPayload,
    BrowsingSummary,
    BrowsingTrends,
    BrowsingDailyActivity,
    BrowsingHabits,
    TopSiteItem,
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
    }))

    await BrowsingVisit.insertMany(visits)
    return { inserted: visits.length }
}

export async function getSummary(userId: string): Promise<BrowsingSummary> {
    const now = new Date()
    const today = startOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)
    const uid = toObjectId(userId)
    const [todayRes, weekRes, monthRes] = await Promise.all([
        BrowsingVisit.aggregate([
            { $match: { userId: uid, startTime: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
        ]),
        BrowsingVisit.aggregate([
            { $match: { userId: uid, startTime: { $gte: weekStart } } },
            { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
        ]),
        BrowsingVisit.aggregate([
            { $match: { userId: uid, startTime: { $gte: monthStart } } },
            { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
        ]),
    ])
    return {
        totalSecondsToday: todayRes[0]?.total ?? 0,
        totalSecondsWeek: weekRes[0]?.total ?? 0,
        totalSecondsMonth: monthRes[0]?.total ?? 0,
    }
}

export async function getTrends(userId: string): Promise<BrowsingTrends> {
    const now = new Date()
    const today = startOfDay(now)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekStart = startOfWeek(now)
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const endLastWeek = new Date(weekStart)
    endLastWeek.setMilliseconds(-1)
    const monthStart = startOfMonth(now)
    const lastMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1)
    const endLastMonth = new Date(monthStart)
    endLastMonth.setMilliseconds(-1)
    const uid = toObjectId(userId)

    const result = await BrowsingVisit.aggregate([
        { $match: { userId: uid } },
        {
            $facet: {
                today: [
                    { $match: { startTime: { $gte: today } } },
                    { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
                ],
                yesterday: [
                    { $match: { startTime: { $gte: yesterday, $lt: today } } },
                    { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
                ],
                week: [
                    { $match: { startTime: { $gte: weekStart } } },
                    { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
                ],
                lastWeek: [
                    { $match: { startTime: { $gte: lastWeekStart, $lte: endLastWeek } } },
                    { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
                ],
                month: [
                    { $match: { startTime: { $gte: monthStart } } },
                    { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
                ],
                lastMonth: [
                    { $match: { startTime: { $gte: lastMonthStart, $lte: endLastMonth } } },
                    { $group: { _id: null, total: { $sum: '$durationSeconds' } } },
                ],
            },
        },
    ])
    const d = result[0]
    const get = (key: string) => d[key][0]?.total ?? 0
    return {
        today: { count: get('today'), change: get('today') - get('yesterday') },
        week: { count: get('week'), change: get('week') - get('lastWeek') },
        month: { count: get('month'), change: get('month') - get('lastMonth') },
    }
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
            },
        },
        { $sort: { _id: 1 } },
    ])
    return rows.map((r) => ({
        date: r._id,
        totalSeconds: r.totalSeconds,
        visitCount: r.visitCount,
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