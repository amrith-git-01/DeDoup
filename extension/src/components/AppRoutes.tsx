import {Routes, Route} from 'react-router-dom'
import {useAppSelector} from '../store/hooks'

import DashboardPage from '../pages/DashboardPage'


export function AppRoutes(){
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
        </Routes>
    )
}