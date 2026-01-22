import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthToken } from '../../types'

interface AuthState {
    user: User | null,
    token: AuthToken | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{ user: User, token: AuthToken }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        }
    }
})

export const { setAuth, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;