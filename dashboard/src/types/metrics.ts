import type { LucideIcon } from "lucide-react";

export interface ActivityChartProps {
    dailyActivity: DailyActivity[];
    onDateClick?: (date: string) => void;
}

export interface MetricItem {
    rawName: string;
    name: string;
    value: number;
    size: number;
    newValue: number;
    duplicateValue: number;
    fill: string;
}

export type MetricMode = 'categories' | 'extensions';

export interface HealthBarProps {
    unique: number;
    duplicates: number;
    total: number;
    title?: string;
    subtitle?: string;
    labels?: { unique?: string; duplicates?: string; total?: string };
    formatter?: (value: number) => string;
    colors?: { unique?: string; duplicates?: string; total?: string };
    onBubbleClick?: (type: 'unique' | 'duplicates' | 'total') => void;
}

export interface OverviewCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string;
    change?: {
        value: number;
        label: string;
        formatted?: string;
    };
    onClick?: () => void;
    colSpan?: 1 | 2;
}

export interface SourceAnalyticsProps {
    sourceStats: SourceStats | null;
    onSourceClick: (domain: string) => void;
    onShowAll: () => void;
    onSourceOthersClick?:(excludedDomains: string[]) => void;
}

export interface TimeInsightsProps {
    trends: ActivityTrend | null;
    dailyActivity: DailyActivity[];
    habits: HabitsData | null;
    recentDownloads: DownloadItem[];
    onOverviewClick?: (type: OverviewType) => void;
    onDateClick?: (date: string) => void;
    onViewAllClick?: () => void;
    onFileClick?: (fileId: string) => void;
}

export interface FileAnalyticsProps {
    fileMetrics: FileMetrics | null;
    onCategoryClick: (category: string) => void;
    onExtensionClick: (extension: string) => void;
    onShowAll: () => void;
}

export type OverviewType = 'today' | 'week' | 'month' | 'peak-hour' | 'peak-day';


export interface DownloadItem {
    id: string;
    filename: string;
    url: string;
    hash: string;
    size: number;
    fileCategory: string;
    status: 'new' | 'duplicate';
    duration?: number;
    createdAt: string;
}

export interface DailyActivity {
    date: string;
    total: number;
    unique: number;
    duplicate: number;
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
}

export interface FileMetricItem {
    name: string;
    count: number;
    size: number;
    newCount: number;
    newSize: number;
    duplicateCount: number;
    duplicateSize: number;
}

export interface FileMetrics {
    categories: FileMetricItem[];
    extensions: FileMetricItem[];
}

export interface SourceMetricItem {
    domain: string;
    totalDownloads: number;
    newDownloads: number;
    duplicateDownloads: number;
    totalSize: number;
    newSize: number;
    duplicateSize: number;
}

export interface SourceStats {
    sources: SourceMetricItem[];
}
