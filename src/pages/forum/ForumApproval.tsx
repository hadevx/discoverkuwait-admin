import { useState } from "react";
import { toast } from "react-toastify";
import {
  Check,
  X,
  Trash2,
  Images,
  Clock,
  CheckCircle2,
  Loader2,
  Heart,
  Calendar,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import {
  useGetPendingPostsQuery,
  useGetApprovedPostsQuery,
  useApprovePostMutation,
  useRejectPostMutation,
  useAdminDeletePostMutation,
} from "../../redux/queries/forumApi";
import Layout from "../../Layout";

type UserRef = { _id: string; name: string; avatar?: string };
type Post = {
  _id: string;
  author: UserRef;
  imageUrl: string;
  caption: string;
  votes: UserRef[];
  isApproved: boolean;
  createdAt: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ user, size = "sm" }: { user: UserRef; size?: "sm" | "md" }) {
  const cls = size === "md" ? "size-9" : "size-7";
  return user.avatar ? (
    <img
      src={`/avatar/${user.avatar}`}
      alt={user.name}
      className={clsx(cls, "rounded-full object-cover shrink-0 ring-2 ring-white")}
    />
  ) : (
    <div
      className={clsx(
        cls,
        "rounded-full shrink-0 ring-2 ring-white flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold uppercase text-xs",
      )}>
      {user.name?.[0] ?? "?"}
    </div>
  );
}

// ─── Likes Modal ──────────────────────────────────────────────────────────────
function LikesModal({ votes, onClose }: { votes: UserRef[]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-zinc-900 text-sm">
              {votes.length} {votes.length === 1 ? "Like" : "Likes"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
          {votes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-zinc-400">
              <Heart className="size-8" />
              <p className="text-sm">No likes yet</p>
            </div>
          ) : (
            votes.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition-colors">
                <Avatar user={user} size="md" />
                <p className="text-sm font-semibold text-zinc-800">{user.name}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
type PostCardProps = {
  post: Post;
  tab: "pending" | "approved";
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onShowLikes: (votes: UserRef[]) => void;
};

function PostCard({ post, tab, onApprove, onReject, onDelete, onShowLikes }: PostCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="relative overflow-hidden bg-zinc-100">
        <img
          src={post.imageUrl}
          alt={post.caption || "forum post"}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ aspectRatio: "4/3" }}
        />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {tab === "pending" ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Clock className="size-3" /> Pending
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <CheckCircle2 className="size-3" /> Live
            </span>
          )}
        </div>

        {/* Likes badge — top right, clickable */}
        <button
          onClick={() => onShowLikes(post.votes)}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500 transition-colors shadow-sm">
          <Heart className="size-3 fill-white" />
          {post.votes.length}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          <Avatar user={post.author} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-zinc-900 truncate">{post.author?.name}</p>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Calendar className="size-3" />
              <span>{formatDate(post.createdAt)}</span>
              <span className="mx-1">·</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Caption */}
        {post.caption ? (
          <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">{post.caption}</p>
        ) : (
          <p className="text-sm text-zinc-300 italic">No caption</p>
        )}

        {/* Likes row */}
        {post.votes.length > 0 && (
          <button
            onClick={() => onShowLikes(post.votes)}
            className="flex items-center gap-2 group/likes">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {post.votes.slice(0, 4).map((v) => (
                <Avatar key={v._id} user={v} size="sm" />
              ))}
            </div>
            <span className="text-xs text-zinc-500 group-hover/likes:text-rose-500 transition-colors font-medium">
              {post.votes.length === 1
                ? `${post.votes[0].name} liked this`
                : `${post.votes[0].name} and ${post.votes.length - 1} other${post.votes.length > 2 ? "s" : ""}`}
            </span>
            <ChevronRight className="size-3 text-zinc-400 group-hover/likes:text-rose-500 transition-colors" />
          </button>
        )}

        {/* Divider */}
        <div className="h-px bg-zinc-100" />

        {/* Actions */}
        {tab === "pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(post._id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 active:scale-95 transition-all">
              <Check className="size-3.5" /> Approve
            </button>
            <button
              onClick={() => onReject(post._id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2 text-xs font-bold text-white hover:bg-rose-600 active:scale-95 transition-all">
              <X className="size-3.5" /> Reject
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => {
                    onDelete(post._id);
                    setConfirmDelete(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2 text-xs font-bold text-white hover:bg-rose-600 active:scale-95 transition-all">
                  <Check className="size-3.5" /> Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                <Trash2 className="size-3.5" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForumApproval() {
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [likesModal, setLikesModal] = useState<UserRef[] | null>(null);

  const { data: pendingPosts = [], isFetching: loadingPending } =
    useGetPendingPostsQuery(undefined);
  const { data: approvedData, isFetching: loadingApproved } = useGetApprovedPostsQuery(1);
  const approvedPosts: Post[] = approvedData?.posts ?? [];

  const [approvePost] = useApprovePostMutation();
  const [rejectPost] = useRejectPostMutation();
  const [adminDeletePost] = useAdminDeletePostMutation();

  const handleApprove = async (id: string) => {
    try {
      await approvePost(id).unwrap();
      toast.success("Post approved and published");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPost(id).unwrap();
      toast.success("Post rejected and removed");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDeletePost(id).unwrap();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const posts: Post[] = tab === "pending" ? pendingPosts : approvedPosts;
  const loading = tab === "pending" ? loadingPending : loadingApproved;

  const totalLikes = approvedPosts.reduce((acc, p) => acc + p.votes.length, 0);

  return (
    <Layout>
      {likesModal && <LikesModal votes={likesModal} onClose={() => setLikesModal(null)} />}

      <div className="p-6 max-w-7xl mx-auto">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Images className="size-5" />
                </span>
                Forum Photos
              </h1>
              <p className="text-sm text-zinc-500 mt-1 ml-11">
                Review and approve user-submitted photos
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm min-w-[80px]">
                <span className="text-xl font-extrabold text-amber-500">{pendingPosts.length}</span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mt-0.5">
                  Pending
                </span>
              </div>
              <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm min-w-[80px]">
                <span className="text-xl font-extrabold text-emerald-500">
                  {approvedPosts.length}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mt-0.5">
                  Live
                </span>
              </div>
              <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm min-w-[80px]">
                <span className="text-xl font-extrabold text-rose-500">{totalLikes}</span>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mt-0.5">
                  Total Likes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 rounded-2xl bg-zinc-100 p-1 mb-6 w-fit">
          {(["pending", "approved"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150",
                tab === t
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700",
              )}>
              {t === "pending" ? (
                <Clock className={clsx("size-4", tab === t ? "text-amber-500" : "text-zinc-400")} />
              ) : (
                <CheckCircle2
                  className={clsx("size-4", tab === t ? "text-emerald-500" : "text-zinc-400")}
                />
              )}
              {t === "pending" ? "Pending Review" : "Live Posts"}
              {t === "pending" && pendingPosts.length > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                  {pendingPosts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32">
            <Loader2 className="size-8 animate-spin text-indigo-400" />
            <p className="text-sm text-zinc-400">Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-300">
              {tab === "pending" ? <Clock className="size-8" /> : <Images className="size-8" />}
            </div>
            <div>
              <p className="text-base font-bold text-zinc-700">
                {tab === "pending" ? "All caught up!" : "No live posts yet"}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {tab === "pending"
                  ? "No posts are waiting for review."
                  : "Approve some pending posts to see them here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                tab={tab}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onShowLikes={setLikesModal}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
