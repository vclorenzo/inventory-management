import { api } from "../api";
import { ExpenseByCategorySummary } from "@/types/pages/DashboardMetrics";

export const expensesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpensesByCategory: builder.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
  }),
});

export const { useGetExpensesByCategoryQuery } = expensesApi;
