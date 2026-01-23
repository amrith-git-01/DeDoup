import {Routes, Route} from 'react-router-dom'

import DashboardPage from '../pages/DashboardPage'


export function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="*" element={<DashboardPage />} />
        </Routes>
    )
}