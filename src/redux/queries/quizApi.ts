import { api } from "./api";

const quizApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllQuizzes: builder.query({
      query: () => ({ url: "/api/quiz/admin" }),
      providesTags: ["Quiz"],
    }),

    getPublicQuizzes: builder.query({
      query: () => ({ url: "/api/quiz" }),
      providesTags: ["Quiz"],
    }),

    createQuiz: builder.mutation({
      query: (data) => ({ url: "/api/quiz", method: "POST", body: data }),
      invalidatesTags: ["Quiz"],
    }),

    updateQuiz: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/api/quiz/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Quiz"],
    }),

    deleteQuiz: builder.mutation({
      query: (id) => ({ url: `/api/quiz/${id}`, method: "DELETE" }),
      invalidatesTags: ["Quiz"],
    }),

    toggleActiveQuiz: builder.mutation({
      query: (id) => ({ url: `/api/quiz/${id}/toggle`, method: "PATCH" }),
      invalidatesTags: ["Quiz"],
    }),
  }),
});

export const {
  useGetAllQuizzesQuery,
  useGetPublicQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useToggleActiveQuizMutation,
} = quizApi;
