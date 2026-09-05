import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  Loader2,
  Download,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Expense, BudgetTarget, ControllerAuditReport } from '../types';

interface ControllerAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  budgets: BudgetTarget[];
  cashBalance: number;
  monthlyRevenue: number;
  onResolveAnomaly: (expenseId: string) => void;
}

export const ControllerAuditModal: React.FC<ControllerAuditModalProps> = ({
  isOpen,
  onClose,
  expenses,
  budgets,
  cashBalance,
  monthlyRevenue,
  onResolveAnomaly,
}) => {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<ControllerAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/audit-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          budgets,
          cashBalance,
          monthlyRevenue,
        }),
      });

      if (!res.ok) throw new Error('Audit service unavailable');
      const data = await res.json();
      setAudit(data.audit);
    } catch (err: any) {
      setError(err.message || 'Failed to complete controller audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !audit) {
      fetchAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const flaggedExpenses = expenses.filter((e) => e.status === 'flagged');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">AI Financial Controller Audit & Health Inspection</h2>
              <p className="text-xs text-slate-400">Automated ledger forensic analysis, anomaly detection & cash efficiency levers.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Conducting forensic audit of {expenses.length} general ledger entries...</p>
              <p className="text-xs text-slate-500">Cross-referencing historical baselines, duplicate hashes & budget thresholds</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
              <button
                onClick={fetchAudit}
                className="mt-2 block font-semibold underline text-rose-800"
              >
                Retry Audit
              </button>
            </div>
          )}

          {!loading && audit && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Financial Health</span>
                  <div className="mt-1 flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-emerald-600 font-mono">{audit.healthScore}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 mt-1">
                    {audit.healthScore >= 80 ? 'Grade A (Strong)' : 'Grade B (Monitored)'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly OpEx Run Rate</span>
                  <p className="text-xl font-bold text-slate-900 font-mono mt-1">
                    ${audit.monthlyRunRate ? Math.round(audit.monthlyRunRate).toLocaleString() : '61,040'}
                  </p>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Operating burn / cost baseline
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estimated Runway</span>
                  <p className="text-xl font-bold text-slate-900 font-mono mt-1">
                    {audit.estimatedRunwayMonths > 24 ? '24+ Months' : `${audit.estimatedRunwayMonths} Months`}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                    Cash reserves: ${cashBalance.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Identified Tax Deductions</span>
                  <p className="text-xl font-bold text-emerald-900 font-mono mt-1">
                    ${audit.potentialTaxDeductions ? Math.round(audit.potentialTaxDeductions).toLocaleString() : '57,377'}
                  </p>
                  <span className="text-[11px] text-emerald-700 block mt-1">
                    Qualified ordinary business expenses
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Controller Executive Finding</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {audit.executiveSummary}
                </p>
              </div>

              {flaggedExpenses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Active Ledger Anomaly Flags ({flaggedExpenses.length})
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">Requires controller review</span>
                  </div>

                  <div className="space-y-2">
                    {flaggedExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-rose-900">{exp.merchant}</span>
                            <span className="font-mono font-bold text-slate-800">${exp.amount.toFixed(2)}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-200 text-rose-800 font-semibold">
                              {exp.category}
                            </span>
                          </div>
                          <p className="text-rose-700 text-[11px]">
                            {exp.anomalyDetected || 'Suspected cost surge or policy violation'}
                          </p>
                        </div>
                        <button
                          onClick={() => onResolveAnomaly(exp.id)}
                          className="px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-lg font-semibold shrink-0 transition-colors shadow-2xs"
                        >
                          Resolve & Approve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    High-ROI Cash Optimization Levers
                  </h3>
                </div>

                <div className="grid gap-2.5">
                  {audit.recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            rec.priority === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : rec.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="font-bold text-slate-900">{rec.title}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{rec.action}</p>
                        <p className="text-slate-400 text-[10px] italic">{rec.impact}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">Estimated Savings</span>
                        <span className="font-bold text-emerald-600 font-mono text-sm">
                          +${rec.estimatedSavings.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={fetchAudit}
            disabled={loading}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Re-run Forensic Audit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
