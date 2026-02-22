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
    downloadedAt: string; // ISO date
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
    fileCreatedAt: string; // ISO date
    fileUpdatedAt: string; // ISO date
}

export interface DownloadHistoryFilter {
    status?: 'new' | 'duplicate';
    fileCategory?: string;
    fileExtension?: string;
    sourceDomain?: string;
    excludedSourceDomains?: string[];
    startDate?: string;
    endDate?: string;
    search?: string;
    fileId?: string;
}

export interface HistoryPagination {
    current: number;
    pages: number;
    total: number;
    limit: number;
}