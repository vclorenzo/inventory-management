import {
	Product,
	NewProduct,
	UpdateProduct,
} from '@/types/pages/Products'
import { isProductStatus } from '@/constants/productStatus'
import { api } from '../api'

export type ProductSortBy =
	'relevance' | 'name' | 'price' | 'rating' | 'stockQuantity'

export type SortOrder = 'asc' | 'desc'

export interface ProductQueryParams {
	search?: string
	userId?: string
	excludeUserId?: string
	category?: string[]
	brand?: string[]
	condition?: string[]
	status?: string[]
	minPrice?: number
	maxPrice?: number
	minRating?: number
	maxRating?: number
	minStock?: number
	maxStock?: number
	sortBy?: ProductSortBy
	sortOrder?: SortOrder
	page?: number
	limit?: number
	marketplace?: boolean
	listed?: boolean
}

export const normalizeQueryParams = (
	params?: string | ProductQueryParams,
): Record<string, string | number> => {
	if (!params) return {}
	if (typeof params === 'string') {
		return params.trim() ? { search: params.trim() } : {}
	}

	const query: Record<string, string | number> = {}

	if (params.search?.trim()) query.search = params.search.trim()
	if (params.userId?.trim()) query.userId = params.userId.trim()
	if (params.excludeUserId?.trim()) {
		query.excludeUserId = params.excludeUserId.trim()
	}
	if (params.category?.length) query.category = params.category.join(',')
	if (params.brand?.length) query.brand = params.brand.join(',')
	if (params.condition?.length) query.condition = params.condition.join(',')
	if (params.status?.length) query.status = params.status.join(',')
	if (typeof params.minPrice === 'number') query.minPrice = params.minPrice
	if (typeof params.maxPrice === 'number') query.maxPrice = params.maxPrice
	if (typeof params.minRating === 'number') query.minRating = params.minRating
	if (typeof params.maxRating === 'number') query.maxRating = params.maxRating
	if (typeof params.minStock === 'number') query.minStock = params.minStock
	if (typeof params.maxStock === 'number') query.maxStock = params.maxStock
	if (params.sortBy) query.sortBy = params.sortBy
	if (params.sortOrder) query.sortOrder = params.sortOrder
	if (typeof params.page === 'number') query.page = params.page
	if (typeof params.limit === 'number') query.limit = params.limit
	if (params.marketplace) query.marketplace = 'true'
	if (params.listed) query.listed = 'true'

	return query
}

function parseProduct(value: unknown): Product | null {
	if (!value || typeof value !== 'object') return null
	const status = 'status' in value ? value.status : undefined
	if (!isProductStatus(status)) return null
	return { ...(value as Product), status }
}

function parseProductList(response: { data?: unknown }): Product[] {
	const rows = Array.isArray(response.data) ? response.data : []
	const products: Product[] = []
	for (const row of rows) {
		const product = parseProduct(row)
		if (product) products.push(product)
	}
	return products
}

function parseProductRecord(response: { data?: unknown }): Product {
	const product = parseProduct(response.data)
	if (!product) {
		throw new Error('Invalid product payload')
	}
	return product
}

export const productsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getProducts: builder.query<
			Product[],
			string | ProductQueryParams | undefined
		>({
			query: (params) => ({
				url: '/products',
				params: normalizeQueryParams(params),
			}),
			transformResponse: parseProductList,
			providesTags: ['Products'],
		}),

		getProductById: builder.query<
			Product,
			string | { id: string; marketplace?: boolean }
		>({
			query: (arg) => {
				const id = typeof arg === 'string' ? arg : arg.id
				const marketplace =
					typeof arg === 'object' ? arg.marketplace : undefined
				return {
					url: `/products/${id}`,
					params: marketplace ? { marketplace: 'true' } : undefined,
				}
			},
			transformResponse: parseProductRecord,
			providesTags: ['Products'],
		}),

		createProduct: builder.mutation<Product, NewProduct>({
			query: (body) => ({
				url: '/products',
				method: 'POST',
				body,
			}),
			transformResponse: parseProductRecord,
			invalidatesTags: ['Products'],
		}),
		updateProduct: builder.mutation<Product, UpdateProduct>({
			query: ({ productId, ...body }) => ({
				url: `/products/${productId}`,
				method: 'PUT',
				body,
			}),
			transformResponse: parseProductRecord,
			invalidatesTags: ['Products'],
		}),

		deleteProduct: builder.mutation<{ message: string }, string>({
			query: (productId) => ({
				url: `/products/${productId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Products'],
		}),
	}),
})

export const {
	useGetProductsQuery,
	useGetProductByIdQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
} = productsApi
