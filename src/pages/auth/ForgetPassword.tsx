import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_ENVIRONMENT === "development"
    ? import.meta.env.VITE_API_LOCALHOST
    : import.meta.env.VITE_API_URL;
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post(`${API_BASE}/api/users/forget-password`, {
        email,
      });
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error sending reset link");
    }
    setLoading(false);
  };

  return (
    <div className="flex px-5 items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot your password?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email address and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your Email"
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition 
              ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 text-sm rounded-lg ${
              message.toLowerCase().includes("error") || message.toLowerCase().includes("not found")
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-600 border border-green-200"
            }`}>
            {message}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
