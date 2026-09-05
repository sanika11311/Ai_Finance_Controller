export type ExpenseCategory =
  | 'Cloud & Software'
  | 'Payroll & Contractors'
  | 'Office & Hardware'
  | 'Marketing & Growth'
  | 'Travel & Meals'
  | 'Legal & Professional'
  | 'Utilities & Facilities'
  | 'Inventory & Supplies'
  | 'Financial & Banking';

export type Department =
  | 'Engineering'
  | 'Sales & Marketing'
  | 'Operations'
  | 'Executive & G&A'
  | 'Customer Support';

export type ExpenseStatus = 'approved' | 'pending' | 'flagged';

export interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  department: Department;
  paymentMethod: 'Corporate Card' | 'ACH Wire' | 'Direct Debit' | 'Reimbursement';
  status: ExpenseStatus;
  taxDeductible: boolean;
  taxAmount?: number;
  description: string;
  receiptUrlOrSnippet?: string;
  isRecurring?: boolean;
  anomalyDetected?: string | null;
  aiConfidence?: number;
}

export interface BudgetTarget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  spent: number;
  alertThreshold: number;
  department: Department;
  notes?: string;
}

export interface BusinessProfile {
  name: string;
  industry: string;
  currentCashBalance: number;
  monthlyRevenue: number;
  revenueGrowthMoM: number;
  taxRate: number;
  fiscalYear: string;
}

export interface HistoricalMonthData {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  endingCash: number;
}

export interface ProjectedMonth {
  month: string;
  projectedRevenue: number;
  projectedOpex: number;
  projectedNet: number;
  projectedCashEnding: number;
  runwayMonths: number;
}

export interface ControllerAnomaly {
  id: string;
  expenseId: string;
  merchant: string;
  amount: number;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendedAction: string;
}

export interface ControllerAuditReport {
  healthScore: number;
  executiveSummary: string;
  monthlyRunRate: number;
  estimatedRunwayMonths: number;
  topSpendDrivers: Array<{ category: string; amount: number; percentage: number }>;
  potentialTaxDeductions: number;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium';
    title: string;
    impact: string;
    action: string;
    estimatedSavings: number;
  }>;
  complianceFlagsCount: number;
}
