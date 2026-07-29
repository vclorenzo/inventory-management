import { api } from '../api'
import {
	CreateOrderReviewRequest,
	CreateOrderReviewResponse,
	NewReview,
	Review,
} from '@/types/pages/Reviews'

export type SortOrder = 'asc' | 'desc'

export interface ReviewQueryParams {
	sortOrder?: SortOrder
	page?: number
	limit?: number
	userId?: string
}

export const reviewsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getReviews: builder.query<Review[], string | ReviewQueryParams | undefined>(
			{
				query: (params) => {
					if (typeof params === 'string') {
						return {
							url: '/reviews',
							params: { userId: params },
						}
					}
					return {
						url: '/reviews',
						params,
					}
				},
				transformResponse: (response: { data?: Review[] }) =>
					Array.isArray(response?.data) ? response.data : [],
				providesTags: ['Reviews'],
			},
		),

		getReviewById: builder.query<Review, string>({
			query: (id) => `/reviews/${id}`,
			transformResponse: (response: { data: Review }) => response.data,
			providesTags: ['Reviews'],
		}),

		getProductReviews: builder.query<Review[], string>({
			query: (productId) => `/reviews/products/${productId}`,
			transformResponse: (response: { data?: Review[] }) =>
				Array.isArray(response?.data) ? response.data : [],
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
