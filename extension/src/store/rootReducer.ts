import {combineReducers} from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import statsReducer from './slices/statsSlice'

const rootReducer= combineReducers({
    auth: authReducer,
    stats: statsReducer
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer;