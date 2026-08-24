import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/AsyncState';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="page-container py-16"><LoadingState label="Checking your session..." /></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
