import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || (!allowedRoles.includes(user.accountType) && user.accountType !== 'root')) {
    return <Navigate to="/" replace />;
  }
  return children;
};
