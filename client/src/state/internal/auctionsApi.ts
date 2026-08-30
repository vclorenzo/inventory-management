import {
	Auction,
	NewAuction,
	UpdateAuction,
} from '@/types/pages/Auctions'
import { api } from '../api'
import {
	normalizeQueryParams,
	ProductQueryParams,
} from './productsApi'

export const auctionsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getAuctions: builder.query<
			Auction[],
			string | ProductQueryParams | undefined
		>({
			query: (params) => ({
				url: '/auctions',
				params: normalizeQueryParams(params),
			}),
			transformResponse: (response: { data?: Auction[] }) =>
				Array.isArray(response?.data) ? response.data : [],
			providesTags: ['Auctions'],
		}),

		getAuctionById: builder.query<
			Auction,
			string | { id: string; listed?: boolean }
		>({
			query: (arg) => {
				const id = typeof arg === 'string' ? arg : arg.id
				const listed = typeof arg === 'object' ? arg.listed : undefined
				return {
					url: `/auctions/${id}`,
					params: listed ? { listed: 'true' } : undefined,
				}
			},
			transformResponse: (response: { data: Auction }) => response.data,
			providesTags: ['Auctions'],
		}),

		createAuction: builder.mutation<Auction, NewAuction>({
			query: (body) => ({
				url: '/auctions',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Auctions'],
		}),
		updateAuction: builder.mutation<Auction, UpdateAuction>({
			query: ({ productId, ...body }) => ({
				url: `/auctions/${productId}`,
				method: 'PUT',
				body,
			}),
			invalidatesTags: ['Auctions'],
		}),

		deleteAuction: builder.mutation<{ message: string }, string>({
			query: (productId) => ({
				url: `/auctions/${productId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Auctions'],
		}),
	}),
})

export const {
	useGetAuctionsQuery,
	useGetAuctionByIdQuery,
	useCreateAuctionMutation,
	useUpdateAuctionMutation,
	useDeleteAuctionMutation,
} = auctionsApi
