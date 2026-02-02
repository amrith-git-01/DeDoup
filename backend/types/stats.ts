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

export interface DownloadStats {
    totalDownloads: number;
    uniqueDownloads: number;
    duplicateDownloads: number;
    totalSize: number;
    uniqueFilesSize: number;
    duplicateFilesSize: number;
    averageDuration: number;
    fileCategories: Record<string, number>;
    fileExtensions: Record<string, number>;
    recentDownloads: DownloadHistoryItem[];
}

export interface DownloadHistoryItem {
    id: string
    filename: string
    url: string
    hash: string
    size?: number
    fileExtension?: string
    mimeType?: string
    sourceDomain?: string
    fileCategory?: string
    status: 'new' | 'duplicate'
    createdAt: Date
}

export interface TimeBasedStats {
    downloadsToday: number
    downloadsThisWeek: number
    downloadsThisMonth: number
    averagePerDay: number
    mostActiveHour: number
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
export interface FileTypeStats {
    mostDownloadedType: string | null
    largestCategoryBySize: string | null
    duplicateRateByCategory: Record<string, number>
}
export interface DuplicateStats {
    duplicateRatePercent: number
    mostDuplicatedFile: {
        filename: string
        count: number
    } | null
    averageDuplicateCount: number
}
export interface AdvancedStats {
    timeStats: TimeBasedStats
    sizeStats: SizeStats
    sourceStats: SourceStats
    fileTypeStats: FileTypeStats
    duplicateStats: DuplicateStats
    dailyActivity: DailyActivity[]
}