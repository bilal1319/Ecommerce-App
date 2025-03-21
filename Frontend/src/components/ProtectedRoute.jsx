import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const ProtectedRoute = ({ allowedRoles }) => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const role = authUser;
  const location = useLocation();
  
  // While checking auth, render nothing
  if (isCheckingAuth) {
    return null;
  }
  
  // If no user is authenticated, don't render anything
  // This should be handled by your checkAuth function in App.js
  if (!authUser) {
    return null;
  }
  
  // If user doesn't have permission, show toast and redirect immediately
  if (!allowedRoles.includes(role)) {
    // Only show toast for actual navigation attempts (not initial load)
    
      toast.error('Unauthorized access');
    
    
    // Immediate redirect based on role
    return <Navigate to={role === 'admin' ? '/admin-dash' : '/home'} replace />;
  }
  
  // User has permission, render the route
  return <Outlet />;
};

export default ProtectedRoute;