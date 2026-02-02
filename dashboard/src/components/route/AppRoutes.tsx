import {Routes, Route, Navigate} from 'react-router-dom'
import AuthPage from '../../pages/AuthPage'
import DashboardPage from '../../pages/DashboardPage'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardLayout } from '../layout/DashboardLayout'
import { DownloadsPage } from '../../pages/DownloadsPage'
import { SettingsPage } from '../../pages/SettingsPage'

export function AppRoutes(){
    return (
        <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />

            <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* All these routes render inside the DashboardLayout's Outlet */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    )
}