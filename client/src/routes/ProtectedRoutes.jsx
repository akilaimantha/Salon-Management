import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Not authenticated at all
  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Role-based access check (if roles are specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If user doesn't have the required role, redirect to appropriate page
    if (user.role === "admin") {
      return <Navigate to="/manager" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
