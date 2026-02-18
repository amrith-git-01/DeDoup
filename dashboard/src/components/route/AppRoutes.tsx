import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../../pages/AuthPage';
import HomePage from '../../pages/HomePage';
import { ProtectedRoute } from './ProtectedRoute';
import { HomeLayout } from '../layout/HomeLayout';
import DownloadsPage from '../../pages/DownloadsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import BrowsingPage from '../../pages/BrowsingPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />

      <Route
        element={
          <ProtectedRoute>
            <HomeLayout />
          </ProtectedRoute>
        }
      >
        {/* All these routes render inside the HomeLayout's Outlet */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/browsing" element={<BrowsingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
