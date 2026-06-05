import { api } from "./api";

const wordsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWords: builder.query({
      query: (params) => ({ url: "/api/words", params }),
      providesTags: ["Word"],
    }),

    getAllWords: builder.query({
      query: () => ({ url: "/api/words/admin" }),
      providesTags: ["Word"],
      keepUnusedDataFor: 0,
    }),

    getWordById: builder.query({
      query: (id) => ({ url: `/api/words/${id}` }),
      providesTags: ["Word"],
    }),

    createWord: builder.mutation({
      query: (data) => ({ url: "/api/words", method: "POST", body: data }),
      invalidatesTags: ["Word"],
    }),

    updateWord: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/api/words/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Word"],
    }),

    deleteWord: builder.mutation({
      query: (id) => ({ url: `/api/words/${id}`, method: "DELETE" }),
      invalidatesTags: ["Word"],
    }),

    approveWord: builder.mutation({
      query: (id) => ({ url: `/api/words/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["Word"],
    }),

    getWordsByCategory: builder.query({
      query: (category) => ({ url: `/api/words/category/${category}` }),
      providesTags: ["Word"],
    }),

    getRandomWords: builder.query({
      query: (count = 10) => ({ url: `/api/words/random`, params: { count } }),
    }),
  }),
});

export const {
  useGetWordsQuery,
  useGetAllWordsQuery,
  useGetWordByIdQuery,
  useCreateWordMutation,
  useUpdateWordMutation,
  useDeleteWordMutation,
  useApproveWordMutation,
  useGetWordsByCategoryQuery,
  useGetRandomWordsQuery,
} = wordsApi;
