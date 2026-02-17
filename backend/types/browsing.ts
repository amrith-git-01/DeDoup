// DTOs for API request/response

export interface BrowsingVisitPayload {
    domain: string
    startTime: string
    endTime: string
    durationSeconds: number
}

export interface BrowsingSummary {
    totalSecondsToday: number
    totalSecondsWeek: number
    totalSecondsMonth: number
}

export interface BrowsingTrendMetric {
    count: number  // seconds
    change: number
}

export interface BrowsingTrends {
    today: BrowsingTrendMetric
    week: BrowsingTrendMetric
    month: BrowsingTrendMetric
}

export interface BrowsingDailyActivity {
    date: string
    totalSeconds: number
    visitCount: number
    siteCount: number
}

export interface BrowsingHabits {
    mostActiveHour: number | null
    mostActiveHourDate: string | null
    mostActiveHourSeconds: number | null
    mostActiveDay: string
    mostActiveDaySeconds: number | null
}

export interface TopSiteItem {
    domain: string
    totalSeconds: number
    visitCount: number
}

export interface TopSitesResponse {
    domains: TopSiteItem[]
}

export interface TodayByDomainItem {
    domain: string
    visitCount: number
    totalSeconds: number
}

export interface BrowsingPeriodMetric {
    totalSeconds: number
    visitCount: number
    siteCount: number
}

export interface BrowsingPeriodStats {
    week: BrowsingPeriodMetric
    prevWeek: BrowsingPeriodMetric
    month: BrowsingPeriodMetric
    prevMonth: BrowsingPeriodMetric
}

export interface RecentVisitItem {
    domain: string
    durationSeconds: number
    endTime: string
}