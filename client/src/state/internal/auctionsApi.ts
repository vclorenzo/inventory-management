import {
	Auction,
	NewAuction,
	UpdateAuction,
} from '@/types/pages/Auctions'
import { isAuctionStatus } from '@/constants/auctionStatus'
import { api } from '../api'
import {
	normalizeQueryParams,
	ProductQueryParams,
} from './productsApi'

function parseAuction(value: unknown): Auction | null {
	if (!value || typeof value !== 'object') return null
	const status = 'status' in value ? value.status : undefined
	if (!isAuctionStatus(status)) return null
	return { ...(value as Auction), status }
}

function parseAuctionList(response: { data?: unknown }): Auction[] {
	const rows = Array.isArray(response.data) ? response.data : []
	const auctions: Auction[] = []
	for (const row of rows) {
		const auction = parseAuction(row)
		if (auction) auctions.push(auction)
	}
	return auctions
}

function parseAuctionRecord(response: { data?: unknown }): Auction {
	const auction = parseAuction(response.data)
	if (!auction) {
		throw new Error('Invalid auction payload')
	}
	return auction
}

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
			transformResponse: parseAuctionList,
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
			transformResponse: parseAuctionRecord,
			providesTags: ['Auctions'],
		}),

		createAuction: builder.mutation<Auction, NewAuction>({
			query: (body) => ({
				url: '/auctions',
				method: 'POST',
				body,
			}),
			transformResponse: parseAuctionRecord,
			invalidatesTags: ['Auctions'],
		}),
		updateAuction: builder.mutation<Auction, UpdateAuction>({
			query: ({ productId, ...body }) => ({
				url: `/auctions/${productId}`,
				method: 'PUT',
				body,
			}),
			transformResponse: parseAuctionRecord,
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
