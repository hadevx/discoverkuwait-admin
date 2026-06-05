import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ element }: { element: React.ReactElement }) {
  // Get the authentication state from Redux
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  return adminUserInfo && adminUserInfo.isAdmin ? element : <Navigate to="/login" replace />;
}

export default PrivateRoute;
