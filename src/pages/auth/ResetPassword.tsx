import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_ENVIRONMENT === "development"
    ? import.meta.env.VITE_API_LOCALHOST
    : import.meta.env.VITE_API_URL;
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/users/reset-password/${token}`,
        { password }
      );
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex px-5 justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">🔑 Reset Password</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Enter your new password below to update your account.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 transition text-white font-semibold py-3 rounded-lg shadow-md disabled:opacity-60">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.toLowerCase().includes("error") ? "text-red-500" : "text-green-600"
            }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
