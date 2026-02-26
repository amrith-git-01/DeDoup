import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useSSERefresh } from '../../hooks/useSSERefresh';
import { Header } from './Header';
import { Navbar } from './Navbar';

export function HomeLayout() {
  const { user } = useAppSelector((state) => state.auth);
  useSSERefresh();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header username={user?.username} profileImageUrl={user?.profileImageUrl} />
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
