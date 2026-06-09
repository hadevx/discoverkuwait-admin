import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Heart, MessageSquare, Calendar, Lock, LockOpen,
  Trash2, Check, X, CheckCircle2, Clock,
} from "lucide-react";
import Layout from "../../Layout";
import Loader from "../../components/Loader";
import { Separator } from "../../components/ui/separator";
import {
  useGetAdminTopicByIdQuery,
  useAdminCloseTopicMutation,
  useAdminDeleteTopicMutation,
} from "../../redux/queries/forumApi";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRef = { _id: string; name: string; avatar?: string };

type Comment = {
  _id: string;
  author: UserRef;
  text: string;
  createdAt: string;
};

type TopicDetail = {
  _id: string;
  author: UserRef;
  description: string;
  category: string;
  isClosed: boolean;
  likes: string[];
  comments: Comment[];
  createdAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  general: "General", restaurants: "Restaurants", cafes: "Cafes",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function UserAvatar({ user, size = "md" }: { user: UserRef; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "size-7" : "size-9";
  return user?.avatar ? (
    <img src={`/avatar/${user.avatar}`} alt={user.name}
      className={`${cls} object-cover rounded-md shrink-0`} />
  ) : (
    <div className={`${cls} rounded-md flex items-center uppercase justify-center font-semibold bg-[#f84713] text-white shrink-0 text-xs`}>
      {(user?.name || "U").charAt(0)}{(user?.name || "U").slice(-1)}
    </div>
  );
}

function DeleteCommentBtn({ onConfirm }: { onConfirm: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => { onConfirm(); setConfirm(false); }}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition active:scale-95">
        <Check className="size-3" />
      </button>
      <button onClick={() => setConfirm(false)}
        className="inline-flex items-center rounded-lg px-2 py-1 text-xs border border-gray-300 text-gray-500 hover:bg-gray-50">
        <X className="size-3" />
      </button>
    </span>
  );
  return (
    <button onClick={() => setConfirm(true)}
      className="opacity-0 group-hover:opacity-100 flex size-6 items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shrink-0">
      <Trash2 className="size-3.5" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: topic, isFetching, isError } = useGetAdminTopicByIdQuery(id!);
  const [adminCloseTopic] = useAdminCloseTopicMutation();
  const [adminDeleteTopic] = useAdminDeleteTopicMutation();

  const handleToggleClose = async () => {
    try {
      await adminCloseTopic(id!).unwrap();
      toast.success(topic?.isClosed ? "Topic opened" : "Topic closed");
    } catch {
      toast.error("Failed to update topic");
    }
  };

  const handleDeleteTopic = async () => {
    try {
      await adminDeleteTopic(id!).unwrap();
      toast.success("Topic deleted");
      navigate("/forum");
    } catch {
      toast.error("Failed to delete topic");
    }
  };

  const typedTopic = topic as TopicDetail | undefined;

  return (
    <Layout>
      {isFetching && <Loader />}

      <div className="lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto py-3 mt-[70px] lg:mt-[50px] px-2">

        {/* Back button */}
        <button
          onClick={() => navigate("/forum")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="size-4" />
          Back to Forum
        </button>

        {isError ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-400 font-semibold">
            Topic not found.
          </div>
        ) : typedTopic ? (
          <>
            {/* ── Topic card ── */}
            <div className="rounded-lg border bg-white p-4 sm:p-6">

              {/* Header row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-bold">
                    {CAT_LABELS[typedTopic.category] ?? typedTopic.category}
                  </span>
                  {typedTopic.isClosed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 text-xs font-bold px-2.5 py-0.5">
                      <Lock className="size-3" /> Closed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs font-bold px-2.5 py-0.5">
                      <CheckCircle2 className="size-3" /> Open
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleToggleClose}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition active:scale-95">
                    {typedTopic.isClosed
                      ? <><LockOpen className="size-3.5" /> Open Topic</>
                      : <><Lock className="size-3.5" /> Close Topic</>}
                  </button>
                  <DeleteTopicBtn onConfirm={handleDeleteTopic} />
                </div>
              </div>

              <Separator className="my-4 bg-black/10" />

              {/* Description */}
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" dir="auto">
                {typedTopic.description}
              </p>

              {/* Author + meta */}
              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <UserAvatar user={typedTopic.author} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{typedTopic.author?.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="size-3" /> {formatDate(typedTopic.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Heart className="size-4 text-rose-400" />
                    {typedTopic.likes?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-blue-400" />
                    {typedTopic.comments?.length ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Comments ── */}
            <div className="mt-4 rounded-lg border bg-white overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b">
                <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Comments
                  <span className="rounded-full bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5">
                    {typedTopic.comments?.length ?? 0}
                  </span>
                </h2>
              </div>

              {!typedTopic.comments?.length ? (
                <div className="px-6 py-10 text-center text-sm text-gray-400 font-semibold">
                  No comments yet.
                </div>
              ) : (
                <div className="divide-y">
                  {typedTopic.comments.map((c) => (
                    <AdminCommentRow key={c._id} comment={c} topicId={id!} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}

// ─── Comment row (with admin delete) ─────────────────────────────────────────
function AdminCommentRow({ comment, topicId }: { comment: Comment; topicId: string }) {
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    try {
      const backend =
        import.meta.env.VITE_ENVIRONMENT === "production"
          ? import.meta.env.VITE_API_URL
          : import.meta.env.VITE_API_LOCALHOST;
      const res = await fetch(`${backend}/api/topics/admin/${topicId}/comments/${comment._id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error();
      setDeleted(true);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (deleted) return null;

  return (
    <div className="group flex items-start gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 transition">
      <UserAvatar user={comment.author} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-gray-800">{comment.author?.name}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="size-3" /> {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap" dir="auto">{comment.text}</p>
      </div>
      <DeleteCommentBtn onConfirm={handleDelete} />
    </div>
  );
}

// ─── Delete topic confirm button ──────────────────────────────────────────────
function DeleteTopicBtn({ onConfirm }: { onConfirm: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => { onConfirm(); setConfirm(false); }}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition active:scale-95">
        <Check className="size-3" /> Confirm Delete
      </button>
      <button onClick={() => setConfirm(false)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs border border-gray-300 text-gray-500 hover:bg-gray-50 transition">
        <X className="size-3" />
      </button>
    </span>
  );
  return (
    <button onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition active:scale-95">
      <Trash2 className="size-3.5" /> Delete Topic
    </button>
  );
}
