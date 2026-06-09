import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Check, X, Trash2, Images, Clock, CheckCircle2,
  Heart, Calendar, MessageSquare, Lock, LockOpen, Trophy,
} from "lucide-react";
import {
  useGetAllAdminPostsQuery,
  useApprovePostMutation,
  useUnapprovePostMutation,
  useAdminDeletePostMutation,
  useGetAdminTopicsQuery,
  useAdminCloseTopicMutation,
  useAdminDeleteTopicMutation,
} from "../../redux/queries/forumApi";
import { useGetCompetitionQuery, useUpdateCompetitionMutation } from "../../redux/queries/competitionApi";
import Layout from "../../Layout";
import Badge from "../../components/Badge";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import Paginate from "@/components/Paginate";

// ─── Types ────────────────────────────────────────────────────────────────────
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

type Topic = {
  _id: string;
  author: UserRef;
  description: string;
  category: string;
  isClosed: boolean;
  likes: string[];
  commentCount: number;
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

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function UserAvatar({ user, size = "md" }: { user: UserRef; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "size-7" : "size-10";
  return user.avatar ? (
    <img src={`/avatar/${user.avatar}`} alt={user.name}
      className={`${cls} object-cover rounded-md shrink-0`} />
  ) : (
    <div className={`${cls} rounded-md text-sm flex items-center uppercase justify-center font-semibold bg-[#f84713] text-white shrink-0`}>
      {(user.name || "U").charAt(0)}{(user.name || "U").slice(-1)}
    </div>
  );
}

// ─── Likes Modal ──────────────────────────────────────────────────────────────
function LikesModal({ votes, onClose }: { votes: UserRef[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white border shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-rose-500 fill-rose-500" />
            <span className="font-bold text-sm">{votes.length} {votes.length === 1 ? "Like" : "Likes"}</span>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y">
          {votes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
              <Heart className="size-7" /><p className="text-sm">No likes yet</p>
            </div>
          ) : votes.map((u) => (
            <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <UserAvatar user={u} size="sm" />
              <p className="text-sm font-semibold">{u.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Action button helpers ────────────────────────────────────────────────────
function BtnStatusToggle({ post, onToggle }: { post: Post; onToggle: () => void }) {
  return post.isApproved ? (
    <button onClick={onToggle}
      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition active:scale-95">
      <CheckCircle2 className="size-3" /> Live
    </button>
  ) : (
    <button onClick={onToggle}
      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition active:scale-95">
      <Clock className="size-3" /> Pending
    </button>
  );
}
function BtnClose({ isClosed, onClick }: { isClosed: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition active:scale-95">
      {isClosed ? <><LockOpen className="size-3" /> Open</> : <><Lock className="size-3" /> Close</>}
    </button>
  );
}
function BtnDelete({ onConfirm }: { onConfirm: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => { onConfirm(); setConfirm(false); }}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition active:scale-95">
        <Check className="size-3" /> Confirm
      </button>
      <button onClick={() => setConfirm(false)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold border border-gray-300 text-gray-500 hover:bg-gray-50 transition">
        <X className="size-3" />
      </button>
    </span>
  );
  return (
    <button onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition active:scale-95">
      <Trash2 className="size-3" /> Delete
    </button>
  );
}

// ─── Section tab button ───────────────────────────────────────────────────────
function SectionTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold border transition ${
        active ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ForumApproval() {
  const navigate = useNavigate();
  const [section, setSection] = useState<"images" | "topics">("images");
  const [imagesPage, setImagesPage] = useState(1);
  const [topicsPage, setTopicsPage] = useState(1);
  const [likesModal, setLikesModal] = useState<UserRef[] | null>(null);
  const [endDateInput, setEndDateInput] = useState("");

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: allPostsData, isFetching: imageLoading } = useGetAllAdminPostsQuery(imagesPage);
  const { data: topicsData, isFetching: loadingTopics } = useGetAdminTopicsQuery(topicsPage);
  const { data: competition, isFetching: compLoading } = useGetCompetitionQuery();

  const allPosts: Post[] = allPostsData?.posts ?? [];
  const imagesPages: number = allPostsData?.pages ?? 1;
  const pendingCount: number = allPosts.filter((p) => !p.isApproved).length;
  const topics: Topic[] = topicsData?.topics ?? [];
  const topicPages: number = topicsData?.pages ?? 1;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [approvePost] = useApprovePostMutation();
  const [unapprovePost] = useUnapprovePostMutation();
  const [adminDeletePost] = useAdminDeletePostMutation();
  const [adminCloseTopic] = useAdminCloseTopicMutation();
  const [adminDeleteTopic] = useAdminDeleteTopicMutation();
  const [updateCompetition] = useUpdateCompetitionMutation();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleStatus = async (post: Post) => {
    try {
      if (post.isApproved) {
        await unapprovePost(post._id).unwrap();
        toast.success("Set to pending");
      } else {
        await approvePost(post._id).unwrap();
        toast.success("Post approved");
      }
    } catch { toast.error("Failed to update status"); }
  };
  const handleDeletePost = async (id: string) => {
    try { await adminDeletePost(id).unwrap(); toast.success("Post deleted"); }
    catch { toast.error("Failed to delete"); }
  };
  const handleCloseTopic = async (id: string) => {
    try { await adminCloseTopic(id).unwrap(); toast.success("Topic updated"); }
    catch { toast.error("Failed to update"); }
  };
  const handleDeleteTopic = async (id: string) => {
    try { await adminDeleteTopic(id).unwrap(); toast.success("Topic deleted"); }
    catch { toast.error("Failed to delete"); }
  };
  const handleToggleCompetition = async () => {
    try {
      await updateCompetition({ isOpen: !competition?.isOpen }).unwrap();
      toast.success(competition?.isOpen ? "Competition closed" : "Competition opened");
    } catch { toast.error("Failed to update competition"); }
  };
  const handleSaveDate = async () => {
    try {
      await updateCompetition({ endDate: endDateInput || null }).unwrap();
      toast.success("End date saved");
      setEndDateInput("");
    } catch { toast.error("Failed to save date"); }
  };

  return (
    <Layout>
      {likesModal && <LikesModal votes={likesModal} onClose={() => setLikesModal(null)} />}

      {(imageLoading || loadingTopics || compLoading) && <Loader />}


      <div className="lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto flex justify-between py-3 mt-[70px] lg:mt-[50px] px-2">
        <div className="w-full">

          {/* ── Header ── */}
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <h1 className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-4 items-center flex-wrap">
              Forum:
              <Badge icon={false} className="p-1">
                {section === "images"
                  ? <><Images strokeWidth={1} className="size-5" /><p className="text-base">{allPostsData?.total ?? 0}</p></>
                  : <><MessageSquare strokeWidth={1} className="size-5" /><p className="text-base">{topicsData?.topics?.length ?? 0}</p></>}
              </Badge>
            </h1>
          </div>

          <Separator className="my-4 bg-black/20" />

          {/* ── Section tabs ── */}
          <div className="flex gap-2 mb-6">
            <SectionTab active={section === "images"} onClick={() => setSection("images")}>
              <Trophy className="size-4" />
              Best Image Reward
              {pendingCount > 0 && (
                <span className={`rounded-full text-[10px] font-black px-1.5 py-0.5 leading-none ${section === "images" ? "bg-white text-black" : "bg-red-500 text-white"}`}>
                  {pendingCount}
                </span>
              )}
            </SectionTab>
            <SectionTab active={section === "topics"} onClick={() => setSection("topics")}>
              <MessageSquare className="size-4" />
              Topics
            </SectionTab>
          </div>

          {/* ══ IMAGES SECTION ══════════════════════════════════════════════ */}
          {section === "images" && (
            <>
              {/* Competition control panel */}
              <div className="rounded-lg border bg-white p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="size-4 text-amber-500" />
                  <p className="text-sm font-black text-gray-800">Competition Control</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    {competition?.isOpen ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1.5">
                        <CheckCircle2 className="size-3.5" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-xs font-bold px-3 py-1.5">
                        <Lock className="size-3.5" /> Closed
                      </span>
                    )}
                    {competition?.endDate && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        Ends {new Date(competition.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>

                  {/* Toggle open/close */}
                  <button
                    onClick={handleToggleCompetition}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold border transition active:scale-95 ${
                      competition?.isOpen
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    }`}>
                    {competition?.isOpen
                      ? <><Lock className="size-3.5" /> Close Competition</>
                      : <><LockOpen className="size-3.5" /> Open Competition</>}
                  </button>

                  {/* Date picker */}
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={endDateInput}
                      onChange={(e) => setEndDateInput(e.target.value)}
                      className="rounded-lg border border-gray-300 text-xs px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-400"
                    />
                    <button
                      onClick={handleSaveDate}
                      disabled={!endDateInput}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-40 transition active:scale-95">
                      <Check className="size-3" /> Set Date
                    </button>
                    {competition?.endDate && (
                      <button
                        onClick={() => updateCompetition({ endDate: null })}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-gray-400 border border-gray-200 hover:text-red-500 hover:border-red-200 transition">
                        <X className="size-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Desktop table */}
              <div className="rounded-lg border p-3 sm:p-5 bg-white mt-2 hidden sm:block overflow-x-auto">
                {allPosts.length === 0 ? (
                  <EmptyRow colSpan={7} message="No images yet." />
                ) : (
                  <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700">
                    <thead className="bg-white text-gray-900/50 font-semibold">
                      <tr>
                        <th className="pb-2 border-b">Image</th>
                        <th className="pb-2 border-b">Caption</th>
                        <th className="pb-2 border-b">Author</th>
                        <th className="pb-2 border-b hidden md:table-cell">Date</th>
                        <th className="pb-2 border-b">
                          <span className="flex items-center gap-1"><Heart className="size-3 text-rose-400" /> Likes</span>
                        </th>
                        <th className="pb-2 border-b">Status</th>
                        <th className="pb-2 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {allPosts.map((post) => (
                        <tr key={post._id} className="hover:bg-gray-50 transition font-medium">
                          <td className="py-3">
                            <img src={post.imageUrl} alt={post.caption || "post"}
                              className="size-10 object-cover rounded-md border" />
                          </td>
                          <td className="py-3 max-w-[160px]">
                            {post.caption
                              ? <span className="line-clamp-2 text-gray-700" dir="auto">{post.caption}</span>
                              : <span className="text-gray-300 italic">No caption</span>}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <UserAvatar user={post.author} size="sm" />
                              <span className="truncate max-w-[100px]">{post.author?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 hidden md:table-cell text-gray-500 text-xs">
                            <div>{formatDate(post.createdAt)}</div>
                            <div className="text-gray-400">{timeAgo(post.createdAt)}</div>
                          </td>
                          <td className="py-3">
                            <button onClick={() => setLikesModal(post.votes)}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-rose-500 transition font-semibold">
                              <Heart className="size-3.5" /> {post.votes.length}
                            </button>
                          </td>
                          <td className="py-3">
                            <BtnStatusToggle post={post} onToggle={() => handleToggleStatus(post)} />
                          </td>
                          <td className="py-3">
                            <BtnDelete onConfirm={() => handleDeletePost(post._id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-4">
                  <Paginate page={imagesPage} pages={imagesPages} setPage={setImagesPage} />
                </div>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden mt-4 space-y-3">
                {allPosts.length === 0 ? (
                  <div className="rounded-xl border bg-white p-6 text-center text-gray-500 font-semibold text-sm">
                    No images yet.
                  </div>
                ) : allPosts.map((post) => (
                  <div key={post._id} className="rounded-xl border bg-white p-3">
                    <div className="flex items-start gap-3">
                      <img src={post.imageUrl} alt={post.caption || "post"}
                        className="size-14 object-cover rounded-md border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <UserAvatar user={post.author} size="sm" />
                          <span className="font-bold text-sm truncate">{post.author?.name}</span>
                        </div>
                        {post.caption && (
                          <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDate(post.createdAt)}</span>
                          <button onClick={() => setLikesModal(post.votes)} className="flex items-center gap-1 hover:text-rose-500 transition">
                            <Heart className="size-3" /> {post.votes.length}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <BtnStatusToggle post={post} onToggle={() => handleToggleStatus(post)} />
                      <BtnDelete onConfirm={() => handleDeletePost(post._id)} />
                    </div>
                  </div>
                ))}
                <Paginate page={imagesPage} pages={imagesPages} setPage={setImagesPage} />
              </div>
            </>
          )}

          {/* ══ TOPICS SECTION ══════════════════════════════════════════════ */}
          {section === "topics" && (
            <>
              {/* Desktop table */}
              <div className="rounded-lg border p-3 sm:p-5 bg-white mt-2 hidden sm:block overflow-x-auto">
                {topics.length === 0 ? (
                  <EmptyRow colSpan={7} message="No topics yet." />
                ) : (
                  <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700">
                    <thead className="bg-white text-gray-900/50 font-semibold">
                      <tr>
                        <th className="pb-2 border-b">Topic</th>
                        <th className="pb-2 border-b">Category</th>
                        <th className="pb-2 border-b">Author</th>
                        <th className="pb-2 border-b hidden md:table-cell">Date</th>
                        <th className="pb-2 border-b hidden lg:table-cell">
                          <span className="flex items-center gap-1"><MessageSquare className="size-3" /> Comments</span>
                        </th>
                        <th className="pb-2 border-b hidden lg:table-cell">
                          <span className="flex items-center gap-1"><Heart className="size-3 text-rose-400" /> Likes</span>
                        </th>
                        <th className="pb-2 border-b">Status</th>
                        <th className="pb-2 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {topics.map((topic) => (
                        <tr key={topic._id} onClick={() => navigate(`/forum/topics/${topic._id}`)} className="hover:bg-gray-50 transition font-medium cursor-pointer">
                          <td className="py-3 max-w-[220px]">
                            <p className="line-clamp-2 text-gray-700 leading-snug" dir="auto">{topic.description}</p>
                          </td>
                          <td className="py-3">
                            <span className="inline-flex rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap">
                              {CAT_LABELS[topic.category] ?? topic.category}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <UserAvatar user={topic.author} size="sm" />
                              <span className="truncate max-w-[100px]">{topic.author?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 hidden md:table-cell text-gray-500 text-xs">
                            <div>{formatDate(topic.createdAt)}</div>
                            <div className="text-gray-400">{timeAgo(topic.createdAt)}</div>
                          </td>
                          <td className="py-3 hidden lg:table-cell text-gray-600">
                            {topic.commentCount ?? 0}
                          </td>
                          <td className="py-3 hidden lg:table-cell text-gray-600">
                            {topic.likes?.length ?? 0}
                          </td>
                          <td className="py-3">
                            {topic.isClosed ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold px-2.5 py-0.5">
                                <Lock className="size-3" /> Closed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold px-2.5 py-0.5">
                                <CheckCircle2 className="size-3" /> Open
                              </span>
                            )}
                          </td>
                          <td className="py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <BtnClose isClosed={topic.isClosed} onClick={() => handleCloseTopic(topic._id)} />
                              <BtnDelete onConfirm={() => handleDeleteTopic(topic._id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-4">
                  <Paginate page={topicsPage} pages={topicPages} setPage={setTopicsPage} />
                </div>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden mt-4 space-y-3">
                {topics.length === 0 ? (
                  <div className="rounded-xl border bg-white p-6 text-center text-gray-500 font-semibold text-sm">
                    No topics yet.
                  </div>
                ) : topics.map((topic) => (
                  <div key={topic._id} className="rounded-xl border bg-white p-3 active:scale-[0.99] transition cursor-pointer"
                    onClick={() => navigate(`/forum/topics/${topic._id}`)}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-flex rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-[11px] font-bold shrink-0 mt-0.5">
                        {CAT_LABELS[topic.category] ?? topic.category}
                      </span>
                      {topic.isClosed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5">
                          <Lock className="size-3" /> Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5">
                          <CheckCircle2 className="size-3" /> Open
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-snug mb-2" dir="auto">{topic.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <UserAvatar user={topic.author} size="sm" />
                      <span className="font-bold text-sm truncate">{topic.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-3">
                      <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDate(topic.createdAt)}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="size-3" />{topic.commentCount ?? 0}</span>
                      <span className="flex items-center gap-1"><Heart className="size-3" />{topic.likes?.length ?? 0}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <BtnClose isClosed={topic.isClosed} onClick={() => handleCloseTopic(topic._id)} />
                      <BtnDelete onConfirm={() => handleDeleteTopic(topic._id)} />
                    </div>
                  </div>
                ))}
                <Paginate page={topicsPage} pages={topicPages} setPage={setTopicsPage} />
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <table className="w-full text-sm text-left text-gray-700">
      <tbody>
        <tr>
          <td colSpan={colSpan} className="py-12 text-center text-gray-400 font-semibold">
            {message}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
