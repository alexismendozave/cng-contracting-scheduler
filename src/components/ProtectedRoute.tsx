
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireRootAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireRootAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading, isAdmin, isRootAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRootAdmin && !isRootAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Check if user profile is inactive
  if (profile && !profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Cuenta Desactivada</h1>
          <p className="text-gray-600">Tu cuenta ha sido desactivada. Contacta al administrador.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
