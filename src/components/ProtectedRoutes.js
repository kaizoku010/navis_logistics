const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAWS();
  if (!user || (!allowedRoles.includes(user.accountType) && user.accountType !== 'root')) {
    return <Navigate to="/" replace />;
  }
  return children;
};
