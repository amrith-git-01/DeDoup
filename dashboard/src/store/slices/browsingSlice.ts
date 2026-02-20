import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { browsingAPI } from '../../services/api'
import type {
    BrowsingSummary,
    BrowsingTrends,
    BrowsingDailyActivity,
    BrowsingHabits,
    BrowsingPeriodStats,
    TopSiteItem,
    TodayByDomainItem,
    RecentVisitItem,
} from '../../types/browsing'

interface BrowsingState {
    summary: BrowsingSummary | null
    trends: BrowsingTrends | null
    dailyActivity: BrowsingDailyActivity[]
    habits: BrowsingHabits | null
    topSites: TopSiteItem[]
    todayByDomain: TodayByDomainItem[]
    periodStats: BrowsingPeriodStats | null
    recentVisits: RecentVisitItem[]
    isSummaryLoading: boolean
    isTrendsLoading: boolean
    isActivityLoading: boolean
    isHabitsLoading: boolean
    isTopSitesLoading: boolean
    isTodayByDomainLoading: boolean
    isPeriodStatsLoading: boolean
    isRecentVisitsLoading: boolean
    error: string | null
}

const initialState: BrowsingState = {
    summary: null,
    trends: null,
    dailyActivity: [],
    habits: null,
    topSites: [],
    todayByDomain: [],
    periodStats: null,
    recentVisits: [],
    isRecentVisitsLoading: false,
    isSummaryLoading: false,
    isTrendsLoading: false,
    isActivityLoading: false,
    isHabitsLoading: false,
    isTopSitesLoading: false,
    isTodayByDomainLoading: false,
    isPeriodStatsLoading: false,
    error: null,
}

export const fetchBrowsingSummary = createAsyncThunk(
    'browsing/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getSummary()
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch browsing summary')
        }
    }
)

export const fetchBrowsingTrends = createAsyncThunk(
    'browsing/fetchTrends',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getTrends()
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch browsing trends')
        }
    }
)

export const fetchBrowsingActivity = createAsyncThunk(
    'browsing/fetchActivity',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getActivity()
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch browsing activity')
        }
    }
)

export const fetchBrowsingHabits = createAsyncThunk(
    'browsing/fetchHabits',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getHabits()
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch browsing habits')
        }
    }
)

export const fetchBrowsingTopSites = createAsyncThunk(
    'browsing/fetchTopSites',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getTopSites()
            return res.data.domains
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch top sites')
        }
    }
)

export const fetchTodayByDomain = createAsyncThunk(
    'browsing/fetchTodayByDomain',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getTodayByDomain()
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch today by domain')
        }
    }
)

export const fetchBrowsingPeriodStats = createAsyncThunk(
    'browsing/fetchPeriodStats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getPeriodStats()
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch period stats')
        }
    }
)

export const fetchRecentVisits = createAsyncThunk(
    'browsing/fetchRecentVisits',
    async (_, { rejectWithValue }) => {
        try {
            const res = await browsingAPI.getRecentVisits(10)
            return res.data
        } catch (e: any) {
            return rejectWithValue(e.response?.data?.message || 'Failed to fetch recent visits')
        }
    }
)

const browsingSlice = createSlice({
    name: 'browsing',
    initialState,
    reducers: {
        clearBrowsing: (state) => {
            state.summary = null
            state.trends = null
            state.dailyActivity = []
            state.habits = null
            state.topSites = []
            state.todayByDomain = []
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrowsingSummary.pending, (s) => { s.isSummaryLoading = true; s.error = null })
            .addCase(fetchBrowsingSummary.fulfilled, (s, a) => { s.isSummaryLoading = false; s.summary = a.payload })
            .addCase(fetchBrowsingSummary.rejected, (s, a) => { s.isSummaryLoading = false; s.error = a.payload as string })
            .addCase(fetchBrowsingTrends.pending, (s) => { s.isTrendsLoading = true })
            .addCase(fetchBrowsingTrends.fulfilled, (s, a) => { s.isTrendsLoading = false; s.trends = a.payload })
            .addCase(fetchBrowsingTrends.rejected, (s) => { s.isTrendsLoading = false })
            .addCase(fetchBrowsingActivity.pending, (s) => { s.isActivityLoading = true })
            .addCase(fetchBrowsingActivity.fulfilled, (s, a) => { s.isActivityLoading = false; s.dailyActivity = a.payload })
            .addCase(fetchBrowsingActivity.rejected, (s) => { s.isActivityLoading = false })
            .addCase(fetchBrowsingHabits.pending, (s) => { s.isHabitsLoading = true })
            .addCase(fetchBrowsingHabits.fulfilled, (s, a) => { s.isHabitsLoading = false; s.habits = a.payload })
            .addCase(fetchBrowsingHabits.rejected, (s) => { s.isHabitsLoading = false })
            .addCase(fetchBrowsingTopSites.pending, (s) => { s.isTopSitesLoading = true })
            .addCase(fetchBrowsingTopSites.fulfilled, (s, a) => { s.isTopSitesLoading = false; s.topSites = a.payload })
            .addCase(fetchBrowsingTopSites.rejected, (s) => { s.isTopSitesLoading = false })
            .addCase(fetchTodayByDomain.pending, (s) => { s.isTodayByDomainLoading = true })
            .addCase(fetchTodayByDomain.fulfilled, (s, a) => { s.isTodayByDomainLoading = false; s.todayByDomain = a.payload })
            .addCase(fetchTodayByDomain.rejected, (s) => { s.isTodayByDomainLoading = false })
            .addCase(fetchBrowsingPeriodStats.pending, (s) => { s.isPeriodStatsLoading = true })
            .addCase(fetchBrowsingPeriodStats.fulfilled, (s, a) => { s.isPeriodStatsLoading = false; s.periodStats = a.payload })
            .addCase(fetchBrowsingPeriodStats.rejected, (s) => { s.isPeriodStatsLoading = false })
            .addCase(fetchRecentVisits.pending, (s) => { s.isRecentVisitsLoading = true })
            .addCase(fetchRecentVisits.fulfilled, (s, a) => { s.isRecentVisitsLoading = false; s.recentVisits = a.payload })
            .addCase(fetchRecentVisits.rejected, (s) => { s.isRecentVisitsLoading = false })
    },
})

export default browsingSlice.reducer