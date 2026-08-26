import {
	ProductReviewQueryParams,
	ReviewQueryParams,
	unwrapPaginatedReviews,
	useCreateOrderReviewMutation,
	useCreateReviewMutation,
	useGetProductReviewsQuery,
	useGetReviewByIdQuery,
	useGetReviewsQuery,
	useUpdateReviewMutation,
} from '@/state/internal/reviewsApi'

export const useReviews = (params?: string | ReviewQueryParams) => {
	const skip =
		!params ||
		(typeof params === 'string' && !params.trim()) ||
		(typeof params === 'object' &&
			!Array.isArray(params) &&
			!params.userId?.trim())

	const query = useGetReviewsQuery(params, { skip })
	const paginated = unwrapPaginatedReviews(query.data)
	const [createReview, createReviewState] = useCreateReviewMutation()
	const [createOrderReview, createOrderReviewState] =
		useCreateOrderReviewMutation()

	return {
		reviews: paginated.reviews,
		page: paginated.page,
		limit: paginated.limit,
		totalPages: paginated.totalPages,
		totalCount: paginated.totalCount,
		isLoading: skip ? false : query.isLoading || query.isUninitialized,
		isFetching: query.isFetching,
		isSuccess: query.isSuccess,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		createReview,
		createReviewState,
		createOrderReview,
		createOrderReviewState,
	}
}

export const useReviewById = (reviewId: string) => {
	const query = useGetReviewByIdQuery(reviewId, { skip: !reviewId })

	const [updateReview, updateReviewState] = useUpdateReviewMutation()
	return {
		review: query.data ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		updateReview,
		updateReviewState,
	}
}

export const useProductReviews = (
	params?: string | ProductReviewQueryParams,
) => {
	const skip =
		!params ||
		(typeof params === 'string' && !params.trim()) ||
		(typeof params === 'object' && !params.productId?.trim())

	const query = useGetProductReviewsQuery(params, { skip })
	const paginated = unwrapPaginatedReviews(query.data)

	return {
		reviews: paginated.reviews,
		page: paginated.page,
		limit: paginated.limit,
		totalPages: paginated.totalPages,
		totalCount: paginated.totalCount,
		isLoading: skip ? false : query.isLoading || query.isUninitialized,
		isFetching: query.isFetching,
		isSuccess: query.isSuccess,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	}
}
