//@ts-nocheck
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Layout from "../../Layout";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Globe,
  Wrench,
  BadgeCheck,
  Megaphone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleLang } from "../../redux/slices/languageSlice";
import { setUserInfo } from "../../redux/slices/authSlice";
import { useUpdateMyProfileMutation } from "../../redux/queries/userApi";
import {
  useUpdateStoreStatusMutation,
  useGetStoreStatusQuery,
} from "../../redux/queries/maintenanceApi";
import * as Popover from "@radix-ui/react-popover";

const EMOJI_LIST = [
  "🇰🇼","🕌","🌴","🌊","☀️","🏆","🎉","🎊","🔥","✨",
  "😀","😊","😄","🤩","🥳","😍","🙌","👋","👍","💪",
  "❤️","⭐","🌟","💡","🎯","📢","📣","🚀","💫","🌙",
  "📚","🎓","🎵","💻","📱","🛒","🏷️","💰","🎁","📌",
];

function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-base leading-none rounded-lg border border-border bg-background px-2 py-1 hover:bg-secondary transition-colors"
          title="Insert emoji">
          😊
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50 w-64 rounded-2xl border border-border bg-background p-3 shadow-xl">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_LIST.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => onPick(em)}
                className="flex items-center justify-center rounded-lg p-1.5 text-lg hover:bg-secondary transition-colors">
                {em}
              </button>
            ))}
          </div>
          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const language = useSelector((state: any) => state.language.lang);
  const adminUserInfo = useSelector((state: any) => state.auth.adminUserInfo);
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);

  /* ── Account ── */
  const [updateMyProfile, { isLoading: savingProfile }] = useUpdateMyProfileMutation();
  const [name, setName] = useState(adminUserInfo?.name ?? "");
  const [email, setEmail] = useState(adminUserInfo?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim())
      return toast.error(t("Name and email are required", "الاسم والبريد مطلوبان"));
    if (newPassword && newPassword !== confirmPassword)
      return toast.error(t("Passwords do not match", "كلمتا المرور غير متطابقتين"));
    if (newPassword && newPassword.length < 6)
      return toast.error(
        t("Password must be at least 6 characters", "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
      );
    try {
      const payload: any = { name: name.trim(), email: email.trim() };
      if (newPassword) payload.password = newPassword;
      const res = await updateMyProfile(payload).unwrap();
      dispatch(setUserInfo({ ...adminUserInfo, ...res }));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("Profile updated", "تم تحديث الملف الشخصي"));
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to update", "فشل التحديث"));
    }
  };

  /* ── Platform status ── */
  const { data: storeData, refetch, isLoading: loadingStatus } = useGetStoreStatusQuery(undefined);
  const [updateStoreStatus, { isLoading: savingStatus }] = useUpdateStoreStatusMutation();
  const current = storeData?.[0];

  const [siteStatus, setSiteStatus] = useState<"active" | "maintenance">("active");
  const [announcement, setAnnouncement] = useState("");
  const [bannerBg, setBannerBg] = useState("#18181b");
  const [bannerTextColor, setBannerTextColor] = useState("#ffffff");
  const announcementRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const el = announcementRef.current;
    const start = el?.selectionStart ?? announcement.length;
    const end = el?.selectionEnd ?? announcement.length;
    const next = announcement.slice(0, start) + emoji + announcement.slice(end);
    if (next.length > 280) return;
    setAnnouncement(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  useEffect(() => {
    if (current) {
      setSiteStatus(current.status === "maintenance" ? "maintenance" : "active");
      setAnnouncement(current.banner ?? "");
      setBannerBg(current.bannerBg ?? "#18181b");
      setBannerTextColor(current.bannerTextColor ?? "#ffffff");
    }
  }, [current]);

  const handleSavePlatform = async () => {
    try {
      await updateStoreStatus({
        status: siteStatus,
        banner: announcement.trim(),
        bannerBg,
        bannerTextColor,
        price: 0,
      }).unwrap();
      toast.success(t("Platform settings saved", "تم حفظ إعدادات المنصة"));
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to save", "فشل الحفظ"));
    }
  };

  return (
    <Layout>
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="px-4 sm:px-6 lg:px-8 pb-12 mt-[70px] lg:mt-[50px] w-full max-w-3xl">
        {/* Header */}
        <div className="pt-2 mb-6">
          <h1 className="text-xl font-extrabold text-foreground">{t("Settings", "الإعدادات")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("Manage your account, platform, and preferences", "إدارة حسابك والمنصة والتفضيلات")}
          </p>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="w-full h-auto bg-card border border-border rounded-2xl p-1 flex gap-1 mb-6 shadow-sm">
            {[
              {
                value: "account",
                en: "My Account",
                ar: "حسابي",
                icon: <User className="size-3.5" />,
              },
              {
                value: "platform",
                en: "Platform",
                ar: "المنصة",
                icon: <Globe className="size-3.5" />,
              },
              {
                value: "preferences",
                en: "Preferences",
                ar: "التفضيلات",
                icon: <CheckCircle2 className="size-3.5" />,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                {tab.icon}
                {isAr ? tab.ar : tab.en}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ════════════════════ ACCOUNT ════════════════════ */}
          <TabsContent value="account">
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              {/* Profile info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <User className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t("Profile Information", "معلومات الملف الشخصي")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Update your name and email address", "تحديث اسمك وبريدك الإلكتروني")}
                    </p>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <SectionLabel>{t("Full Name", "الاسم الكامل")}</SectionLabel>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                      placeholder={t("Your name", "اسمك")}
                    />
                  </div>
                  <div>
                    <SectionLabel>{t("Email Address", "البريد الإلكتروني")}</SectionLabel>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password change */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t("Change Password", "تغيير كلمة المرور")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Leave blank to keep your current password",
                        "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية",
                      )}
                    </p>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="flex flex-col gap-3">
                  <div>
                    <SectionLabel>{t("New Password", "كلمة المرور الجديدة")}</SectionLabel>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputCls + " pr-10"}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                        {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <SectionLabel>
                      {t("Confirm New Password", "تأكيد كلمة المرور الجديدة")}
                    </SectionLabel>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputCls + " pr-10"}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive font-semibold">
                      {t("Passwords do not match", "كلمتا المرور غير متطابقتين")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60 shadow-sm">
                  {savingProfile ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {t("Save Changes", "حفظ التغييرات")}
                </button>
              </div>
            </form>
          </TabsContent>

          {/* ════════════════════ PLATFORM ════════════════════ */}
          <TabsContent value="platform">
            <div className="flex flex-col gap-5">
              {/* Status card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {t("Site Status", "حالة الموقع")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "Control whether the site is accessible to visitors",
                          "التحكم في وصول الزوار للموقع",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="flex size-8 items-center justify-center rounded-full border border-border bg-background hover:bg-secondary transition">
                    <RefreshCw
                      className={`size-3.5 text-muted-foreground ${loadingStatus ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
                <Separator className="mb-4" />

                <SectionLabel>{t("Current Status", "الحالة الحالية")}</SectionLabel>
                <div className="grid grid-cols-2 gap-3 mb-1">
                  <button
                    type="button"
                    onClick={() => setSiteStatus("active")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      siteStatus === "active"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-background border-border text-muted-foreground hover:bg-secondary"
                    }`}>
                    <BadgeCheck className="size-4" />
                    {t("Active", "نشط")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSiteStatus("maintenance")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                      siteStatus === "maintenance"
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-background border-border text-muted-foreground hover:bg-secondary"
                    }`}>
                    <Wrench className="size-4" />
                    {t("Maintenance", "صيانة")}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {siteStatus === "maintenance"
                    ? t("Visitors will see a maintenance page.", "سيرى الزوار صفحة الصيانة.")
                    : t("Site is fully accessible to all visitors.", "الموقع متاح لجميع الزوار.")}
                </p>
              </div>

              {/* Announcement */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Megaphone className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t("Announcement Banner", "بانر الإعلان")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Shown at the top of the frontend for all visitors",
                        "يظهر أعلى الموقع لجميع الزوار",
                      )}
                    </p>
                  </div>
                </div>
                <Separator className="mb-4" />

                <div className="flex items-center justify-between mb-1.5">
                  <SectionLabel>{t("Banner Message", "نص الإعلان")}</SectionLabel>
                  <EmojiPicker onPick={insertEmoji} />
                </div>
                <textarea
                  ref={announcementRef}
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={3}
                  maxLength={280}
                  placeholder={t(
                    "e.g. We are launching new quiz exams this week! 🎉",
                    "مثال: سيتم إطلاق اختبارات جديدة هذا الأسبوع! 🎉",
                  )}
                  className={inputCls + " resize-none"}
                />
                <div className="flex items-center justify-between mt-1.5 mb-4">
                  <p className="text-xs text-muted-foreground">
                    {t("Leave empty to hide the banner", "اتركه فارغاً لإخفاء البانر")}
                  </p>
                  <span
                    className={`text-xs font-semibold ${announcement.length > 250 ? "text-destructive" : "text-muted-foreground"}`}>
                    {announcement.length}/280
                  </span>
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <SectionLabel>{t("Background Color", "لون الخلفية")}</SectionLabel>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="color"
                        value={bannerBg}
                        onChange={(e) => setBannerBg(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-border p-0.5 bg-background"
                      />
                      <span className="font-mono text-sm text-muted-foreground">{bannerBg}</span>
                    </div>
                  </div>
                  <div>
                    <SectionLabel>{t("Text Color", "لون النص")}</SectionLabel>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="color"
                        value={bannerTextColor}
                        onChange={(e) => setBannerTextColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-border p-0.5 bg-background"
                      />
                      <span className="font-mono text-sm text-muted-foreground">{bannerTextColor}</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {announcement.trim() && (
                  <div className="mt-1 overflow-hidden rounded-xl border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-2 pb-1">
                      {t("Preview", "معاينة")}
                    </p>
                    <div
                      className="w-full px-4 py-2.5 text-center text-sm font-medium"
                      style={{ backgroundColor: bannerBg, color: bannerTextColor }}>
                      {announcement}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePlatform}
                  disabled={savingStatus || loadingStatus}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60 shadow-sm">
                  {savingStatus ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {t("Save Platform Settings", "حفظ إعدادات المنصة")}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* ════════════════════ PREFERENCES ════════════════════ */}
          <TabsContent value="preferences">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Globe className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {t("Interface Language", "لغة الواجهة")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("Choose the language for the admin dashboard", "اختر لغة لوحة الإدارة")}
                  </p>
                </div>
              </div>
              <Separator className="mb-5" />

              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  onClick={() => {
                    if (isAr) dispatch(toggleLang());
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition ${
                    !isAr
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}>
                  <span className="text-2xl">🇬🇧</span>
                  <span className="text-sm font-bold">English</span>
                  {!isAr && <span className="text-[10px] font-semibold text-primary">Active</span>}
                </button>
                <button
                  onClick={() => {
                    if (!isAr) dispatch(toggleLang());
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition ${
                    isAr
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}>
                  <span className="text-2xl">🇸🇦</span>
                  <span className="text-sm font-bold">العربية</span>
                  {isAr && <span className="text-[10px] font-semibold text-primary">نشط</span>}
                </button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                {t(
                  "Language changes take effect immediately across the dashboard.",
                  "تأثير تغيير اللغة فوري في جميع أنحاء لوحة التحكم.",
                )}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
