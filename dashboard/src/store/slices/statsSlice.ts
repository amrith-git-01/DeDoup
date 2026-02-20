import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statsAPI } from '../../services/api';
import type {
    SummaryMetrics,
    DownloadHistoryItem,
    DownloadHistoryFilter,
    HistoryPagination,
} from '../../types/stats';
import type {
    ActivityTrend,
    DailyActivity,
    HabitsData,
    FileMetrics,
    SourceStats,
} from '../../types/metrics';

interface StatsState {
    summaryMetrics: SummaryMetrics | null;

    // History State (for Drawer)
    history: DownloadHistoryItem[];
    historyPagination: HistoryPagination | null;
    isHistoryLoading: boolean;
    historyError: string | null;

    // Activity & Trends
    activityTrends: ActivityTrend | null;
    dailyActivity: DailyActivity[];
    habits: HabitsData | null;
    recentDownloads: DownloadHistoryItem[];

    // File Metrics
    fileMetrics: FileMetrics | null;
    isFileMetricsLoading: boolean;

    // Analytics
    sourceStats: SourceStats | null;

    isSummaryLoading: boolean;
    isTrendsLoading: boolean;
    isActivityLoading: boolean;
    isHabitsLoading: boolean;
    isRecentDownloadsLoading: boolean;
    isSourceStatsLoading: boolean;

    // Deprecated but kept for compatibility if needed (though we will stop using it)
    loading: boolean;
    error: string | null;
}

const initialState: StatsState = {
    summaryMetrics: null,

    history: [],
    historyPagination: null,
    isHistoryLoading: false,
    historyError: null,

    activityTrends: null,
    dailyActivity: [],
    habits: null,
    recentDownloads: [],

    fileMetrics: null,
    isFileMetricsLoading: false,

    sourceStats: null,

    isSummaryLoading: false,
    isTrendsLoading: false,
    isActivityLoading: false,
    isHabitsLoading: false,
    isRecentDownloadsLoading: false,
    isSourceStatsLoading: false,

    loading: false,
    error: null,
};

const DEFAULT_SUMMARY = {
    totalDownloads: 0,
    newDownloads: 0,
    duplicateDownloads: 0,
    totalSize: 0,
    newSize: 0,
    duplicateSize: 0,
} as const;

export const selectSummaryWithDefaults = (state: { stats: StatsState }) =>
    state.stats.summaryMetrics ?? DEFAULT_SUMMARY;

/* ---------------------- Thunks ---------------------- */

export const fetchSummaryMetrics = createAsyncThunk(
    'stats/fetchSummaryMetrics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await statsAPI.getSummaryMetrics();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch summary metrics',
            );
        }
    },
);

export const fetchFilteredHistory = createAsyncThunk(
    'stats/fetchFilteredHistory',
    async (
        { page, limit, filters }: { page: number; limit: number; filters: DownloadHistoryFilter },
        { rejectWithValue },
    ) => {
        try {
            const response = await statsAPI.getDownloadHistory(page, limit, filters);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch history',
            );
        }
    },
);

export const fetchRecentDownloads = createAsyncThunk(
    'stats/fetchRecentDownloads',
    async (_, { rejectWithValue }) => {
        try {
            const response = await statsAPI.getDownloadHistory(1, 10, {});
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch recent downloads',
            );
        }
    },
);

export const fetchTrends = createAsyncThunk(
    'stats/fetchTrends',
    async (_, { rejectWithValue }) => {
        try {
            const response = await statsAPI.getTrends();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch trends',
            );
        }
    },
);

export const fetchActivity = createAsyncThunk(
    'stats/fetchActivity',
    async (_, { rejectWithValue }) => {
        try {
            const response = await statsAPI.getActivity();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch activity',
            );
        }
    },
);

export const fetchHabits = createAsyncThunk(
    'stats/fetchHabits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await statsAPI.getHabits();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch habits',
            );
        }
    },
);

