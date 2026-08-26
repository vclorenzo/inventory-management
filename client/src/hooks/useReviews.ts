import {
  ReviewQueryParams,
  useCreateOrderReviewMutation,
  useCreateReviewMutation,
  useGetReviewByIdQuery,
  useGetReviewsQuery,
  useUpdateReviewMutation,
} from "@/state/internal/reviewsApi";

export const useReviews = (params?: string | ReviewQueryParams) => {
  const query = useGetReviewsQuery(params, {
    skip: typeof params === "string" && !params,
  });
  const [createReview, createReviewState] = useCreateReviewMutation();
  const [createOrderReview, createOrderReviewState] =
    useCreateOrderReviewMutation();

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createReview,
    createReviewState,
    createOrderReview,
    createOrderReviewState,
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
