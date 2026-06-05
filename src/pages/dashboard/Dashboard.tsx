//@ts-nocheck
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Users,
  BookText,
  Brain,
  Heart,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import clsx from "clsx";
import Layout from "../../Layout";
import Loader from "../../components/Loader";
import { Separator } from "../../components/ui/separator";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { useGetAllWordsQuery } from "../../redux/queries/wordsApi";
import { useGetAllQuizzesQuery } from "../../redux/queries/quizApi";

/* ── Stat card ── */
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        onClick ? "cursor-pointer" : "cursor-default",
      )}>
      <div className="flex items-start justify-between gap-3">
        <div className={clsx("flex size-11 items-center justify-center rounded-xl", color)}>
          {icon}
        </div>
        {onClick && <ChevronRight className="size-4 text-zinc-400 mt-1 shrink-0" />}
      </div>
      <p className="mt-4 text-3xl font-black text-zinc-900">{value}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </button>
  );
}

/* ── Section header ── */
function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1">
          {action} <ChevronRight className="size-3" />
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);
  const { adminUserInfo } = useSelector((state: any) => state.auth);
  const isRtl = language === "ar";

  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery({
    pageNumber: 1,
    keyword: "",
  });
  const { data: words = [], isLoading: loadingWords } = useGetAllWordsQuery({});
  const { data: exams = [], isLoading: loadingExams } = useGetAllQuizzesQuery({});

  const isLoading = loadingUsers || loadingWords || loadingExams;

  const stats = useMemo(() => {
    const totalUsers = usersData?.total ?? 0;
    const recentUsers = (usersData?.users ?? []).slice(0, 6);

    const approvedWords = (words as any[]).filter((w) => w.isApproved).length;
    const pendingWords = (words as any[]).length - approvedWords;
    const totalVotes = (words as any[]).reduce((sum, w) => sum + (w.likes?.length ?? 0), 0);
    const recentWords = [...(words as any[])].slice(0, 6);

    const activeExams = (exams as any[]).filter((e) => e.isActive).length;
    const inactiveExams = (exams as any[]).length - activeExams;
    const recentExams = [...(exams as any[])].slice(0, 5);

    return {
      totalUsers,
      recentUsers,
      approvedWords,
      pendingWords,
      totalVotes,
      recentWords,
      activeExams,
      inactiveExams,
      recentExams,
    };
  }, [usersData, words, exams]);

  if (isLoading)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  const greeting = isRtl
    ? `مرحباً، ${adminUserInfo?.name ?? "المدير"}`
    : `Welcome, ${adminUserInfo?.name ?? "Admin"}`;

  return (
    <Layout>
      <div
        className={`lg:px-4 mb-10 w-full max-w-5xl py-3 mt-[70px] lg:mt-[50px] px-2 ${isRtl ? "text-right" : ""}`}>
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-zinc-900">{greeting}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {isRtl
              ? "هذا ملخص كل شيء في النظام."
              : "Here's a summary of everything in the platform."}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="size-5 text-blue-600" />}
            color="bg-blue-50"
            label={isRtl ? "المستخدمون" : "Users"}
            value={stats.totalUsers}
            sub={isRtl ? "إجمالي المسجلين" : "Total registered"}
            onClick={() => navigate("/userlist")}
          />
          <StatCard
            icon={<BookText className="size-5 text-violet-600" />}
            color="bg-violet-50"
            label={isRtl ? "الكلمات" : "Words"}
            value={(words as any[]).length}
            sub={`${stats.approvedWords} ${isRtl ? "معتمد" : "approved"} · ${stats.pendingWords} ${isRtl ? "قيد المراجعة" : "pending"}`}
            onClick={() => navigate("/wordlist")}
          />
          <StatCard
            icon={<Brain className="size-5 text-emerald-600" />}
            color="bg-emerald-50"
            label={isRtl ? "الاختبارات" : "Exams"}
            value={(exams as any[]).length}
            sub={`${stats.activeExams} ${isRtl ? "نشط" : "active"} · ${stats.inactiveExams} ${isRtl ? "غير نشط" : "inactive"}`}
            onClick={() => navigate("/quizlist")}
          />
          <StatCard
            icon={<Heart className="size-5 text-rose-500 fill-rose-300" />}
            color="bg-rose-50"
            label={isRtl ? "التصويتات" : "Total Votes"}
            value={stats.totalVotes}
            sub={isRtl ? "على جميع الكلمات" : "Across all words"}
          />
        </div>

        {/* ── Words breakdown bar ── */}
        {(words as any[]).length > 0 && (
          <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-zinc-700">
                {isRtl ? "حالة الكلمات" : "Words Status"}
              </h2>
              <span className="text-xs text-zinc-400">
                {(words as any[]).length} {isRtl ? "كلمة" : "total"}
              </span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full bg-green-400 transition-all"
                style={{ width: `${(stats.approvedWords / (words as any[]).length) * 100}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${(stats.pendingWords / (words as any[]).length) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span className="size-2.5 rounded-full bg-green-400 shrink-0" />
                {isRtl ? "معتمد" : "Approved"} ({stats.approvedWords})
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span className="size-2.5 rounded-full bg-amber-400 shrink-0" />
                {isRtl ? "قيد المراجعة" : "Pending"} ({stats.pendingWords})
              </span>
            </div>
          </div>
        )}

        {/* ── Recent users + recent words ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Recent users */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <SectionHeader
              title={isRtl ? "آخر المستخدمين" : "Recent Users"}
              action={isRtl ? "عرض الكل" : "View all"}
              onAction={() => navigate("/userlist")}
            />
            <div className="flex flex-col divide-y divide-zinc-100">
              {stats.recentUsers.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  {isRtl ? "لا يوجد مستخدمون" : "No users yet"}
                </p>
              ) : (
                stats.recentUsers.map((u: any) => (
                  <button
                    key={u._id}
                    onClick={() => navigate(`/userlist/${u._id}`)}
                    className="flex items-center gap-3 py-2.5 hover:bg-zinc-50 -mx-2 px-2 rounded-lg transition-colors text-left">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 uppercase">
                      {u.name?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{u.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                    </div>
                    {u.isAdmin && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 shrink-0">
                        Admin
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent words */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <SectionHeader
              title={isRtl ? "آخر الكلمات" : "Recent Words"}
              action={isRtl ? "عرض الكل" : "View all"}
              onAction={() => navigate("/wordlist")}
            />
            <div className="flex flex-col divide-y divide-zinc-100">
              {stats.recentWords.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  {isRtl ? "لا توجد كلمات" : "No words yet"}
                </p>
              ) : (
                stats.recentWords.map((w: any) => (
                  <button
                    key={w._id}
                    onClick={() => navigate(`/wordlist/${w._id}`)}
                    className="flex items-center gap-3 py-2.5 hover:bg-zinc-50 -mx-2 px-2 rounded-lg transition-colors text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-extrabold text-zinc-800">{w.kuwaitiWord}</p>
                        <span
                          className={clsx(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold",
                            w.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700",
                          )}>
                          {w.isApproved
                            ? isRtl
                              ? "معتمد"
                              : "Approved"
                            : isRtl
                              ? "قيد المراجعة"
                              : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{w.arabicMeaning}</p>
                    </div>
                    {(w.likes?.length ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 shrink-0">
                        <Heart className="size-3 fill-rose-300 stroke-none" />
                        {w.likes.length}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Quiz exams ── */}
        {(exams as any[]).length > 0 && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <SectionHeader
              title={isRtl ? "الاختبارات" : "Quiz Exams"}
              action={isRtl ? "إدارة" : "Manage"}
              onAction={() => navigate("/quizlist")}
            />
            <div className="flex flex-col divide-y divide-zinc-100">
              {stats.recentExams.map((exam: any) => (
                <div key={exam._id} className="flex items-center gap-3 py-2.5">
                  <div
                    className={clsx(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl",
                      exam.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-zinc-100 text-zinc-400",
                    )}>
                    <Brain className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-800 truncate">
                      {language === "ar" ? exam.title?.ar : exam.title?.en}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {exam.questions?.length ?? 0} {isRtl ? "أسئلة" : "questions"}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shrink-0",
                      exam.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500",
                    )}>
                    {exam.isActive ? (
                      <>
                        <ToggleRight className="size-3.5" />
                        {isRtl ? "نشط" : "Active"}
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="size-3.5" />
                        {isRtl ? "غير نشط" : "Inactive"}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
