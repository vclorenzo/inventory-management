import {
	DashboardMetrics,
	ExpenseByCategorySummary,
} from '@/types/DashboardMetrics.type';
import { NewProduct, Product } from '@/types/Products';
import { User } from '@/types/User';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
	baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
	reducerPath: 'api',
	tagTypes: ['DashboardMetrics', 'Products', 'Users', 'Expenses'],
	endpoints: (builder) => ({
		getDashboardMetrics: builder.query<DashboardMetrics, void>({
			query: () => '/dashboard',
			providesTags: ['DashboardMetrics'],
		}),
		getProducts: builder.query<Product[], string | void>({
			query: (search) => ({
				url: '/products',
				params: search ? { search } : {},
			}),
			providesTags: ['Products'],
		}),
		createProduct: builder.mutation<Product, NewProduct>({
			query: (newProduct) => ({
				url: '/products',
				method: 'POST',
				body: newProduct,
			}),
			invalidatesTags: ['Products'],
		}),
		getUsers: builder.query<User[], void>({
			query: () => '/users',
			providesTags: ['Users'],
		}),
		getExpensesByCategory: builder.query<ExpenseByCategorySummary[], void>({
			query: () => '/expenses',
			providesTags: ['Expenses'],
		}),
	}),
});

export const {
	useGetDashboardMetricsQuery,
	useGetProductsQuery,
	useCreateProductMutation,
	useGetUsersQuery,
	useGetExpensesByCategoryQuery,
} = api;
