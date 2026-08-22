export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  spent: number;
  budgetLimit: number | null;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: CategorySpend[];
}