export const fetchFileMetrics = createAsyncThunk(
    'stats/fetchFileMetrics',
    async (
        filters: DownloadHistoryFilter | undefined,
        { rejectWithValue },
    ) => {
        try {
            const response = await statsAPI.getFileMetrics(filters);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch file metrics',
            );
        }
    },
);

export const fetchSourceStats = createAsyncThunk(
    'stats/fetchSourceStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await statsAPI.getSourceStats();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch source stats',
            );
        }
    },
);

/* ---------------------- Slice ---------------------- */

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        clearStats: (state) => {
            state.sourceStats = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Summary
            .addCase(fetchSummaryMetrics.pending, (state) => {
                state.isSummaryLoading = true;
                state.error = null;
            })
            .addCase(fetchSummaryMetrics.fulfilled, (state, action) => {
                state.isSummaryLoading = false;
                state.summaryMetrics = action.payload;
            })
            .addCase(fetchSummaryMetrics.rejected, (state, action) => {
                state.isSummaryLoading = false;
                state.error = action.payload as string;
            })

            // History (drawer)
            .addCase(fetchFilteredHistory.pending, (state) => {
                state.isHistoryLoading = true;
                state.historyError = null;
            })
            .addCase(fetchFilteredHistory.fulfilled, (state, action) => {
                state.isHistoryLoading = false;
                state.history = action.payload.data;
                state.historyPagination = action.payload.pagination;
            })
            .addCase(fetchFilteredHistory.rejected, (state, action) => {
                state.isHistoryLoading = false;
                state.historyError = action.payload as string;
            })

            // Recent downloads
            .addCase(fetchRecentDownloads.pending, (state) => {
                state.isRecentDownloadsLoading = true;
            })
            .addCase(fetchRecentDownloads.fulfilled, (state, action) => {
                state.isRecentDownloadsLoading = false;
                state.recentDownloads = action.payload;
            })
            .addCase(fetchRecentDownloads.rejected, (state) => {
                state.isRecentDownloadsLoading = false;
            })

            // Activity & trends
            .addCase(fetchTrends.pending, (state) => {
                state.isTrendsLoading = true;
                state.error = null;
            })
            .addCase(fetchTrends.fulfilled, (state, action) => {
                state.isTrendsLoading = false;
                state.activityTrends = action.payload;
            })
            .addCase(fetchTrends.rejected, (state, action) => {
                state.isTrendsLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchActivity.pending, (state) => {
                state.isActivityLoading = true;
                state.error = null;
            })
            .addCase(fetchActivity.fulfilled, (state, action) => {
                state.isActivityLoading = false;
                state.dailyActivity = action.payload;
            })
            .addCase(fetchActivity.rejected, (state, action) => {
                state.isActivityLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchHabits.pending, (state) => {
                state.isHabitsLoading = true;
                state.error = null;
            })
            .addCase(fetchHabits.fulfilled, (state, action) => {
                state.isHabitsLoading = false;
                state.habits = action.payload;
            })
            .addCase(fetchHabits.rejected, (state, action) => {
                state.isHabitsLoading = false;
                state.error = action.payload as string;
            })

            // File metrics
            .addCase(fetchFileMetrics.pending, (state) => {
                state.isFileMetricsLoading = true;
            })
            .addCase(fetchFileMetrics.fulfilled, (state, action) => {
                state.isFileMetricsLoading = false;
                state.fileMetrics = action.payload;
            })
            .addCase(fetchFileMetrics.rejected, (state) => {
                state.isFileMetricsLoading = false;
            })

            // Source stats
            .addCase(fetchSourceStats.pending, (state) => {
                state.isSourceStatsLoading = true;
                state.error = null;
            })
            .addCase(fetchSourceStats.fulfilled, (state, action) => {
                state.isSourceStatsLoading = false;
                state.sourceStats = action.payload;
            })
            .addCase(fetchSourceStats.rejected, (state, action) => {
                state.isSourceStatsLoading = false;
                state.error = action.payload as string;
            })

    },
});

export const { clearStats } = statsSlice.actions;
export default statsSlice.reducer;