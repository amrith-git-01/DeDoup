import {Navigate} from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({children}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

    if(isLoading){
        return (
            <div>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto'></div>
                    <p className='text-gray-600 mt-4'>Loading...</p>
                </div>
            </div>
        )
    }

    if(!isAuthenticated){
        return <Navigate to='/login' replace />
    }

    return <>
    {children}
    </>
}

