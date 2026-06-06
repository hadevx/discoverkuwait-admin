//@ts-nocheck
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Users,
  LogOut,
  Settings,
  Menu,
  X,
  Loader2Icon,
  BookText,
  LayoutDashboard,
  Brain,
  ChevronRight,
  Images,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useLogoutMutation } from "../redux/queries/userApi";
import { toast } from "react-toastify";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, en: "Dashboard", ar: "الرئيسية" },
  { to: "/wordlist", icon: BookText, en: "Words", ar: "الكلمات" },
  { to: "/quizlist", icon: Brain, en: "Quiz", ar: "الاختبار" },
  { to: "/forum", icon: Images, en: "Forum", ar: "المنتدى" },
  { to: "/userlist", icon: Users, en: "Users", ar: "المستخدمون" },
  { to: "/settings", icon: Settings, en: "Settings", ar: "الإعدادات" },
];

function SideMenu() {
  const [logoutApiCall, { isLoading: loadingLogout }] = useLogoutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const language = useSelector((state: any) => state.language.lang);
  const { adminUserInfo } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuOpen]);

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === to || pathname === "/" : pathname.startsWith(to);

  const t = (en: string, ar: string) => (language === "ar" ? ar : en);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
            <img src="/avatar/logo.webp" alt="logo" className="size-6 rounded-md" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-white tracking-tight">Discover Kuwait</p>
            <p className="text-[11px] text-indigo-300 font-medium">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-2">
        <div className="h-px bg-white/10" />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, en, ar }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-indigo-200/80 hover:bg-white/8 hover:text-white",
              )}>
              <span
                className={clsx(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-indigo-300 group-hover:bg-white/10 group-hover:text-white",
                )}>
                <Icon className="size-3.5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="flex-1">{t(en, ar)}</span>
              {active && <ChevronRight className="size-3.5 text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* ── User + Logout ── */}
      <div className="px-3 pb-5 pt-2">
        <div className="h-px bg-white/10 mb-3" />

        {adminUserInfo && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/8 mb-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-extrabold uppercase">
              {adminUserInfo.name?.[0] ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminUserInfo.name}</p>
              <p className="text-[10px] text-indigo-300 truncate">{adminUserInfo.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loadingLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-all duration-150 disabled:opacity-60">
          {loadingLogout ? (
            <Loader2Icon className="size-4 animate-spin shrink-0" />
          ) : (
            <LogOut className="size-4 shrink-0" strokeWidth={2} />
          )}
          <span>{t("Log out", "تسجيل الخروج")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg"
        onClick={() => setIsMenuOpen((v) => !v)}
        aria-label="Toggle menu">
        {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-[oklch(0.20_0.055_275)] min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 z-50 flex h-full w-56 flex-col bg-[oklch(0.20_0.055_275)] shadow-2xl lg:hidden">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideMenu;
