import {
	DashboardMetrics,
	ExpenseByCategorySummary,
} from '@/types/DashboardMetrics';
import { NewProduct, Product } from '@/types/Products';
import { User } from '@/types/User';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
		credentials: 'include',
	}),
	reducerPath: 'api',
	tagTypes: ['DashboardMetrics', 'Products', 'Users', 'Expenses', 'Auth'],
	endpoints: () => ({}),
});

