import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <Spinner size="xl" />
        <span className="ml-3 text-gray-400">Cargando sesión...</span>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
