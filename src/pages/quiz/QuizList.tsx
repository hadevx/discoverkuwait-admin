//@ts-nocheck
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  X,
  Loader2,
  Brain,
  Pencil,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import {
  useGetAllQuizzesQuery,
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useToggleActiveQuizMutation,
  useUpdateQuizMutation,
} from "../../redux/queries/quizApi";
import Layout from "../../Layout";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import { useSelector } from "react-redux";

const CATEGORIES = ["dialect", "history", "geography", "traditions", "landmarks"];

const CATEGORY_COLORS: Record<string, string> = {
  dialect: "bg-purple-100 text-purple-700",
  history: "bg-amber-100 text-amber-700",
  geography: "bg-blue-100 text-blue-700",
  traditions: "bg-green-100 text-green-700",
  landmarks: "bg-rose-100 text-rose-700",
};

type BilingualField = { ar: string; en: string };
type OptionField = { ar: string; en: string };

type QuestionForm = {
  category: string;
  question: BilingualField;
  options: OptionField[];
  answer: number;
  explanation: BilingualField;
};

type ExamForm = {
  title: BilingualField;
  questions: QuestionForm[];
  isActive: boolean;
};

const emptyQuestion = (): QuestionForm => ({
  category: "history",
  question: { ar: "", en: "" },
  options: [
    { ar: "", en: "" },
    { ar: "", en: "" },
    { ar: "", en: "" },
    { ar: "", en: "" },
  ],
  answer: 0,
  explanation: { ar: "", en: "" },
});

const EMPTY_EXAM: ExamForm = {
  title: { ar: "", en: "" },
  questions: [emptyQuestion(), emptyQuestion(), emptyQuestion(), emptyQuestion(), emptyQuestion()],
  isActive: true,
};

const inputCls =
  "w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 bg-white";

