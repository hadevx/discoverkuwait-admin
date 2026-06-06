import { api } from "./api";

const forumApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPendingPosts: builder.query({
      query: () => ({ url: "/api/forum/admin/pending" }),
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
    rejectPost: builder.mutation({
      query: (id: string) => ({ url: `/api/forum/${id}/reject`, method: "DELETE" }),
      invalidatesTags: ["Forum"],
    }),
    adminDeletePost: builder.mutation({
      query: (id: string) => ({ url: `/api/forum/${id}`, method: "DELETE" }),
      invalidatesTags: ["Forum"],
    }),
  }),
});

export const {
  useGetPendingPostsQuery,
  useGetApprovedPostsQuery,
  useApprovePostMutation,
  useRejectPostMutation,
  useAdminDeletePostMutation,
} = forumApi;
