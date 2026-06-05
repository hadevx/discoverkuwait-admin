import { api } from "./api";

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/orders?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"], // this query "provides" the Order cache
    }),
    getOrder: builder.query({
      query: (orderId) => ({
        url: `/api/orders/admin/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateDeliver: builder.mutation({
      query: (data) => ({
        url: "/api/products/delivery",
        method: "PUT",
        body: data,
      }),
    }),
    getUserOrders: builder.query({
      query: (userId) => ({
        url: `/api/orders/user-orders/${userId}`,
      }),
    }),
    updateOrderToDeliverd: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrderToCanceled: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),
    getOrderStats: builder.query({
      query: () => ({
        url: `/api/orders/stats`,
      }),
    }),
    getRevenuStats: builder.query({
      query: () => ({
        url: `/api/orders/revenu`,
      }),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetUserOrdersQuery,
  useGetOrderQuery,
  useUpdateDeliverMutation,
  useUpdateOrderToDeliverdMutation,
  useUpdateOrderToCanceledMutation,
  useGetOrderStatsQuery,
  useGetRevenuStatsQuery,
} = orderApi;
