import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ReceiptText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BusinessProfile, Expense, BudgetTarget, HistoricalMonthData } from '../types';

interface OverviewViewProps {
  business: BusinessProfile;
  expenses: Expense[];
  budgets: BudgetTarget[];
  historical: HistoricalMonthData[];
  onOpenScanner: () => void;
  onOpenAudit: () => void;
  onNavigateTab: (tab: string) => void;
  onResolveAnomaly: (expenseId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Payroll & Contractors': '#3b82f6',
  'Cloud & Software': '#8b5cf6',
  'Marketing & Growth': '#ec4899',
  'Office & Hardware': '#10b981',
  'Travel & Meals': '#f59e0b',
  'Legal & Professional': '#6366f1',
  'Financial & Banking': '#14b8a6',
  'Utilities & Facilities': '#94a3b8',
  'Inventory & Supplies': '#f97316',
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  business,
  expenses,
  budgets,
  historical,
  onOpenScanner,
  onOpenAudit,
  onNavigateTab,
  onResolveAnomaly,
}) => {
  const totalOpEx = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = business.monthlyRevenue - totalOpEx;
  const netMargin = ((netIncome / business.monthlyRevenue) * 100).toFixed(1);
  const flaggedExpenses = expenses.filter(e => e.status === 'flagged');

  const categoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  })).sort((a, b) => b.value - a.value);

  const chartData = historical.map(h => ({
    name: h.month.replace(' 2026', '').replace(' (MTD)', ''),
    Revenue: h.revenue,
    Expenses: h.expenses,
    Profit: h.netProfit,
  }));

  const taxDeductibleTotal = expenses
    .filter(e => e.taxDeductible)
    .reduce((sum, e) => sum + e.amount, 0);
  const taxSavedEst = Math.round(taxDeductibleTotal * (business.taxRate / 100));

  return (
    <div className="space-y-6" id="overview-dashboard">
      
      {flaggedExpenses.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  AI Controller Alert: {flaggedExpenses.length} General Ledger Items Flagged
                </h2>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Anomalies detected: AWS infrastructure surge (+40%), duplicate renewal, and meal limit exception.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onOpenAudit}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                Inspect Ledger Audit
              </button>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors"
              >
                View Flagged Entries
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-5">
        
        <div className="xl:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Liquid Cash Reserves</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ${business.currentCashBalance.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Safe Runway: Self-sustaining</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Burn buffer: 14+ mo</span>
            <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Mercury FDIC</span>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue (MRR)</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ${business.monthlyRevenue.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{business.revenueGrowthMoM}% Month-over-Month</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>ARR: ${(business.monthlyRevenue * 12).toLocaleString()}</span>
            <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">98% Collection</span>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MTD Operating Expenses</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <ReceiptText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ${Math.round(totalOpEx).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-slate-600 font-medium">
              <span>Target limit: $64,500/mo</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>{expenses.length} ledger transactions</span>
            <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Cloud 13% over</span>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Operating Margin</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tracking-tight">
              +${Math.round(netIncome).toLocaleString()}
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-emerald-600 font-medium">
              <span>{netMargin}% net profit margin</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Tax Shield: ${taxSavedEst.toLocaleString()}</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Healthy FCF</span>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue vs. Operating Spend Trend</h3>
                <p className="text-xs text-slate-500">6-Month historical performance and cash generation trajectory</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
                  <span className="text-slate-700 font-semibold">Revenue</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block"></span>
                  <span className="text-slate-700 font-semibold">OpEx</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      color: '#fff', 
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                  <Bar dataKey="Revenue" fill="#059669" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#94a3b8" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Avg Gross Margin</span>
              <span className="font-bold text-slate-800 font-mono text-sm">73.4%</span>
            </div>
            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
              <span className="text-slate-400 block text-[11px]">Net Cash Added (6 Mo)</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">+$66,460</span>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Cost-to-Income Ratio</span>
              <span className="font-bold text-slate-800 font-mono text-sm">81.9%</span>
            </div>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Spend Distribution</h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">MTD Breakdown</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Categorized automatically by AI Controller</p>
          </div>

          <div className="h-48 w-full relative my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '10px', 
                    color: '#fff', 
                    fontSize: '11px',
                    border: 'none'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-medium">Total OpEx</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                ${Math.round(totalOpEx / 1000)}k
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 overflow-y-auto max-h-36 pr-1">
            {pieData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center space-x-2 truncate">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94a3b8' }}
                  />
                  <span className="text-slate-700 truncate text-[11px] font-medium">{item.name}</span>
                </div>
                <div className="font-mono font-bold text-slate-900 shrink-0 text-[11px]">
                  ${item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 xl:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Controller Recommendations</h3>
            </div>
            <button
              onClick={onOpenAudit}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 transition-colors"
            >
              Full Health Audit →
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start justify-between gap-3 text-xs hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200/60">
                    High Priority
                  </span>
                  <span className="font-bold text-slate-900">Right-size AWS Aurora Compute</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  Idle test database and snapshot storage surge caused a 40.2% cloud spike. Apply 1-year Savings Plan.
                </p>
              </div>
              <span className="font-bold font-mono text-emerald-700 shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 text-[11px]">
                +$1,250/mo
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start justify-between gap-3 text-xs hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/60">
                    High Priority
                  </span>
                  <span className="font-bold text-slate-900">Resolve Duplicate SaaS Charge</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  Figma Enterprise ($480.00) billed across two separate corporate cards within 48 hours.
                </p>
              </div>
              <span className="font-bold font-mono text-emerald-700 shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 text-[11px]">
                +$480/mo
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start justify-between gap-3 text-xs hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200/60">
                    Medium
                  </span>
                  <span className="font-bold text-slate-900">Enforce Client Meal Substantiation</span>
                </div>
                <p className="text-slate-600 mt-1 text-[11px]">
                  Require itemized receipts for dinners &gt;$100 to maximize 50% IRS business meal tax deductions.
                </p>
              </div>
              <span className="font-bold font-mono text-emerald-700 shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 text-[11px]">
                +$380/mo
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 xl:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ReceiptText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Automated Ledger Stream</h3>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 transition-colors"
            >
              All {expenses.length} Records →
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {expenses.slice(0, 5).map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                <div className="space-y-0.5 pr-2 truncate">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-bold text-slate-900 truncate text-[11px]">{exp.merchant}</span>
                    {exp.status === 'flagged' ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-800 font-bold shrink-0 border border-rose-200">
                        Flagged
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-medium shrink-0 border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {exp.date} • {exp.category} • {exp.paymentMethod}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-slate-900 text-xs block">
                    ${exp.amount.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {exp.taxDeductible ? 'Tax Deductible' : 'Non-deductible'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center font-semibold text-emerald-700 hover:text-emerald-800"
            >
              + Scan & Ingest Receipt
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              QuickBooks & Mercury Sync
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
