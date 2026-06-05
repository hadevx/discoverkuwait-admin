//@ts-nocheck
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  ArrowLeft,
  Loader2Icon,
  ShieldBan,
  ShieldCheck,
  Trash2,
  BadgeCheck,
  Gem,
  Brain,
  Flame,
  Map,
  BookMarked,
  ThumbsUp,
  Trophy,
  Star,
  Calendar,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import { computePoints, getLevel, GOVERNORATE_NAMES, LEVELS } from "@/lib/userPoints";
import {
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useGetUsersQuery,
  useToggleBlockUserMutation,
  useSetToVerifiedMutation,
} from "../../redux/queries/userApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSelector } from "react-redux";

/* ── Small stat box ── */
function StatBox({
  icon,
  label,
  value,
  accent = "indigo",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50  border-indigo-100  text-indigo-700",
    amber: "bg-amber-50   border-amber-100   text-amber-700",
    blue: "bg-blue-50    border-blue-100    text-blue-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    purple: "bg-purple-50  border-purple-100  text-purple-700",
    rose: "bg-rose-50    border-rose-100    text-rose-700",
    orange: "bg-orange-50  border-orange-100  text-orange-700",
  };
  return (
    <div className={clsx("rounded-2xl border p-4 flex flex-col gap-2", colors[accent])}>
      <span className="opacity-70">{icon}</span>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold opacity-70 leading-snug">{label}</p>
    </div>
  );
}

/* ── Info field ── */
function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className={clsx("text-sm font-semibold text-foreground break-all", mono && "font-mono")}>
        {value || "—"}
      </p>
    </div>
  );
}

