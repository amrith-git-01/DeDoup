export interface DownloadItem {
    id: string;
    filename: string;
    url: string;
    hash: string;
    size: number;
    fileCategory: string; // e.g., 'document', 'video'
    status: 'new' | 'duplicate';
    duration?: number;
    createdAt: string; // ISO date string
}

export interface DownloadsResponse {
    downloads: DownloadItem[];
    pagination: {
        limit: number;
        skip: number;
        count: number;
    };
}


export interface DailyActivity {
    date: string;
    total: number;
    unique: number;
    duplicate: number;
}

export interface AdvancedStats {
    timeStats: {
        downloadsToday: number;
        downloadsThisWeek: number;
        downloadsThisMonth: number;
        averagePerDay: number;
        mostActiveHour: number;
        mostActiveHourDate: string | null;
        mostActiveDay: string;
        firstDownloadDate: string | null;
        firstDownloadFile: {
            filename: string;
            size: number;
        } | null;
        currentStreak: number;
        longestStreak: number;
    };
    dailyActivity: DailyActivity[]; // New field
    sizeStats: {
        averageFileSize: number;
        largestFile: {
            filename: string;
            size: number;
        } | null;
        smallestFile: {
            filename: string;
            size: number;
        } | null;
        totalStorageUsed: number;
        potentialSavingsPercent: number;
    };
    sourceStats: {
        topSources: Array<{ domain: string; count: number }>;
        downloadsByDomain: Record<string, number>;
        mostDownloadedDomain: string | null;
    };
    fileTypeStats: {
        mostDownloadedType: string | null;
        largestCategoryBySize: string | null;
        duplicateRateByCategory: Record<string, number>;
    };
    duplicateStats: {
        duplicateRatePercent: number;
        mostDuplicatedFile: {
            filename: string;
            count: number;
        } | null;
        averageDuplicateCount: number;
    };
}

export interface BasicStats {
    totalDownloads: number;
    uniqueDownloads: number;
    duplicateDownloads: number;
    totalSize: number;
    uniqueFilesSize: number;
    duplicateFilesSize: number;
    averageDuration: number;
    fileCategories: Record<string, number>;
    fileExtensions: Record<string, number>;
    recentDownloads: DownloadItem[];
}