// Unauthorized.jsx
import { logout } from "../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../redux/queries/userApi";

export default function Unauthorized() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const handleLogout = async () => {
    await logoutApiCall(undefined).unwrap();
    dispatch(logout());
    // toast.success(res.message);
    navigate("/login");
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-6xl font-bold text-red-500">401</h1>
      <p className="text-2xl mt-4">Unauthorized Access</p>
      <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
        Logout
      </button>
    </div>
  );
}
