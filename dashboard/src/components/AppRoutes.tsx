import {Routes, Route, Navigate} from 'react-router-dom'
import AuthPage from '../pages/AuthPage'
import DashboardPage from '../pages/DashboardPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes(){
    return (
        <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />

            <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }/>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}