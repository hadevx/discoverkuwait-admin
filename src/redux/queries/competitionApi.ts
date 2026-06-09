import { api } from "./api";

const competitionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompetition: builder.query<{ isOpen: boolean; endDate: string | null }, void>({
      query: () => ({ url: "/api/competition" }),
      providesTags: ["Competition"],
    }),
    updateCompetition: builder.mutation<
      { isOpen: boolean; endDate: string | null },
      { isOpen?: boolean; endDate?: string | null }
    >({
      query: (body) => ({ url: "/api/competition", method: "PATCH", body }),
      invalidatesTags: ["Competition"],
    }),
  }),
});

export const { useGetCompetitionQuery, useUpdateCompetitionMutation } = competitionApi;
