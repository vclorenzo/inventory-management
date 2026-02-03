import { Product } from '@/types/Products';

export interface SalesSummary {
	salesSummaryId: string;
	totalValue: number;
	changePercentage?: number;
	date: string;
}

export interface PurchaseSummary {
	purchaseSummaryId: string;
	totalPurchased: number;
	changePercentage?: number;
	date: string;
}

export interface ExpenseSummary {
	expenseSummarId: string;
	totalExpenses: number;
	date: string;
}

export interface ExpenseByCategorySummary {
	expenseByCategorySummaryId: string;
	category: string;
	amount: string;
	date: string;
}

export interface DashboardMetrics {
	popularProducts: Product[];
	salesSummary: SalesSummary[];
	purchaseSummary: PurchaseSummary[];
	expenseSummary: ExpenseSummary[];
	expenseByCategorySummary: ExpenseByCategorySummary[];
}
