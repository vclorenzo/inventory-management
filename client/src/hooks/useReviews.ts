import {
  ReviewQueryParams,
  useCreateReviewMutation,
  useGetReviewByIdQuery,
  useGetReviewsQuery,
  useUpdateReviewMutation,
} from "@/state/internal/reviewsApi";

export const useReviews = (params?: string | ReviewQueryParams) => {
  const query = useGetReviewsQuery(params);
  const [createReview, createReviewState] = useCreateReviewMutation();

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createReview,
    createReviewState,
  };
};

export const useReviewById = (reviewId: string) => {
  const query = useGetReviewByIdQuery(reviewId, { skip: !reviewId });

  const [updateReview, updateReviewState] = useUpdateReviewMutation();
  return {
    review: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateReview,
    updateReviewState,
  };
};
