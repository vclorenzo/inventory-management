import { api } from '../api'
import {
	CreateOrderReviewRequest,
	CreateOrderReviewResponse,
	NewReview,
	PaginatedReviews,
	Review,
} from '@/types/pages/Reviews'

export type SortOrder = 'asc' | 'desc'

export interface ReviewQueryParams {
	sortOrder?: SortOrder
	page?: number
	limit?: number
	userId?: string
}

export interface ProductReviewQueryParams {
	productId: string
	sortOrder?: SortOrder
	page?: number
	limit?: number
}

const normalizeReviewParams = (
	params?: string | ReviewQueryParams,
): Record<string, string | number> => {
	if (!params) return {}
	if (typeof params === 'string') {
		return params.trim() ? { userId: params.trim() } : {}
	}

	const query: Record<string, string | number> = {}
	if (params.userId?.trim()) query.userId = params.userId.trim()
	if (params.sortOrder) query.sortOrder = params.sortOrder
	if (typeof params.page === 'number') query.page = params.page
	if (typeof params.limit === 'number') query.limit = params.limit
	return query
}

export const unwrapPaginatedReviews = (
	response: unknown,
): PaginatedReviews => {
	if (Array.isArray(response)) {
		return {
			reviews: response,
			page: 1,
			totalPages: 1,
			totalCount: response.length,
		}
	}

	if (!response || typeof response !== 'object') {
		return { reviews: [], page: 1, totalPages: 1, totalCount: 0 }
	}

	const body = response as {
		data?: Review[]
		reviews?: Review[]
		page?: number
		limit?: number
		totalPages?: number
		totalCount?: number
	}

	const reviews = Array.isArray(body.reviews)
		? body.reviews
		: Array.isArray(body.data)
			? body.data
			: []

	return {
		reviews,
		page: typeof body.page === 'number' ? body.page : 1,
		limit: typeof body.limit === 'number' ? body.limit : undefined,
		totalPages:
			typeof body.totalPages === 'number' ? body.totalPages : 1,
		totalCount:
			typeof body.totalCount === 'number'
				? body.totalCount
				: reviews.length,
	}
}

export const reviewsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getReviews: builder.query<
			PaginatedReviews,
			string | ReviewQueryParams | undefined
		>({
			query: (params) => ({
				url: '/reviews',
				params: normalizeReviewParams(params),
			}),
			transformResponse: (response: unknown): PaginatedReviews =>
				unwrapPaginatedReviews(response),
			providesTags: ['Reviews'],
		}),

		getReviewById: builder.query<Review, string>({
			query: (id) => `/reviews/${id}`,
			transformResponse: (response: { data: Review }) => response.data,
			providesTags: ['Reviews'],
		}),

		getProductReviews: builder.query<
			PaginatedReviews,
			string | ProductReviewQueryParams | undefined
		>({
			query: (params) => {
				if (!params || typeof params === 'string') {
					return {
						url: `/reviews/products/${typeof params === 'string' ? params : ''}`,
					}
				}
				const query: Record<string, string | number> = {}
				if (params.sortOrder) query.sortOrder = params.sortOrder
				if (typeof params.page === 'number') query.page = params.page
				if (typeof params.limit === 'number') query.limit = params.limit
				return {
					url: `/reviews/products/${params.productId}`,
					params: query,
				}
			},
			transformResponse: (response: unknown): PaginatedReviews =>
				unwrapPaginatedReviews(response),
			providesTags: ['Reviews'],
		}),

		createReview: builder.mutation<Review, NewReview>({
			query: (body) => ({
				url: '/reviews',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Reviews'],
		}),

		createOrderReview: builder.mutation<
			CreateOrderReviewResponse,
			CreateOrderReviewRequest
		>({
			query: (body) => ({
				url: '/reviews/order',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Reviews', 'Purchases', 'Products'],
		}),

		updateReview: builder.mutation<Review, NewReview>({
			query: ({ reviewId, ...body }) => ({
				url: `/reviews/${reviewId}`,
				method: 'PUT',
				body,
			}),
			invalidatesTags: ['Reviews'],
		}),

		deleteReview: builder.mutation<{ message: string }, string>({
			query: (reviewId) => ({
				url: `/reviews/${reviewId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Reviews'],
		}),
	}),
})

export const {
	useGetReviewsQuery,
	useGetReviewByIdQuery,
	useGetProductReviewsQuery,
	useCreateReviewMutation,
	useCreateOrderReviewMutation,
	useUpdateReviewMutation,
	useDeleteReviewMutation,
} = reviewsApi
