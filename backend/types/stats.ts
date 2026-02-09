export interface DownloadPayload {
    filename: string;
    url: string;
    hash: string;
    size?: number;
    fileExtension?: string;
    mimeType?: string;
    sourceDomain?: string;
    fileCategory?: string;
    duration?: number;
    status: 'new' | 'duplicate'
}

export interface DailyActivity {
    date: string;
    total: number;
    unique: number;
    duplicate: number;
}

export interface TimeBasedStats {
    downloadsToday: number
    downloadsYesterday: number
    downloadsThisWeek: number
    downloadsPreviousWeek: number
    downloadsThisMonth: number
    downloadsPreviousMonth: number
    averagePerDay: number
    mostActiveHour: number | null
    mostActiveHourDate?: Date | null
    mostActiveDay: string
    firstDownloadDate: Date | null
    firstDownloadFile?: { filename: string, size: number } | null
    currentStreak: number;
    longestStreak: number;
}

export interface SizeStats {
    averageFileSize: number
    largestFile: {
        filename: string
        size: number
    } | null
    smallestFile: {
        filename: string
        size: number
    } | null
    totalStorageUsed: number
    potentialSavingsPercent: number
}

export interface SourceStats {
    topSources: Array<{ domain: string; count: number }>
    downloadsByDomain: Record<string, number>
    mostDownloadedDomain: string | null
}

export interface DownloadHistoryFilter {
    status?: 'new' | 'duplicate';
    fileCategory?: string;
    fileExtension?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    fileId?: string;
    eventId?: string;
    hour?: number;
}

export interface SummaryMetrics {
    totalDownloads: number;
    newDownloads: number;
    duplicateDownloads: number;
    totalSize: number;
    newSize: number;
    duplicateSize: number;
}

export interface DownloadHistoryItem {
    _id: string;
    status: 'new' | 'duplicate';
    downloadedAt: Date;
    duration?: number;

    fileId: string;
    filename: string;
    url: string;
    hash: string;
    size: number;
    fileExtension?: string;
    fileCategory?: string;
    mimeType?: string;
    sourceDomain?: string;
    fileCreatedAt: Date;
    fileUpdatedAt: Date;
}

export interface TrendMetric {
    count: number;
    change: number;
}

export interface ActivityTrend {
    today: TrendMetric;
    week: TrendMetric;
    month: TrendMetric;
}

export interface HabitsData {
    mostActiveHour: number | null;
    mostActiveHourDate: Date | null;
    mostActiveHourCount: number | null;
    mostActiveDay: string;
    mostActiveDayCount: number | null;
    currentStreak: number;
    longestStreak: number;
}

export interface FileMetricItem {
    name: string;
    count: number;
    size: number;
}

export interface FileMetrics {
    categories: FileMetricItem[];
    extensions: FileMetricItem[];
}