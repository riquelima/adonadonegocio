export interface ExpenseItem {
  id: string;
  label: string;
  value: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  isoDate: string;
  // Totals for quick display in lists
  receipts: number;
  expenses: number;
  profit: number;
  // Full snapshot of the calculator state
  snapshot: {
    fixedExpenses: ExpenseItem[];
    contingencyCosts: ExpenseItem[];
    profitMargin: number;
    financialReservePercentage: number;
    clientReceipts: number;
  }
}

export interface MonthlySummary {
  monthYear: string; // e.g., "Julho de 2024"
  receipts: number;
  expenses: number;
  profit: number;
  count: number;
  entries: HistoryEntry[];
}

export interface WeeklySummary {
  weekYear: string; // e.g., "Semana 30 de 2024"
  receipts: number;
  expenses: number;
  profit: number;
  count: number;
  entries: HistoryEntry[];
}

export interface InsightData {
  kpis: {
    totalReceipts: number;
    totalExpenses: number;
    totalProfit: number;
    averageProfitMargin: number;
  };
  costAnalysis: {
    topExpenses: { label: string; value: number }[];
  };
  alerts: string[];
}

export interface SavedInsight {
  id: string;
  created_at: string;
  insight_data: InsightData;
}
