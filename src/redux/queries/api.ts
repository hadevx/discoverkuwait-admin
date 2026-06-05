import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const backend =
  import.meta.env.VITE_ENVIRONMENT === "production"
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_LOCALHOST;

const baseQuery = fetchBaseQuery({
  baseUrl: backend,
  credentials: "include",
});

export const api = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Category", "Word", "Quiz"],

  endpoints: () => ({}),
});
