import axios from 'axios'
import { store } from '../store/store'
import { clearAuth } from '../store/slices/authSlice'

import type { SummaryMetrics, DownloadHistoryFilter, DownloadHistoryItem, HistoryPagination } from '../types/stats'
import type { ActivityTrend, DailyActivity, HabitsData, SourceStats, FileMetrics } from '../types/metrics'
import type { BrowsingSummary, BrowsingTrends, BrowsingDailyActivity, BrowsingHabits, TopSiteItem, TodayByDomainItem, BrowsingPeriodStats, RecentVisitItem } from '../types/browsing'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

const authAPI = {
    login: async (email: any, password: any) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    signup: async (email: any, password: any, username: any) => {
        const response = await api.post('/auth/signup', { email, password, username });
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
}

const statsAPI = {
    getSummaryMetrics: async () => {
        const response = await api.get<{ success: boolean; data: SummaryMetrics }>('/downloads/metrics/summary');
        return response.data;
    },
    getDownloadHistory: async (page = 1, limit = 10, filters = {}) => {
        const response = await api.get<{
            success: boolean;
            data: DownloadHistoryItem[];
            pagination: HistoryPagination
        }>('/downloads/history', {
            params: { page, limit, ...filters }
        });
        return response.data;
    },
    // getAdvancedStats removed
    getTrends: async () => {
        const response = await api.get<{ success: boolean; data: ActivityTrend }>('/downloads/metrics/trends');
        return response.data;
    },
    getActivity: async () => {
        const response = await api.get<{ success: boolean; data: DailyActivity[] }>('/downloads/metrics/activity');
        return response.data;
    },
    getHabits: async () => {
        const response = await api.get<{ success: boolean; data: HabitsData }>('/downloads/metrics/habits');
        return response.data;
    },
    getFileMetrics: async (filters: DownloadHistoryFilter = {}) => {
        const response = await api.get<{ success: boolean; data: FileMetrics }>('/downloads/metrics/files', { params: filters });
        return response.data;
    },
    getSourceStats: async () => {
        const response = await api.get<{ success: boolean; data: SourceStats }>('/downloads/metrics/sources');
        return response.data;
    }
}

const browsingAPI = {
    getSummary: async () => {
        const response = await api.get<{ success: boolean; data: BrowsingSummary }>('/browsing/metrics/summary')
        return response.data
    },
    getTrends: async () => {
        const response = await api.get<{ success: boolean; data: BrowsingTrends }>('/browsing/metrics/trends')
        return response.data
    },
    getActivity: async () => {
        const response = await api.get<{ success: boolean; data: BrowsingDailyActivity[] }>('/browsing/metrics/activity')
        return response.data
    },
    getHabits: async () => {
        const response = await api.get<{ success: boolean; data: BrowsingHabits }>('/browsing/metrics/habits')
        return response.data
    },
    getTopSites: async () => {
        const response = await api.get<{ success: boolean; data: { domains: TopSiteItem[] } }>('/browsing/metrics/top-sites')
        return response.data
    },
    getTodayByDomain: async () => {
        const now = new Date()
        const start = new Date(now)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        end.setMilliseconds(-1)
        const response = await api.get<{ success: boolean; data: TodayByDomainItem[] }>(
            '/browsing/metrics/today-by-domain',
            { params: { startDate: start.toISOString(), endDate: end.toISOString() } }
        )
        return response.data
    },
    getPeriodStats: async () => {
        const response = await api.get<{ success: boolean; data: BrowsingPeriodStats }>('/browsing/metrics/period-stats')
        return response.data
    },
    getRecentVisits: async (limit = 10) => {
        const response = await api.get<{ success: boolean; data: RecentVisitItem[] }>(
            '/browsing/metrics/recent-visits',
            { params: { limit } }
        )
        return response.data
    },
}

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(clearAuth())
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export { authAPI, statsAPI, browsingAPI }