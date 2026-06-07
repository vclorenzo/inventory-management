import { Product, NewProduct } from "@/types/pages/Products";
import { api } from "../api";
import { NewReview, Review } from "@/types/pages/Reviews";

export type SortOrder = "asc" | "desc";

export interface ReviewQueryParams {
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<Review[], string | ReviewQueryParams | undefined>(
      {
        query: (params) => ({
          url: "/reviews",
        }),
        transformResponse: (response: { data?: Review[] }) =>
          Array.isArray(response?.data) ? response.data : [],
        providesTags: ["Reviews"],
      },
    ),

    getReviewById: builder.query<Review, string>({
      query: (id) => `/reviews/${id}`,
      transformResponse: (response: { data: Review }) => response.data,
      providesTags: ["Reviews"],
    }),

    createReview: builder.mutation<Review, NewReview>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),
    updateReview: builder.mutation<Review, NewReview>({
      query: ({ reviewId, ...body }) => ({
        url: `/reviews/${reviewId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),

    deleteReview: builder.mutation<{ message: string }, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
