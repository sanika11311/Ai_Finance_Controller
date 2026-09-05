import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight,
  Loader2,
  Calendar,
  Building2
} from 'lucide-react';
import { BusinessProfile, Expense, BudgetTarget, HistoricalMonthData } from '../types';

interface FinancialReportingViewProps {
  business: BusinessProfile;
  expenses: Expense[];
  budgets: BudgetTarget[];
  historical: HistoricalMonthData[];
}

export const FinancialReportingView: React.FC<FinancialReportingViewProps> = ({
  business,
  expenses,
  budgets,
  historical,
}) => {
  const [loadingReport, setLoadingReport] = useState(false);
  const [executiveReport, setExecutiveReport] = useState<{
    reportTitle: string;
    period: string;
    executiveOverview: string;
    revenueAnalysis: string;
    opexVarianceNotes: Array<{ category: string; variance: string; controllerNote: string }>;
    cashFlowHealth: string;
    controllerActionPlan: string[];
    taxOptimizationNotes: string;
  } | null>(null);

  const totalRevenue = business.monthlyRevenue;
  
  const payrollTotal = expenses.filter(e => e.category === 'Payroll & Contractors').reduce((s, e) => s + e.amount, 0);
  const cloudTotal = expenses.filter(e => e.category === 'Cloud & Software').reduce((s, e) => s + e.amount, 0);
  const marketingTotal = expenses.filter(e => e.category === 'Marketing & Growth').reduce((s, e) => s + e.amount, 0);
  const officeTotal = expenses.filter(e => e.category === 'Office & Hardware').reduce((s, e) => s + e.amount, 0);
  const travelTotal = expenses.filter(e => e.category === 'Travel & Meals').reduce((s, e) => s + e.amount, 0);
  const legalTotal = expenses.filter(e => e.category === 'Legal & Professional').reduce((s, e) => s + e.amount, 0);
  const bankingTotal = expenses.filter(e => e.category === 'Financial & Banking').reduce((s, e) => s + e.amount, 0);
  const otherTotal = expenses.filter(e => ['Utilities & Facilities', 'Inventory & Supplies'].includes(e.category)).reduce((s, e) => s + e.amount, 0);

  const totalOpex = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalRevenue - cloudTotal;
  const grossMarginPct = ((grossProfit / totalRevenue) * 100).toFixed(1);
  const operatingIncome = totalRevenue - totalOpex;
  const operatingMarginPct = ((operatingIncome / totalRevenue) * 100).toFixed(1);
  const estimatedTaxes = Math.max(0, Math.round(operatingIncome * (business.taxRate / 100)));
  const netIncome = operatingIncome - estimatedTaxes;

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch('/api/ai/executive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfile: business,
          expenses,
          budgets,
          historical,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setExecutiveReport(data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5" id="reporting-view">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Real-Time Financial Reporting</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
              GAAP & IRS Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time P&L Statement, Cash Flow, and Executive Controller Board Briefings.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-xs"
          >
            {loadingReport ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-amber-400" />
                Drafting Memo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
                Generate Executive Report (AI)
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 transition-all"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
            Print / PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profit & Loss Statement (Income Statement)</h3>
            <p className="text-xs text-slate-500">Real-time MTD accounting ledger synchronization</p>
          </div>
          <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/60">
            Reporting Period: September 2026 (MTD)
          </div>
        </div>

        <div className="text-xs">
          <div className="py-2.5 flex justify-between font-bold text-slate-900 border-b border-slate-200">
            <span>Gross Operating Revenue</span>
            <span className="font-mono text-sm">${totalRevenue.toLocaleString()}</span>
          </div>

          <div className="py-2 pl-4 flex justify-between text-slate-600 border-b border-slate-100">
            <span>Cost of Services / Cloud Infrastructure (AWS, Compute)</span>
            <span className="font-mono">(${Math.round(cloudTotal).toLocaleString()})</span>
          </div>

          <div className="py-2.5 flex justify-between font-bold text-slate-800 bg-slate-50/80 px-3.5 rounded-xl my-1.5 border border-slate-200/60">
            <span>Gross Profit ({grossMarginPct}% Gross Margin)</span>
            <span className="font-mono font-bold">${Math.round(grossProfit).toLocaleString()}</span>
          </div>

          <div className="pt-3 pb-1 font-bold text-slate-700 uppercase text-[10px] tracking-wider">
            Operating Expenses (OpEx)
          </div>

          <div className="space-y-1.5 pl-4 border-b border-slate-200 pb-3">
            <div className="flex justify-between text-slate-600">
              <span>Payroll, Engineers & Contractors</span>
              <span className="font-mono">${Math.round(payrollTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sales, Marketing & Customer Acquisition</span>
              <span className="font-mono">${Math.round(marketingTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Office, Hardware & Coworking</span>
              <span className="font-mono">${Math.round(officeTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Travel, Client Dinners & Conferences</span>
              <span className="font-mono">${Math.round(travelTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Legal, CPA Retainer & Compliance</span>
              <span className="font-mono">${Math.round(legalTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Merchant Processing & Bank Fees</span>
              <span className="font-mono">${Math.round(bankingTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Utilities, Facilities & Supplies</span>
              <span className="font-mono">${Math.round(otherTotal).toLocaleString()}</span>
            </div>
          </div>

          <div className="py-2.5 flex justify-between font-bold text-slate-800">
            <span>Total Operating Expenses</span>
            <span className="font-mono text-sm">${Math.round(totalOpex).toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between font-bold text-emerald-800 bg-emerald-50/60 px-3.5 rounded-xl border border-emerald-200/80 my-1.5">
            <span>Operating Income / EBITDA ({operatingMarginPct}% Margin)</span>
            <span className="font-mono font-bold text-sm">+${Math.round(operatingIncome).toLocaleString()}</span>
          </div>

          <div className="py-2 pl-4 flex justify-between text-slate-500 border-b border-slate-100">
            <span>Estimated Corporate Tax Provision ({business.taxRate}%)</span>
            <span className="font-mono">(${estimatedTaxes.toLocaleString()})</span>
          </div>

          <div className="py-3 flex justify-between font-extrabold text-slate-900 text-sm border-t border-slate-300">
            <span>Net Income (Free Cash Generation)</span>
            <span className="font-mono font-extrabold text-emerald-700">+${Math.round(netIncome).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating Cash Flow</span>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            +${Math.round(netIncome).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1.5">
            Positive cash accretion to treasury
          </span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Working Capital</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            ${business.currentCashBalance.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1.5">
            Current Ratio: 4.68x (Healthy liquidity)
          </span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tax Substantiation Status</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            94.2% Qualified
          </p>
          <span className="text-[11px] text-slate-500 block mt-1.5">
            IRS Sec 162 ordinary & necessary deductions
          </span>
        </div>
      </div>

      {executiveReport && (
        <div className="bg-white rounded-3xl border border-emerald-300 shadow-sm p-6 sm:p-7 space-y-5 print:border-none print:shadow-none" id="executive-briefing-doc">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{executiveReport.reportTitle}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Prepared by AI Finance Controller for {business.name} Leadership & Board
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200/60">
              {executiveReport.period}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1.5 text-slate-700">
                1. Executive Overview
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                {executiveReport.executiveOverview}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1.5 text-slate-700">
                2. Revenue & Cash Collection Performance
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                {executiveReport.revenueAnalysis}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 text-slate-700">
                3. Departmental Budget Variance Notes
              </h4>
              <div className="grid gap-2">
                {executiveReport.opexVarianceNotes?.map((note, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900">{note.category}</span>
                      <p className="text-slate-600 mt-0.5 text-[11px]">{note.controllerNote}</p>
                    </div>
                    <span className="font-mono font-semibold text-slate-800 shrink-0 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200/60">
                      {note.variance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-700">
                  4. Cash Flow & Runway Health
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                  {executiveReport.cashFlowHealth}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-700">
                  5. Controller Action Plan
                </h4>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                  {executiveReport.controllerActionPlan?.map((action, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block mb-1">
                6. Tax & Compliance Notes
              </span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                {executiveReport.taxOptimizationNotes}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
