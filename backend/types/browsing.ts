// DTOs for API request/response

export interface BrowsingVisitPayload {
    domain: string
    startTime: string
    endTime: string
    durationSeconds: number
    clickLinkCount?: number
    clickButtonCount?: number
    clickOtherCount?: number
    scrollCount?: number
    keyEventCount?: number
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

/** Single-call overview for Screen Time Overview section (today, yesterday, week, month + comparisons) */
export interface BrowsingOverview {
    today: BrowsingPeriodMetric
    yesterday: BrowsingPeriodMetric
    week: BrowsingPeriodMetric
    prevWeek: BrowsingPeriodMetric
    month: BrowsingPeriodMetric
    prevMonth: BrowsingPeriodMetric
}

export interface RecentVisitItem {
    domain: string
    durationSeconds: number
    endTime: string
    clickLinkCount?: number
    clickButtonCount?: number
    clickOtherCount?: number
    scrollCount?: number
    keyEventCount?: number
    downloads?: VisitDownloadItem[]
}

/** Paginated visit history for details drawer */
export interface VisitHistoryResponse {
    items: RecentVisitItem[]
    total: number
}

export interface VisitDownloadItem {
    _id: string
    status: 'new' | 'duplicate'
    downloadedAt: string
    filename: string
    size: number
    fileExtension?: string
    fileCategory?: string
}