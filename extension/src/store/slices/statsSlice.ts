import { createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type { ExtensionStats, BlockedFile} from '../../types'

interface StatsState{
    stats: ExtensionStats,
    blockedFiles: BlockedFile[],
    isLoading: boolean
}

const initialState: StatsState = {
    stats: {
        storageSaved: 0,
        duplicatesBlocked: 0,
        filesTracked: 0
    },
    blockedFiles: [],
    isLoading: false
}

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers:{
        setStats: (state, action: PayloadAction<ExtensionStats>) =>{
            state.stats = action.payload;
        },
        addBlockedFile: (state, action: PayloadAction<BlockedFile>) =>{
            state.blockedFiles.unshift(action.payload);
            if (state.blockedFiles.length > 50) {
                state.blockedFiles = state.blockedFiles.slice(0, 50);
            }
            state.stats.duplicatesBlocked += 1;
        },
        updateStorageSaved : (state, action: PayloadAction<number>) =>{
            state.stats.storageSaved += action.payload;
        },
        incrementFilesTracked: (state) =>{
            state.stats.filesTracked += 1;
        },
        setLoading: (state, action: PayloadAction<boolean>) =>{
            state.isLoading = action.payload;
        },
        clearStats: (state) =>{
            state.stats = initialState.stats;
            state.blockedFiles = initialState.blockedFiles;
        }
    }
})

export const {
    setStats,
    addBlockedFile,
    updateStorageSaved,
    incrementFilesTracked,
    setLoading,
    clearStats
} = statsSlice.actions;
export default statsSlice.reducer;