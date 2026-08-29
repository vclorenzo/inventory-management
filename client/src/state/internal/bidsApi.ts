import {
	AddBidRequest,
	BidGroup,
	UpdateBidRequest,
} from '@/types/pages/Bids'
import { api } from '../api'

export const bidsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getBids: builder.query<BidGroup[], void>({
			query: () => '/bids',
			transformResponse: (response: { data?: BidGroup[] }) =>
				Array.isArray(response?.data) ? response.data : [],
			providesTags: ['Bids'],
		}),

		addBid: builder.mutation<BidGroup[], AddBidRequest>({
			query: (body) => ({
				url: '/bids',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data?: BidGroup[] }) =>
				Array.isArray(response?.data) ? response.data : [],
			invalidatesTags: ['Bids'],
		}),

		updateBid: builder.mutation<BidGroup[], UpdateBidRequest>({
			query: ({ id, offerPrice }) => ({
				url: `/bids/${id}`,
				method: 'PUT',
				body: { offerPrice },
			}),
			transformResponse: (response: { data?: BidGroup[] }) =>
				Array.isArray(response?.data) ? response.data : [],
			invalidatesTags: ['Bids'],
		}),

		removeBid: builder.mutation<BidGroup[], string>({
			query: (id) => ({
				url: `/bids/${id}`,
				method: 'DELETE',
			}),
			transformResponse: (response: { data?: BidGroup[] }) =>
				Array.isArray(response?.data) ? response.data : [],
			invalidatesTags: ['Bids'],
		}),
	}),
})

export const {
	useGetBidsQuery,
	useAddBidMutation,
	useUpdateBidMutation,
	useRemoveBidMutation,
} = bidsApi
