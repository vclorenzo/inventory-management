import { api } from '../api';
import { DashboardMetrics } from '@/types/DashboardMetrics';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      query: () => '/dashboard',
      providesTags: ['DashboardMetrics'],
    }),
  }),
});

export const { useGetDashboardMetricsQuery } = dashboardApi;