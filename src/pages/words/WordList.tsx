import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Plus, Trash2, X, Loader2, BookText, ArrowUpDown, Pencil, Heart } from "lucide-react";
import clsx from "clsx";
import {
  useGetAllWordsQuery,
  useCreateWordMutation,
  useDeleteWordMutation,
  useApproveWordMutation,
  useUpdateWordMutation,
} from "../../redux/queries/wordsApi";
import Layout from "../../Layout";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import { useSelector } from "react-redux";

const CATEGORIES = ["all", "slang", "food", "greetings", "expressions", "places", "other"];
type StatusFilter = "all" | "approved" | "pending";
type SortKey = "newest" | "oldest" | "word";

type WordForm = {
  kuwaitiWord: string;
  arabicMeaning: string;
  englishMeaning: string;
  example: string;
  category: string;
  isApproved: boolean;
};

const EMPTY_FORM: WordForm = {
  kuwaitiWord: "",
  arabicMeaning: "",
  englishMeaning: "",
  example: "",
  category: "slang",
  isApproved: false,
};

const inputCls =
  "w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 bg-white";

// ✅ Defined OUTSIDE WordList so it's never remounted on re-render
function WordFormFields({
  form,
  setForm,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  approvedLabel,
}: {
  form: WordForm;
  setForm: (f: WordForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  approvedLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">
          Kuwaiti Word *
        </label>
        <input
          value={form.kuwaitiWord}
          onChange={(e) => setForm({ ...form, kuwaitiWord: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">
          Arabic Meaning *
        </label>
        <input
          value={form.arabicMeaning}
          onChange={(e) => setForm({ ...form, arabicMeaning: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">
          English Meaning *
        </label>
        <input
          value={form.englishMeaning}
          onChange={(e) => setForm({ ...form, englishMeaning: e.target.value })}
          dir="ltr"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">
          Example
        </label>
        <textarea
          value={form.example}
          onChange={(e) => setForm({ ...form, example: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={inputCls}>
          {CATEGORIES.filter((c) => c !== "all").map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5">
        <div>
          <p className="text-sm font-bold text-zinc-700">{approvedLabel}</p>
          <p className="text-xs text-zinc-400">
            {form.isApproved ? "Visible to public" : "Hidden from public"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, isApproved: !form.isApproved })}
          className={clsx(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            form.isApproved ? "bg-green-500" : "bg-zinc-300",
          )}>
          <span
            className={clsx(
              "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              form.isApproved ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-zinc-200 rounded-lg py-2 text-sm font-semibold hover:bg-zinc-50 transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-60">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}

function VotesCell({ likes }: { likes: any[] }) {
  const [open, setOpen] = useState(false);
  const count = likes?.length ?? 0;

  if (count === 0)
    return <span className="text-zinc-300 text-xs font-semibold">—</span>;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-500 hover:bg-rose-100 transition-colors border border-rose-100">
        <Heart className="size-3 fill-rose-400 stroke-none" />
        {count}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-7 z-20 min-w-[160px] rounded-xl border border-zinc-200 bg-white shadow-xl p-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 mb-1.5">
              Voted by
            </p>
            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              {likes.map((u: any) => (
                <span
                  key={u._id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50">
                  <span className="size-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase shrink-0">
                    {u.name?.[0] ?? "?"}
                  </span>
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const WordList = () => {
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang);

  const labels: any = {
    en: {
      words: "Words",
      searchPlaceholder: "Search by word, Arabic or English meaning",
      noWordsFound: "No words found.",
      all: "All",
      approved: "Approved",
      pending: "Pending",
      newest: "Newest",
      oldest: "Oldest",
      sortWord: "Word A-Z",
      addWord: "Add Word",
      editWord: "Edit Word",
      word: "Word",
      arabic: "Arabic",
      english: "English",
      category: "Category",
      status: "Status",
      submittedBy: "Submitted by",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
    },
    ar: {
      words: "الكلمات",
      searchPlaceholder: "ابحث بالكلمة أو المعنى",
      noWordsFound: "لم يتم العثور على كلمات.",
      all: "الكل",
      approved: "معتمد",
      pending: "قيد المراجعة",
      newest: "الأحدث",
      oldest: "الأقدم",
      sortWord: "أبجدي",
      addWord: "إضافة كلمة",
      editWord: "تعديل الكلمة",
      word: "الكلمة",
      arabic: "المعنى بالعربي",
      english: "المعنى بالإنجليزي",
      category: "التصنيف",
      status: "الحالة",
      submittedBy: "مقدّم من",
      actions: "الإجراءات",
      save: "حفظ",
      cancel: "إلغاء",
    },
  };

  const t = labels[language];

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<WordForm>(EMPTY_FORM);
  const [editingWord, setEditingWord] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<WordForm>(EMPTY_FORM);

  const { data: words = [], isLoading, isError } = useGetAllWordsQuery({}, { refetchOnMountOrArgChange: true });
  const [createWord, { isLoading: isCreating }] = useCreateWordMutation();
  const [updateWord, { isLoading: isUpdating }] = useUpdateWordMutation();
  const [deleteWord] = useDeleteWordMutation();
  const [approveWord] = useApproveWordMutation();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...words].filter((w: any) => {
      const matchesSearch =
        !q ||
        w.kuwaitiWord?.toLowerCase().includes(q) ||
        w.arabicMeaning?.includes(q) ||
        w.englishMeaning?.toLowerCase().includes(q);
      const matchesCategory = category === "all" || w.category === category;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && w.isApproved) ||
        (statusFilter === "pending" && !w.isApproved);
      return matchesSearch && matchesCategory && matchesStatus;
    });

    list.sort((a: any, b: any) => {
      if (sortKey === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "word") return a.kuwaitiWord.localeCompare(b.kuwaitiWord);
      return 0;
    });

    return list;
  }, [words, search, category, statusFilter, sortKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this word?")) return;
    try {
      await deleteWord(id).unwrap();
      toast.success("Word deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleToggleApprove = async (id: string) => {
    try {
      await approveWord(id).unwrap();
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.kuwaitiWord || !addForm.arabicMeaning || !addForm.englishMeaning) {
      return toast.error("Please fill all required fields");
    }
    try {
      await createWord(addForm).unwrap();
      toast.success("Word created");
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create word");
    }
  };

  const openEdit = (w: any) => {
    setEditingWord(w);
    setEditForm({
      kuwaitiWord: w.kuwaitiWord,
      arabicMeaning: w.arabicMeaning,
      englishMeaning: w.englishMeaning,
      example: w.example ?? "",
      category: w.category,
      isApproved: w.isApproved,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.kuwaitiWord || !editForm.arabicMeaning || !editForm.englishMeaning) {
      return toast.error("Please fill all required fields");
    }
    try {
      await updateWord({ id: editingWord._id, ...editForm }).unwrap();
      toast.success("Word updated");
      setEditingWord(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update word");
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={`lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto flex justify-between py-3 mt-[70px] lg:mt-[50px] px-2 ${language === "ar" ? "text-right" : ""}`}>
          <div className="w-full">
            {/* Header */}
            <div
              className={`flex justify-between items-start gap-3 flex-wrap ${language === "ar" ? "flex-row-reverse" : ""}`}>
              <div className="w-full sm:w-auto flex gap-5 flex-col sm:flex-row items-start sm:items-center">
                <h1
                  dir={language === "ar" ? "rtl" : "ltr"}
                  className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-4 items-center flex-wrap">
                  {t.words}:
                  <Badge icon={false} className="p-1">
                    <BookText strokeWidth={1} className="size-5" />
                    <p className="text-lg">{words.length || 0}</p>
                  </Badge>
                </h1>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="h-10 inline-flex items-center justify-center gap-2 rounded-lg px-4 text-xs sm:text-sm font-bold border bg-black text-white border-black hover:bg-black/90 transition w-full sm:w-auto">
                  <Plus className="size-4" />
                  {t.addWord}
                </button>
              </div>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Filters */}
            <div className="mt-2 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_160px_160px] gap-3 items-center">
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                  />
                  {search.trim() && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                      <X className="size-5" />
                    </button>
                  )}
                </div>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border bg-white border-gray-300 rounded-lg py-3 px-3 text-sm focus:outline-none focus:border-blue-500 focus:border-2">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="border bg-white border-gray-300 rounded-lg py-3 px-3 text-sm focus:outline-none focus:border-blue-500 focus:border-2">
                  <option value="all">{t.all}</option>
                  <option value="approved">{t.approved}</option>
                  <option value="pending">{t.pending}</option>
                </select>

                <div className="relative hidden sm:block">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <ArrowUpDown className="h-5 w-5" />
                  </span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="w-full cursor-pointer border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2">
                    <option value="newest">{t.newest}</option>
                    <option value="oldest">{t.oldest}</option>
                    <option value="word">{t.sortWord}</option>
                  </select>
                </div>
              </div>

              {/* Desktop Table */}
              {isError ? (
                <p className="text-center py-20 text-red-500">Failed to load words.</p>
              ) : filtered.length === 0 ? (
                <div className="rounded-lg border p-8 bg-white mt-4 text-center text-gray-500 font-semibold">
                  {t.noWordsFound}
                </div>
              ) : (
                <div className="rounded-lg border p-3 sm:p-5 bg-white mt-4 hidden sm:block">
                  <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700">
                    <thead className="bg-white text-gray-900/50 font-semibold">
                      <tr>
                        <th className="pb-2 border-b">{t.word}</th>
                        <th className="pb-2 border-b">{t.arabic}</th>
                        <th className="pb-2 border-b hidden md:table-cell">{t.english}</th>
                        <th className="pb-2 border-b">{t.category}</th>
                        <th className="pb-2 border-b">{t.status}</th>
                        <th className="pb-2 border-b">{language === "ar" ? "التصويتات" : "Votes"}</th>
                        <th className="pb-2 border-b">{t.submittedBy}</th>
                        <th className="pb-2 border-b">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filtered.map((w: any) => (
                        <tr
                          key={w._id}
                          className="hover:bg-gray-100 transition-all duration-300 font-bold">
                          <td className="py-3">
                            <button
                              onClick={() => navigate(`/wordlist/${w._id}`)}
                              className="font-extrabold text-zinc-800 hover:text-blue-600 hover:underline transition-colors text-left">
                              {w.kuwaitiWord}
                            </button>
                          </td>
                          <td className="py-3 text-zinc-600 font-normal">{w.arabicMeaning}</td>
                          <td className="py-3 text-zinc-600 font-normal hidden md:table-cell">
                            {w.englishMeaning}
                          </td>
                          <td className="py-3">
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                              {w.category}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleApprove(w._id)}
                              className={clsx(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                                w.isApproved ? "bg-green-500" : "bg-zinc-300",
                              )}>
                              <span
                                className={clsx(
                                  "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                                  w.isApproved ? "translate-x-4" : "translate-x-0",
                                )}
                              />
                            </button>
                          </td>
                          <td className="py-3">
                            <VotesCell likes={w.likes ?? []} />
                          </td>
                          <td className="py-3 text-zinc-500 font-normal">{w.user?.name || "—"}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(w)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Edit">
                                <Pencil className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(w._id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                title="Delete">
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile cards */}
              <div className="sm:hidden mt-4 space-y-3">
                {filtered.map((w: any) => (
                  <div key={w._id} className="w-full text-left rounded-xl border bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/wordlist/${w._id}`)}
                            className="font-extrabold text-zinc-900 hover:text-blue-600 hover:underline transition-colors text-left">
                            {w.kuwaitiWord}
                          </button>
                          <span
                            className={clsx(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              w.isApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700",
                            )}>
                            {w.isApproved ? t.approved : t.pending}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                            {w.category}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-600">{w.arabicMeaning}</p>
                        <p className="text-xs text-zinc-400" dir="ltr">
                          {w.englishMeaning}
                        </p>
                        {w.user?.name && (
                          <p className="mt-1 text-xs text-zinc-400">
                            {t.submittedBy}: {w.user.name}
                          </p>
                        )}
                        {(w.likes?.length ?? 0) > 0 && (
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                              <Heart className="size-3 fill-rose-400 stroke-none" />
                              {w.likes.length}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {w.likes.slice(0, 3).map((u: any) => u.name).join("، ")}
                              {w.likes.length > 3 && ` +${w.likes.length - 3}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(w)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w._id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="size-4" />
              </button>
              <h2 className="text-lg font-bold text-zinc-800 mb-5">{t.addWord}</h2>
              <WordFormFields
                form={addForm}
                setForm={setAddForm}
                onSubmit={handleCreate}
                onClose={() => setShowAddModal(false)}
                isSubmitting={isCreating}
                submitLabel={t.addWord}
                approvedLabel={t.approved}
              />
            </div>
          </div>
        </>
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingWord(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setEditingWord(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="size-4" />
              </button>
              <h2 className="text-lg font-bold text-zinc-800 mb-5">{t.editWord}</h2>
              <WordFormFields
                form={editForm}
                setForm={setEditForm}
                onSubmit={handleUpdate}
                onClose={() => setEditingWord(null)}
                isSubmitting={isUpdating}
                submitLabel={t.save}
                approvedLabel={t.approved}
              />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default WordList;
