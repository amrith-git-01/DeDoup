import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getDownloadStats, getDuplicateDownloads } from '../../services/api'

interface DownloadItem {
    id: string
    filename: string
    url: string
    hash: string
    size?: number
    status: 'new' | 'duplicate'
    fileCategory?: string
    createdAt: string
}

interface DownloadStats {
    totalDownloads: number
    uniqueDownloads: number
    duplicateDownloads: number
    totalSize: number
    uniqueFilesSize: number
    duplicateFilesSize: number
    averageDuration: number
    fileCategories: Record<string, number>
    fileExtensions: Record<string, number>
    recentDownloads: DownloadItem[]
}

interface StatsState {
    stats: DownloadStats | null
    downloads: DownloadItem[]
    duplicates: DownloadItem[]
    isLoading: boolean
    error: string | null
}

const initialState: StatsState = {
    stats: null,
    downloads: [],
    duplicates: [],
    isLoading: false,
    error: null
}

// Async thunks
export const fetchStats = createAsyncThunk(
    'stats/fetchStats',
    async () => {
        const response = await getDownloadStats()
        return response.data.data
    }
)

export const fetchDuplicates = createAsyncThunk(
    'stats/fetchDuplicates',
    async (limit: number = 20) => {
        const response = await getDuplicateDownloads(limit)
        return response.data.data
    }
)

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        clearStats: (state) => {
            state.stats = null
            state.downloads = []
            state.duplicates = []
            state.error = null
        }
    },
    extraReducers: (builder) => {
        // Fetch stats
        builder.addCase(fetchStats.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchStats.fulfilled, (state, action) => {
            state.stats = action.payload
            // Populate downloads from the recentDownloads field in stats
            state.downloads = action.payload.recentDownloads || []
            state.isLoading = false
        })
        builder.addCase(fetchStats.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.error.message || 'Failed to fetch stats'
        })

        // Fetch duplicates
        builder.addCase(fetchDuplicates.fulfilled, (state, action) => {
            state.duplicates = action.payload
        })
    }
})

export const { clearStats } = statsSlice.actions
export default statsSlice.reducer