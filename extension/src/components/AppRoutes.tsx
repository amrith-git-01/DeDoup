import {Routes, Route, Navigate} from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { AuthRequired } from './AuthRequired'
import DownloadPage from '../pages/DownloadPage'
import { AppLayout } from './layout/AppLayout';


export function AppRoutes(){
    const {isAuthenticated} = useAppSelector(state => state.auth);
    if(!isAuthenticated){
        return <AuthRequired />
    }
    return (
        <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DownloadPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    )
}