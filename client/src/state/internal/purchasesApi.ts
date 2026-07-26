import {
	PlaceOrderRequest,
	PlaceOrderResult,
	PurchaseItem,
} from '@/types/pages/Checkout'
import { api } from '../api'

export const purchasesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getPurchases: builder.query<PurchaseItem[], void>({
			query: () => '/purchases',
			transformResponse: (response: { data?: PurchaseItem[] }) =>
				Array.isArray(response?.data) ? response.data : [],
			providesTags: ['Purchases'],
		}),

		placeOrder: builder.mutation<PlaceOrderResult, PlaceOrderRequest>({
			query: (body) => ({
				url: '/purchases',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data?: PlaceOrderResult }) => {
				if (!response?.data) {
					throw new Error('Invalid place order response')
				}
				return response.data
			},
			invalidatesTags: [
				'Cart',
				'Products',
				'DashboardMetrics',
				'Purchases',
			],
		}),
	}),
})

export const { useGetPurchasesQuery, usePlaceOrderMutation } = purchasesApi
