import { api } from "./api";

const forumApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Photo posts ───────────────────────────────────────────────────────────
    getPendingPosts: builder.query({
      query: () => ({ url: "/api/forum/admin/pending" }),
      providesTags: ["Forum"],
    }),
    getAllAdminPosts: builder.query({
      query: (page = 1) => ({ url: `/api/forum/admin/all?page=${page}` }),
      providesTags: ["Forum"],
    }),
    getApprovedPosts: builder.query({
      query: (page = 1) => ({ url: `/api/forum/admin/approved?page=${page}` }),
      providesTags: ["Forum"],
    }),
    approvePost: builder.mutation({
      query: (id: string) => ({ url: `/api/forum/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["Forum"],
    }),
    unapprovePost: builder.mutation({
      query: (id: string) => ({ url: `/api/forum/${id}/unapprove`, method: "PATCH" }),
      invalidatesTags: ["Forum"],
    }),
    rejectPost: builder.mutation({
      query: (id: string) => ({ url: `/api/forum/${id}/reject`, method: "DELETE" }),
      invalidatesTags: ["Forum"],
    }),
    adminDeletePost: builder.mutation({
      query: (id: string) => ({ url: `/api/forum/${id}`, method: "DELETE" }),
      invalidatesTags: ["Forum"],
    }),

    // ── Topics ────────────────────────────────────────────────────────────────
    getAdminTopics: builder.query({
      query: (page = 1) => ({ url: `/api/topics?pageNumber=${page}` }),
      providesTags: ["Topic"],
    }),
    getAdminTopicById: builder.query({
      query: (id: string) => ({ url: `/api/topics/${id}` }),
      providesTags: ["Topic"],
    }),
    adminCloseTopic: builder.mutation({
      query: (id: string) => ({ url: `/api/topics/${id}/close`, method: "PATCH" }),
      invalidatesTags: ["Topic"],
    }),
    adminDeleteTopic: builder.mutation({
      query: (id: string) => ({ url: `/api/topics/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Topic"],
    }),
  }),
});

export const {
  useGetPendingPostsQuery,
  useGetAllAdminPostsQuery,
  useGetApprovedPostsQuery,
  useApprovePostMutation,
  useUnapprovePostMutation,
  useRejectPostMutation,
  useAdminDeletePostMutation,
  useGetAdminTopicsQuery,
  useGetAdminTopicByIdQuery,
  useAdminCloseTopicMutation,
  useAdminDeleteTopicMutation,
} = forumApi;