// ── Single question block inside the form ──
function QuestionBlock({
  index,
  q,
  onChange,
  isRequired,
}: {
  index: number;
  q: QuestionForm;
  onChange: (updated: QuestionForm) => void;
  isRequired: boolean;
}) {
  const [open, setOpen] = useState(index === 0);

  const setOption = (i: number, field: "ar" | "en", value: string) => {
    const opts = [...q.options];
    opts[i] = { ...opts[i], [field]: value };
    onChange({ ...q, options: opts });
  };

  const isComplete =
    q.question.ar.trim() &&
    q.question.en.trim() &&
    q.options.every((o) => o.ar.trim() && o.en.trim()) &&
    q.explanation.ar.trim() &&
    q.explanation.en.trim();

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="size-4 text-green-500 shrink-0" />
          ) : (
            <span className="size-4 rounded-full border-2 border-zinc-300 shrink-0" />
          )}
          <span className="text-sm font-bold text-zinc-700">Question {index + 1}</span>
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              isRequired ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500",
            )}>
            {isRequired ? "Required" : "Optional"}
          </span>
          {q.question.en.trim() && (
            <span className="hidden sm:block text-xs text-zinc-400 truncate max-w-[200px]">
              — {q.question.en}
            </span>
          )}
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              CATEGORY_COLORS[q.category],
            )}>
            {q.category}
          </span>
        </div>
        {open ? (
          <ChevronUp className="size-4 text-zinc-400" />
        ) : (
          <ChevronDown className="size-4 text-zinc-400" />
        )}
      </button>

      {open && (
        <div className="p-4 flex flex-col gap-4 border-t border-zinc-100">
          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Category
            </label>
            <select
              value={q.category}
              onChange={(e) => onChange({ ...q, category: e.target.value })}
              className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Question text */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Question *
            </label>
            <input
              value={q.question.en}
              onChange={(e) => onChange({ ...q, question: { ...q.question, en: e.target.value } })}
              className={inputCls}
              placeholder="Question in English"
            />
            <input
              value={q.question.ar}
              onChange={(e) => onChange({ ...q, question: { ...q.question, ar: e.target.value } })}
              dir="rtl"
              className={inputCls}
              placeholder="السؤال بالعربي"
            />
          </div>

          {/* Options */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Options — click the circle to mark correct answer
            </label>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => (
                <div
                  key={i}
                  className={clsx(
                    "rounded-lg border p-2 flex flex-col gap-1.5 transition-colors",
                    q.answer === i ? "border-green-400 bg-green-50" : "border-zinc-200 bg-white",
                  )}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChange({ ...q, answer: i })}
                      className={clsx(
                        "shrink-0 size-6 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors",
                        q.answer === i
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-zinc-300 text-zinc-400 hover:border-green-400",
                      )}>
                      {i + 1}
                    </button>
                    <span className="text-xs font-semibold text-zinc-500">
                      Option {i + 1}
                      {q.answer === i && " · Correct answer"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={opt.en}
                      onChange={(e) => setOption(i, "en", e.target.value)}
                      className={inputCls}
                      placeholder="English"
                    />
                    <input
                      value={opt.ar}
                      onChange={(e) => setOption(i, "ar", e.target.value)}
                      dir="rtl"
                      className={inputCls}
                      placeholder="عربي"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Explanation *
            </label>
            <textarea
              value={q.explanation.en}
              onChange={(e) =>
                onChange({ ...q, explanation: { ...q.explanation, en: e.target.value } })
              }
              rows={2}
              className={inputCls}
              placeholder="Explanation in English"
            />
            <textarea
              value={q.explanation.ar}
              onChange={(e) =>
                onChange({ ...q, explanation: { ...q.explanation, ar: e.target.value } })
              }
              rows={2}
              dir="rtl"
              className={inputCls}
              placeholder="الشرح بالعربي"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Full exam form ──
function ExamFormFields({
  form,
  setForm,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
}: {
  form: ExamForm;
  setForm: (f: ExamForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const updateQuestion = (i: number, updated: QuestionForm) => {
    const qs = [...form.questions];
    qs[i] = updated;
    setForm({ ...form, questions: qs });
  };

  const completedCount = form.questions.filter(
    (q) =>
      q.question.ar.trim() &&
      q.question.en.trim() &&
      q.options.every((o) => o.ar.trim() && o.en.trim()) &&
      q.explanation.ar.trim() &&
      q.explanation.en.trim(),
  ).length;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
          Exam Title *
        </label>
        <input
          value={form.title.en}
          onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })}
          className={inputCls}
          placeholder="Title in English"
        />
        <input
          value={form.title.ar}
          onChange={(e) => setForm({ ...form, title: { ...form.title, ar: e.target.value } })}
          dir="rtl"
          className={inputCls}
          placeholder="العنوان بالعربي"
        />
      </div>

      {/* Questions progress */}
      <div className="flex items-center justify-between rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2">
        <span className="text-xs font-semibold text-zinc-600">
          Questions filled — 1 required, up to 4 optional
        </span>
        <span
          className={clsx(
            "text-sm font-bold",
            completedCount >= 1 ? "text-green-600" : "text-zinc-400",
          )}>
          {completedCount} / 5
        </span>
      </div>

      {/* 5 question blocks */}
      <div className="flex flex-col gap-2">
        {form.questions.map((q, i) => (
          <QuestionBlock
            key={i}
            index={i}
            q={q}
            isRequired={i === 0}
            onChange={(updated) => updateQuestion(i, updated)}
          />
        ))}
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5">
        <div>
          <p className="text-sm font-bold text-zinc-700">Active</p>
          <p className="text-xs text-zinc-400">
            {form.isActive ? "Visible in quiz game" : "Hidden from quiz game"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={clsx(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            form.isActive ? "bg-green-500" : "bg-zinc-300",
          )}>
          <span
            className={clsx(
              "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              form.isActive ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>

      <div className="flex gap-2 mt-1">
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

// ── Exam card (list view) ──
function ExamCard({
  exam,
  onEdit,
  onDelete,
  onToggle,
}: {
  exam: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                exam.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500",
              )}>
              {exam.isActive ? "Active" : "Inactive"}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
              {exam.questions?.length || 0} questions
            </span>
          </div>
          <p className="font-bold text-zinc-900">{exam.title?.en}</p>
          <p className="text-xs text-zinc-500 mt-0.5" dir="rtl">
            {exam.title?.ar}
          </p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <Pencil className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {expanded ? "Hide questions" : "Preview questions"}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {exam.questions?.map((q: any, i: number) => (
            <div key={i} className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-zinc-400">Q{i + 1}</span>
                <span
                  className={clsx(
                    "rounded-full px-1.5 py-0 text-[10px] font-semibold",
                    CATEGORY_COLORS[q.category],
                  )}>
                  {q.category}
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-800">{q.question?.en}</p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {q.options?.map((opt: any, oi: number) => (
                  <span
                    key={oi}
                    className={clsx(
                      "text-[10px] rounded px-1.5 py-0.5",
                      oi === q.answer ? "bg-green-100 text-green-700 font-bold" : "text-zinc-500",
                    )}>
                    {oi + 1}. {opt.en}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ──
const QuizList = () => {
  const language = useSelector((state: any) => state.language.lang);
  const isRtl = language === "ar";

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<ExamForm>(EMPTY_EXAM);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<ExamForm>(EMPTY_EXAM);

  const { data: exams = [], isLoading, isError } = useGetAllQuizzesQuery({});
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();
  const [toggleActiveQuiz] = useToggleActiveQuizMutation();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    try {
      await deleteQuiz(id).unwrap();
      toast.success("Exam deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleActiveQuiz(id).unwrap();
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const isQuestionEmpty = (q: QuestionForm) => !q.question.ar.trim() && !q.question.en.trim();

  const filterQuestions = (questions: QuestionForm[]) =>
    questions.filter((q, i) => i === 0 || !isQuestionEmpty(q));

  const validateForm = (form: ExamForm): string | null => {
    if (!form.title.ar.trim() || !form.title.en.trim())
      return "Exam title in both languages is required";
    const active = filterQuestions(form.questions);
    for (let i = 0; i < active.length; i++) {
      const q = active[i];
      const label = i === 0 ? "Question 1 (required)" : `Question ${i + 1}`;
      if (!q.question.ar.trim() || !q.question.en.trim())
        return `${label}: question text in both languages is required`;
      if (q.options.some((o) => !o.ar.trim() || !o.en.trim()))
        return `${label}: all 4 options must be filled`;
      if (!q.explanation.ar.trim() || !q.explanation.en.trim())
        return `${label}: explanation is required`;
    }
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm(addForm);
    if (err) return toast.error(err);
    try {
      await createQuiz({ ...addForm, questions: filterQuestions(addForm.questions) }).unwrap();
      toast.success("Exam created");
      setShowAddModal(false);
      setAddForm(EMPTY_EXAM);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create exam");
    }
  };

  const openEdit = (exam: any) => {
    setEditingExam(exam);
    setEditForm({
      title: { ar: exam.title?.ar ?? "", en: exam.title?.en ?? "" },
      questions: exam.questions?.map((q: any) => ({
        category: q.category,
        question: { ar: q.question?.ar ?? "", en: q.question?.en ?? "" },
        options: q.options?.map((o: any) => ({ ar: o.ar, en: o.en })) ?? emptyQuestion().options,
        answer: q.answer ?? 0,
        explanation: { ar: q.explanation?.ar ?? "", en: q.explanation?.en ?? "" },
      })) ?? [emptyQuestion(), emptyQuestion(), emptyQuestion(), emptyQuestion(), emptyQuestion()],
      isActive: exam.isActive,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm(editForm);
    if (err) return toast.error(err);
    try {
      await updateQuiz({
        id: editingExam._id,
        ...editForm,
        questions: filterQuestions(editForm.questions),
      }).unwrap();
      toast.success("Exam updated");
      setEditingExam(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update exam");
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={`lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto flex justify-between py-3 mt-[70px] lg:mt-[50px] px-2 ${isRtl ? "text-right" : ""}`}>
          <div className="w-full">
            {/* Header */}
            <div
              className={`flex justify-between items-start gap-3 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="w-full sm:w-auto flex gap-5 flex-col sm:flex-row items-start sm:items-center">
                <h1
                  dir={isRtl ? "rtl" : "ltr"}
                  className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-4 items-center flex-wrap">
                  {isRtl ? "الاختبارات" : "Quiz Exams"}:
                  <Badge icon={false} className="p-1">
                    <Brain strokeWidth={1} className="size-5" />
                    <p className="text-lg">{exams.length || 0}</p>
                  </Badge>
                </h1>
                <button
                  onClick={() => {
                    setAddForm(EMPTY_EXAM);
                    setShowAddModal(true);
                  }}
                  className="h-10 inline-flex items-center justify-center gap-2 rounded-lg px-4 text-xs sm:text-sm font-bold border bg-black text-white border-black hover:bg-black/90 transition w-full sm:w-auto">
                  <Plus className="size-4" />
                  {isRtl ? "إضافة اختبار" : "Add Exam"}
                </button>
              </div>
            </div>

            <Separator className="my-4 bg-black/20" />

            {isError ? (
              <p className="text-center py-20 text-red-500">Failed to load exams.</p>
            ) : exams.length === 0 ? (
              <div className="rounded-lg border p-8 bg-white mt-4 text-center text-gray-500 font-semibold">
                No exams yet. Click "Add Exam" to create one.
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="rounded-lg border p-3 sm:p-5 bg-white mt-4 hidden sm:block">
                  <table className="w-full text-sm border-gray-200 text-left text-gray-700">
                    <thead className="text-gray-900/50 font-semibold">
                      <tr>
                        <th className="pb-2 border-b">Title</th>
                        <th className="pb-2 border-b">Questions</th>
                        <th className="pb-2 border-b">Status</th>
                        <th className="pb-2 border-b">Created</th>
                        <th className="pb-2 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {exams.map((exam: any) => (
                        <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <p className="font-semibold text-zinc-800">{exam.title?.en}</p>
                            <p className="text-xs text-zinc-500" dir="rtl">
                              {exam.title?.ar}
                            </p>
                          </td>
                          <td className="py-3 text-zinc-600">
                            {exam.questions?.length || 0} questions
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => handleToggle(exam._id)}
                              className={clsx(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                                exam.isActive ? "bg-green-500" : "bg-zinc-300",
                              )}>
                              <span
                                className={clsx(
                                  "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                                  exam.isActive ? "translate-x-4" : "translate-x-0",
                                )}
                              />
                            </button>
                          </td>
                          <td className="py-3 text-xs text-zinc-400">
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(exam)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Pencil className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exam._id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden mt-4 space-y-3">
                  {exams.map((exam: any) => (
                    <ExamCard
                      key={exam._id}
                      exam={exam}
                      onEdit={() => openEdit(exam)}
                      onDelete={() => handleDelete(exam._id)}
                      onToggle={() => handleToggle(exam._id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="size-4" />
              </button>
              <h2 className="text-lg font-bold text-zinc-800 mb-5">Add New Exam (5 Questions)</h2>
              <ExamFormFields
                form={addForm}
                setForm={setAddForm}
                onSubmit={handleCreate}
                onClose={() => setShowAddModal(false)}
                isSubmitting={isCreating}
                submitLabel="Create Exam"
              />
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingExam && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingExam(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setEditingExam(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="size-4" />
              </button>
              <h2 className="text-lg font-bold text-zinc-800 mb-5">Edit Exam</h2>
              <ExamFormFields
                form={editForm}
                setForm={setEditForm}
                onSubmit={handleUpdate}
                onClose={() => setEditingExam(null)}
                isSubmitting={isUpdating}
                submitLabel="Save"
              />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default QuizList;
