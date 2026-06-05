import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import clsx from "clsx";
import {
  ArrowLeft,
  Heart,
  Pencil,
  Trash2,
  Calendar,
  User,
  BookText,
  Tag,
  MessageSquare,
  Loader2,
  X,
} from "lucide-react";
import {
  useGetWordByIdQuery,
  useUpdateWordMutation,
  useDeleteWordMutation,
  useApproveWordMutation,
} from "../../redux/queries/wordsApi";
import Layout from "../../Layout";
import Loader from "../../components/Loader";
import { Separator } from "../../components/ui/separator";
import { useSelector } from "react-redux";

const CATEGORIES = ["slang", "food", "greetings", "expressions", "places", "other"];

const inputCls =
  "w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 bg-white";

type WordForm = {
  kuwaitiWord: string;
  arabicMeaning: string;
  englishMeaning: string;
  pronunciation: string;
  example: string;
  category: string;
  isApproved: boolean;
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-zinc-800 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function WordDetail() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);
  const isRtl = language === "ar";

  const { data: word, isLoading, isError, refetch } = useGetWordByIdQuery(wordId!, {
    refetchOnMountOrArgChange: true,
  });

  const [updateWord, { isLoading: isUpdating }] = useUpdateWordMutation();
  const [deleteWord] = useDeleteWordMutation();
  const [approveWord] = useApproveWordMutation();

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<WordForm | null>(null);

  const openEdit = () => {
    if (!word) return;
    setEditForm({
      kuwaitiWord: word.kuwaitiWord,
      arabicMeaning: word.arabicMeaning,
      englishMeaning: word.englishMeaning,
      pronunciation: word.pronunciation ?? "",
      example: word.example ?? "",
      category: word.category,
      isApproved: word.isApproved,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !word) return;
    if (!editForm.kuwaitiWord || !editForm.arabicMeaning || !editForm.englishMeaning) {
      return toast.error("Please fill all required fields");
    }
    try {
      await updateWord({ id: word._id, ...editForm }).unwrap();
      toast.success("Word updated");
      setShowEdit(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!word) return;
    if (!confirm("Delete this word?")) return;
    try {
      await deleteWord(word._id).unwrap();
      toast.success("Word deleted");
      navigate("/wordlist");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleToggleApprove = async () => {
    if (!word) return;
    try {
      await approveWord(word._id).unwrap();
      toast.success("Status updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  if (isLoading) return <Layout><Loader /></Layout>;
  if (isError || !word) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 font-semibold">Word not found.</p>
        <button onClick={() => navigate("/wordlist")} className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1">
          <ArrowLeft className="size-4" /> Back to words
        </button>
      </div>
    </Layout>
  );

  const voters: any[] = Array.isArray(word.likes) ? word.likes : [];
  const createdAt = word.createdAt ? new Date(word.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <Layout>
      <div className={`lg:px-4 mb-10 w-full max-w-4xl py-3 mt-[70px] lg:mt-[50px] px-2 ${isRtl ? "text-right" : ""}`}>

        {/* Back */}
        <button
          onClick={() => navigate("/wordlist")}
          className="mb-5 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          <ArrowLeft className="size-4" />
          {isRtl ? "العودة إلى الكلمات" : "Back to words"}
        </button>

        {/* Header card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Kuwaiti Word</p>
              <h1 className="text-3xl font-black text-zinc-900">{word.kuwaitiWord}</h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status toggle */}
              <button
                onClick={handleToggleApprove}
                className={clsx(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border transition-colors",
                  word.isApproved
                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
                )}>
                <span className={clsx("size-2 rounded-full", word.isApproved ? "bg-green-500" : "bg-amber-400")} />
                {word.isApproved ? (isRtl ? "معتمد" : "Approved") : (isRtl ? "قيد المراجعة" : "Pending")}
              </button>

              <button
                onClick={openEdit}
                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                <Pencil className="size-3" />
                {isRtl ? "تعديل" : "Edit"}
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                <Trash2 className="size-3" />
                {isRtl ? "حذف" : "Delete"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {word.category}
            </span>
            {createdAt && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Calendar className="size-3" /> {createdAt}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

          {/* Left: word details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-700 mb-2 flex items-center gap-2">
              <BookText className="size-4 text-zinc-400" />
              {isRtl ? "تفاصيل الكلمة" : "Word Details"}
            </h2>
            <Separator className="mb-1 bg-zinc-100" />

            <InfoRow icon={<MessageSquare className="size-4" />} label="Arabic Meaning" value={word.arabicMeaning} />
            <InfoRow icon={<MessageSquare className="size-4" />} label="English Meaning" value={word.englishMeaning} />
            {word.pronunciation && (
              <InfoRow icon={<Tag className="size-4" />} label="Pronunciation" value={word.pronunciation} />
            )}
            {word.example && (
              <InfoRow icon={<Tag className="size-4" />} label="Example" value={word.example} />
            )}
            <InfoRow icon={<Tag className="size-4" />} label="Category" value={word.category} />
            <InfoRow icon={<User className="size-4" />} label="Submitted By" value={word.user?.name || "—"} />
            {word.user?.email && (
              <InfoRow icon={<User className="size-4" />} label="Email" value={word.user.email} />
            )}
          </div>

          {/* Right: votes */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                <Heart className="size-4 text-rose-400 fill-rose-300" />
                {isRtl ? "التصويتات" : "Votes"}
              </h2>
              <span className="rounded-full bg-rose-50 border border-rose-100 px-3 py-0.5 text-sm font-extrabold text-rose-500">
                {voters.length}
              </span>
            </div>
            <Separator className="mb-3 bg-zinc-100" />

            {voters.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">
                {isRtl ? "لا توجد تصويتات بعد" : "No votes yet"}
              </p>
            ) : (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {voters.map((u: any) => (
                  <div key={u._id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-zinc-50 transition-colors">
                    <span className="size-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 uppercase shrink-0">
                      {u.name?.[0] ?? "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{u.name}</p>
                      {u.email && <p className="text-xs text-zinc-400 truncate">{u.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && editForm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowEdit(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="size-4" />
              </button>
              <h2 className="text-lg font-bold text-zinc-800 mb-5">Edit Word</h2>
              <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">Kuwaiti Word *</label>
                  <input value={editForm.kuwaitiWord} onChange={(e) => setEditForm({ ...editForm, kuwaitiWord: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">Arabic Meaning *</label>
                  <input value={editForm.arabicMeaning} onChange={(e) => setEditForm({ ...editForm, arabicMeaning: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">English Meaning *</label>
                  <input value={editForm.englishMeaning} onChange={(e) => setEditForm({ ...editForm, englishMeaning: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">Pronunciation</label>
                  <input value={editForm.pronunciation} onChange={(e) => setEditForm({ ...editForm, pronunciation: e.target.value })} dir="ltr" placeholder="e.g. way-id" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">Example</label>
                  <textarea value={editForm.example} onChange={(e) => setEditForm({ ...editForm, example: e.target.value })} rows={2} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-zinc-700">Approved</p>
                    <p className="text-xs text-zinc-400">{editForm.isApproved ? "Visible to public" : "Hidden from public"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isApproved: !editForm.isApproved })}
                    className={clsx("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200", editForm.isApproved ? "bg-green-500" : "bg-zinc-300")}>
                    <span className={clsx("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200", editForm.isApproved ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setShowEdit(false)} className="flex-1 border border-zinc-200 rounded-lg py-2 text-sm font-semibold hover:bg-zinc-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-60">
                    {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
