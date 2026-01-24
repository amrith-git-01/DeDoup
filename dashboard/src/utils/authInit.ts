import { authAPI } from '../services/api'
import { setAuth, clearAuth, setLoading } from '../store/slices/authSlice'
import type { AppDispatch } from '../store/store'

export async function initializeAuth(dispatch: AppDispatch) {
    const token = localStorage.getItem('token')

    if (!token) {
        dispatch(clearAuth())
        return
    }

    dispatch(setLoading(true));

    try {
        const response = await authAPI.getMe()
        const { user } = response.data

        dispatch(setAuth({ user, token: { accessToken: token } }))
    }
    catch (error) {
        localStorage.removeItem('token')
        dispatch(clearAuth())
    } finally {
        dispatch(setLoading(false))
    }
}