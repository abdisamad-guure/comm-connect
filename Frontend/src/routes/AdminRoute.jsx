import { Navigate, Outlet } from 'react-router-dom';
import { LoadingState } from '../components/AsyncState';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute() {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="page-container py-16"><LoadingState label="Checking access..." /></div>;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
