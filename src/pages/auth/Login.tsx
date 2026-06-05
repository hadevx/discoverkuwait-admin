import { useEffect, useMemo, useState } from "react";
import { EyeOff, Eye, Mail, Lock, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginUserMutation } from "../../redux/queries/userApi";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import { clsx } from "clsx";
import { validateLogin } from "../../validation/userSchema";

const EMAIL_KEY = "auknotes:loginEmail";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  // ✅ Load saved email once (on mount)
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(EMAIL_KEY) || "";
    } catch {
      return "";
    }
  });

  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // ✅ Save email ONLY after success
  const saveEmail = (value: string) => {
    try {
      localStorage.setItem(EMAIL_KEY, value.trim());
    } catch {}
  };

  const clearSavedEmail = () => {
    try {
      localStorage.removeItem(EMAIL_KEY);
    } catch {}
    setEmail("");
  };

  const hasSavedEmail = useMemo(() => {
    try {
      return Boolean(localStorage.getItem(EMAIL_KEY));
    } catch {
      return false;
    }
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    const result = validateLogin({ email, password });
    if (!result.isValid) return toast.error(Object.values(result.errors)[0]);

    try {
      if (!email || !password) return toast.error("All fields are required");

      // If your backend supports "remember", keep it. If not, remove it.
      const payload = { ...result.data, remember };

      const res: any = await loginUser(payload as any).unwrap();

      dispatch(setUserInfo({ ...res }));
      saveEmail(email);

      setPassword("");
      navigate("/");
    } catch (error: any) {
      if (error?.status === "FETCH_ERROR") {
        toast.error("Server is down. Please try again later.");
      } else {
        toast.error(error?.data?.message || "Login failed.");
      }
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.20_0.055_275)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-96 flex-col justify-between p-12 bg-gradient-to-b from-[oklch(0.22_0.06_276)] to-[oklch(0.17_0.05_275)]">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
            <img src="/avatar/logo.webp" alt="logo" className="size-6 rounded-md" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight">Discover Kuwait</p>
            <p className="text-xs text-indigo-300">Admin Dashboard</p>
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-white leading-snug mb-3">
            Manage your<br />platform with ease
          </p>
          <p className="text-sm text-indigo-300 leading-relaxed">
            Full control over users, words, quiz exams, and content from one place.
          </p>
        </div>
        <p className="text-xs text-indigo-400">© {new Date().getFullYear()} Discover Kuwait</p>
      </div>

      {/* Right login panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm">
        {/* Top brand (mobile only) */}
        <div className="flex flex-col items-center mb-8 lg:hidden">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
            <img src="/avatar/logo.webp" alt="logo" className="size-8 rounded-lg" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Discover Kuwait</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Admin Dashboard</p>
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-1">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-7">Sign in to your admin account</p>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="size-4" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className={clsx(
                    "w-full h-11 rounded-xl border bg-white pl-10 pr-10 text-sm outline-none transition",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    aria-label="Clear email">
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Saved email helper */}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-gray-500">
                  {hasSavedEmail
                    ? "Email saved on this device."
                    : "Email will be saved after login."}
                </p>

                {hasSavedEmail && (
                  <button
                    type="button"
                    onClick={clearSavedEmail}
                    className="text-[11px] font-semibold text-gray-700 hover:underline">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Password</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="size-4" />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={clsx(
                    "w-full h-11 rounded-xl border bg-white pl-10 pr-12 text-sm outline-none transition",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
            </div>

            {/* Row: remember + forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4"
                />
                Remember me
              </label>

              <Link to="/forget-password" className="text-sm text-primary hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              disabled={isLoading}
              type="submit"
              className={clsx(
                "w-full h-11 rounded-xl font-bold flex items-center justify-center transition-all",
                isLoading
                  ? "bg-primary/60 text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/30",
              )}>
              {isLoading ? <Spinner className="!border-t-white" /> : "Sign in"}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Login;
