import { useAppSelector } from '../store/hooks';

function DashboardPage(){
    const auth = useAppSelector(state => state.auth);
    const stats = useAppSelector(state => state.stats);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard</p>
            <p>Authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Storage Saved: {stats.stats.storageSaved}</p>
            <p>Duplicates Blocked: {stats.stats.duplicatesBlocked}</p>
            <p>Files Tracked: {stats.stats.filesTracked}</p>
        </div>
    )
}

export default DashboardPage;