import { api } from "./api";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/products?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      providesTags: ["Product"],
    }),
    getNumberOfProducts: builder.query({
      query: () => ({
        url: `/api/products/all`,
      }),
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (productId) => ({
        url: `/api/products/product/${productId}`,
      }),
    }),
    getCourseById: builder.query({
      query: (id) => ({
        url: `/api/course/${id}`,
      }),
    }),
    getProductsByCourse: builder.query({
      query: ({ courseId }) => ({
        url: `/api/products/course/${courseId}`,
      }),
      providesTags: ["Product"],
    }),

    uploadProductFile: builder.mutation({
      query: ({ formData, course }) => ({
        url: `/api/upload?course=${course}`,
        method: "POST",
        body: formData,
      }),
    }),
    uploadCourseImage: builder.mutation({
      query: (data) => ({
        url: "/api/upload/category",
        method: "POST",
        body: data,
      }),
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/api/products/${productId}`,
        method: "DELETE",
      }),
      // Invalidate the "Product" tag so all queries providing it will refetch
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    createCourse: builder.mutation({
      query: (category) => ({
        url: "/api/course",
        method: "POST",
        body: category,
      }),
    }),

    getCourses: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/course?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/api/course/${id}`,
        method: "DELETE",
      }),
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/course/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    getAllCourses: builder.query({
      query: () => "/api/course/all",
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCourseQuery,
  useGetCoursesQuery,
  useUploadProductFileMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useDeleteCourseMutation,
  useCreateCourseMutation,
  useUploadCourseImageMutation,
  useUpdateCourseMutation,
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useGetNumberOfProductsQuery,
} = productApi;