export default function UserDetails() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);
  const isAr = language === "ar";

  const [toggleBlockUser] = useToggleBlockUserMutation();
  const [setToVerified] = useSetToVerifiedMutation();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();
  const { refetch: refetchList } = useGetUsersQuery(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: user,
    refetch,
    isLoading,
  } = useGetUserDetailsQuery<any>(userID, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const handleDelete = async () => {
    if (user?.isAdmin)
      return toast.error(isAr ? "لا يمكن حذف مسؤول" : "Cannot delete an admin user");
    try {
      await deleteUser(userID).unwrap();
      toast.success(isAr ? "تم حذف المستخدم" : "User deleted");
      refetchList();
      navigate("/userlist");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error");
    }
  };

  const handleBlock = async () => {
    try {
      await toggleBlockUser(userID).unwrap();
      refetch();
      toast.success(isAr ? "تم تحديث الحظر" : "Block status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error");
    }
  };

  const handleVerify = async () => {
    try {
      await setToVerified(userID).unwrap();
      refetch();
      toast.success(isAr ? "تم تحديث التوثيق" : "Verification updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error");
    }
  };

  const pts = user ? computePoints(user) : { quiz: 0, contrib: 0, votes: 0, explore: 0, total: 0 };
  const userLevel = getLevel(pts.total);
  const nextLevel = LEVELS[LEVELS.indexOf(userLevel) + 1] ?? null;
  const levelPct = nextLevel
    ? Math.min(
        100,
        Math.round(((pts.total - userLevel.min) / (nextLevel.min - userLevel.min)) * 100),
      )
    : 100;

  const fmt = (d: any) =>
    d
      ? new Date(d).toLocaleDateString(isAr ? "ar-KW" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const t = (en: string, ar: string) => (isAr ? ar : en);

  if (isLoading)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 pb-12 mt-[70px] lg:mt-[50px] w-full max-w-4xl">
        {/* ── Back + title ── */}
        <div className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="size-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-foreground leading-none">
              {t("User Details", "تفاصيل المستخدم")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* ── Profile hero card ── */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {user?.avatar ? (
                <img
                  src={`/avatar/${user.avatar}`}
                  alt={user.name}
                  className="size-20 rounded-2xl object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="size-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-extrabold uppercase shadow-sm">
                  {(user?.name || "U").charAt(0)}
                </div>
              )}
            </div>

            {/* Name + badges + actions */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {user?.isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold">
                        {t("Admin", "مسؤول")}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border",
                        user?.isVerified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-muted text-muted-foreground border-border",
                      )}>
                      <BadgeCheck className="size-3" />
                      {user?.isVerified ? t("Verified", "موثّق") : t("Unverified", "غير موثّق")}
                    </span>
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border",
                        user?.isBlocked
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200",
                      )}>
                      {user?.isBlocked ? t("Blocked", "محظور") : t("Active", "نشط")}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={handleVerify}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors",
                      user?.isVerified
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
                    )}>
                    <BadgeCheck className="size-3.5" />
                    {user?.isVerified ? t("Verified ✓", "موثّق ✓") : t("Verify", "توثيق")}
                  </button>
                  <button
                    onClick={handleBlock}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors",
                      user?.isBlocked
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200",
                    )}>
                    {user?.isBlocked ? (
                      <>
                        <ShieldCheck className="size-3.5" />
                        {t("Unblock", "إزالة الحظر")}
                      </>
                    ) : (
                      <>
                        <ShieldBan className="size-3.5" />
                        {t("Block", "حظر")}
                      </>
                    )}
                  </button>
                  {!user?.isAdmin && (
                    <button
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors">
                      <Trash2 className="size-3.5" />
                      {t("Delete", "حذف")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="info">
          <TabsList className="w-full h-auto bg-card border border-border rounded-2xl p-1 flex gap-1 mb-6 shadow-sm">
            {[
              {
                value: "info",
                en: "Overview",
                ar: "نظرة عامة",
                icon: <User className="size-3.5" />,
              },
              {
                value: "progress",
                en: "Progress",
                ar: "التقدّم",
                icon: <Trophy className="size-3.5" />,
              },
              {
                value: "activity",
                en: "Activity",
                ar: "النشاط",
                icon: <Star className="size-3.5" />,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                {tab.icon}
                {isAr ? tab.ar : tab.en}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── Tab: Overview ─── */}
          <TabsContent value="info">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                {t("User Information", "معلومات المستخدم")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label={t("Full Name", "الاسم الكامل")} value={user?.name} />
                <Field label={t("Email Address", "البريد الإلكتروني")} value={user?.email} mono />
                <Field label={t("Joined", "تاريخ التسجيل")} value={fmt(user?.createdAt)} />
                <Field
                  label={t("Last Quiz", "آخر اختبار")}
                  value={
                    user?.lastQuizDate ? fmt(user.lastQuizDate) : t("Never played", "لم يلعب بعد")
                  }
                />
                <Field
                  label={t("Role", "الدور")}
                  value={user?.isAdmin ? t("Administrator", "مسؤول") : t("User", "مستخدم")}
                />
                <Field
                  label={t("Status", "الحالة")}
                  value={user?.isBlocked ? t("Blocked", "محظور") : t("Active", "نشط")}
                />
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab: Progress ─── */}
          <TabsContent value="progress">
            <div className="flex flex-col gap-5">
              {/* Total points + level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Points card */}
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 flex items-center gap-4 shadow-sm">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 shadow-sm">
                    <Gem className="size-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                      {t("Total Points", "إجمالي النقاط")}
                    </p>
                    <p className="text-4xl font-black text-amber-900 leading-none mt-1">
                      {pts.total}
                    </p>
                  </div>
                </div>

                {/* Level card */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {t("Level", "المستوى")}
                  </p>
                  <p className="text-2xl font-extrabold text-foreground">
                    {isAr ? userLevel.ar : userLevel.en}
                  </p>
                  <div className="mt-3 h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${levelPct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {nextLevel
                      ? `${nextLevel.min - pts.total} ${t("pts to", "نقطة للوصول إلى")} ${isAr ? nextLevel.ar : nextLevel.en}`
                      : t("Maximum level reached", "أعلى مستوى")}
                  </p>
                </div>
              </div>

              {/* Points breakdown */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  {t("Points Breakdown", "تفصيل النقاط")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox
                    icon={<Brain className="size-5" />}
                    label={t("Quiz", "اختبارات")}
                    value={pts.quiz}
                    accent="blue"
                  />
                  <StatBox
                    icon={<Map className="size-5" />}
                    label={t("Explore", "استكشاف")}
                    value={pts.explore}
                    accent="green"
                  />
                  <StatBox
                    icon={<BookMarked className="size-5" />}
                    label={t("Contributions", "مساهمات")}
                    value={pts.contrib}
                    accent="purple"
                  />
                  <StatBox
                    icon={<ThumbsUp className="size-5" />}
                    label={t("Votes", "تصويت")}
                    value={pts.votes}
                    accent="rose"
                  />
                </div>
              </div>

              {/* Quiz stats */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  {t("Quiz Stats", "إحصائيات الاختبار")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    {
                      label: t("Games Played", "اختبارات"),
                      value: user?.quizGamesPlayed || 0,
                      icon: <Brain className="size-4 text-blue-500" />,
                      accent: "blue",
                    },
                    {
                      label: t("Correct Answers", "إجابات صحيحة"),
                      value: user?.quizTotalCorrect || 0,
                      icon: <Star className="size-4 text-yellow-500" />,
                      accent: "amber",
                    },
                    {
                      label: t("Best Score", "أفضل نتيجة"),
                      value: user?.quizBestScore
                        ? `${user.quizBestScore}/${user.quizBestTotal}`
                        : "—",
                      icon: <Trophy className="size-4 text-amber-500" />,
                      accent: "amber",
                    },
                    {
                      label: t("Streak", "السلسلة"),
                      value: `${user?.streak || 0}d`,
                      icon: <Flame className="size-4 text-orange-500" />,
                      accent: "orange",
                    },
                    {
                      label: t("Best Streak", "أطول سلسلة"),
                      value: `${user?.bestStreak || 0}d`,
                      icon: <Flame className="size-4 text-red-500" />,
                      accent: "rose",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center gap-1.5 shadow-sm">
                      {s.icon}
                      <p className="text-xl font-black text-foreground">{s.value}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground leading-tight">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab: Activity ─── */}
          <TabsContent value="activity">
            <div className="flex flex-col gap-5">
              {/* Activity summary */}
              <div className="grid grid-cols-3 gap-3">
                <StatBox
                  icon={<BookMarked className="size-5" />}
                  label={t("Words Submitted", "كلمات مُضافة")}
                  value={user?.submittedWords?.length || 0}
                  accent="purple"
                />
                <StatBox
                  icon={<ThumbsUp className="size-5" />}
                  label={t("Words Voted", "تصويتات")}
                  value={user?.votedWords?.length || 0}
                  accent="rose"
                />
                <StatBox
                  icon={<CheckCircle2 className="size-5" />}
                  label={t("Quizzes Done", "اختبارات مكتملة")}
                  value={user?.completedQuizzes?.length || 0}
                  accent="green"
                />
              </div>

              {/* Explored governorates */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Map className="size-4 text-emerald-500" />
                    {t("Explored Governorates", "المحافظات المستكشفة")}
                  </h3>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-xs font-bold">
                    {user?.exploredAreas?.length || 0} / 6
                  </span>
                </div>
                {user?.exploredAreas?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(user.exploredAreas as string[]).map((id: string) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {isAr
                          ? (GOVERNORATE_NAMES[id]?.ar ?? id)
                          : (GOVERNORATE_NAMES[id]?.en ?? id)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t("No governorates explored yet.", "لم يستكشف أي محافظة بعد.")}
                  </p>
                )}
              </div>

              {/* Submitted words */}
              {(user?.submittedWords?.length || 0) > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                    <BookMarked className="size-4 text-purple-500" />
                    {t("Submitted Words", "الكلمات المُضافة")}
                  </h3>
                  <div className="flex flex-col divide-y divide-border">
                    {(user.submittedWords as any[]).slice(0, 10).map((w: any, i: number) => (
                      <div
                        key={w.id ?? i}
                        className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{w.word}</p>
                          <p className="text-xs text-muted-foreground truncate">{w.meaningAr}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {w.isApproved !== undefined && (
                            <span
                              className={clsx(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                                w.isApproved
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200",
                              )}>
                              {w.isApproved ? t("Approved", "معتمد") : t("Pending", "قيد المراجعة")}
                            </span>
                          )}
                          {w.date && (
                            <span className="text-[10px] text-muted-foreground">{w.date}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {user.submittedWords.length > 10 && (
                      <p className="pt-3 text-xs text-muted-foreground text-center">
                        +{user.submittedWords.length - 10} {t("more", "إضافية")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Delete confirmation ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Delete User", "حذف المستخدم")}</DialogTitle>
          </DialogHeader>
          <p className="py-3 text-sm text-muted-foreground">
            {t(
              "Are you sure you want to delete this user? This cannot be undone.",
              "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
            )}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("Cancel", "إلغاء")}
            </Button>
            <Button variant="destructive" disabled={loadingDelete} onClick={handleDelete}>
              {loadingDelete && <Loader2Icon className="animate-spin size-4 mr-2" />}
              {t("Delete", "حذف")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
