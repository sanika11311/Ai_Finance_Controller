import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Calendar, 
  Users, 
  DollarSign,
  Loader2,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  ComposedChart,
  Area
} from 'recharts';
import { BudgetTarget, BusinessProfile, Expense } from '../types';

interface BudgetForecastViewProps {
  budgets: BudgetTarget[];
  expenses: Expense[];
  business: BusinessProfile;
  onUpdateBudgetLimit: (id: string, newLimit: number) => void;
}

export const BudgetForecastView: React.FC<BudgetForecastViewProps> = ({
  budgets,
  expenses,
  business,
  onUpdateBudgetLimit,
}) => {
  const [scenarioName, setScenarioName] = useState<'Conservative' | 'Baseline' | 'Aggressive'>('Baseline');
  const [revenueGrowthMoM, setRevenueGrowthMoM] = useState<number>(5.2);
  const [expenseOptimizationPct, setExpenseOptimizationPct] = useState<number>(0);
  const [headcountDelta, setHeadcountDelta] = useState<number>(0);

  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    runwayVerdict: string;
    sustainabilityStatus: string;
    riskLevel: string;
    strategicLevers: string[];
    riskFactors: string[];
    cfoSummary: string;
  } | null>(null);

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  const categoryActuals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const projections = useMemo(() => {
    const months = [
      'Oct 2026', 'Nov 2026', 'Dec 2026',
      'Jan 2027', 'Feb 2027', 'Mar 2027',
      'Apr 2027', 'May 2027', 'Jun 2027',
      'Jul 2027', 'Aug 2027', 'Sep 2027',
    ];

    let currentCash = business.currentCashBalance;
    let currentRev = business.monthlyRevenue;
    const baseOpex = expenses.reduce((sum, e) => sum + e.amount, 0);

    return months.map((month) => {
      currentRev = currentRev * (1 + revenueGrowthMoM / 100);

      const adjustedOpex = baseOpex * (1 + expenseOptimizationPct / 100) + (headcountDelta * 5500);

      const netIncome = currentRev - adjustedOpex;
      currentCash += netIncome;

      const burnRate = netIncome < 0 ? Math.abs(netIncome) : 0;
      const runway = burnRate > 0 ? currentCash / burnRate : 999;

      return {
        month: month.split(' ')[0],
        projectedRevenue: Math.round(currentRev),
        projectedOpex: Math.round(adjustedOpex),
        projectedNet: Math.round(netIncome),
        projectedCashEnding: Math.round(currentCash),
        runwayMonths: Number((runway > 36 ? 36 : runway).toFixed(1)),
      };
    });
  }, [business, expenses, revenueGrowthMoM, expenseOptimizationPct, headcountDelta]);

  const applyPreset = (preset: 'Conservative' | 'Baseline' | 'Aggressive') => {
    setScenarioName(preset);
    if (preset === 'Conservative') {
      setRevenueGrowthMoM(0);
      setExpenseOptimizationPct(3);
      setHeadcountDelta(0);
    } else if (preset === 'Baseline') {
      setRevenueGrowthMoM(5.2);
      setExpenseOptimizationPct(0);
      setHeadcountDelta(0);
    } else if (preset === 'Aggressive') {
      setRevenueGrowthMoM(10.0);
      setExpenseOptimizationPct(-5);
      setHeadcountDelta(2);
    }
  };

  const handleGenerateAiForecast = async () => {
    setLoadingAiAnalysis(true);
    try {
      const res = await fetch('/api/ai/forecast-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioName,
          revenueGrowthPct: revenueGrowthMoM,
          expenseInflationPct: expenseOptimizationPct,
          headcountChange: headcountDelta,
          projections,
          cashBalance: business.currentCashBalance,
        }),
      });

      if (!res.ok) throw new Error('Forecast analysis service error');
      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  const totalMonthlyBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalActualSpent = (Object.values(categoryActuals) as number[]).reduce((a: number, b: number) => a + b, 0);
  const overallVariance = totalMonthlyBudget - totalActualSpent;

  return (
    <div className="space-y-5" id="budget-forecast-view">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Budget Forecasting & Predictive Runway</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              12-Mo Horizon
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Category variance analysis and dynamic cash flow simulation.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-50/80 p-2.5 px-4 rounded-2xl border border-slate-200/60">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Approved Budget Cap</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              ${totalMonthlyBudget.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Overall Variance</span>
            <span className={`font-bold font-mono text-sm ${overallVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {overallVariance >= 0 ? `+$${Math.round(overallVariance).toLocaleString()} (Favorable)` : `-$${Math.round(Math.abs(overallVariance)).toLocaleString()} (Over)`}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Operating Budgets by Category</h3>
            <p className="text-xs text-slate-500">Monitors threshold discipline and alerts on overruns</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Click &quot;Edit Target&quot; to adjust spending limits
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {budgets.map((b) => {
            const actual = categoryActuals[b.category] || b.spent || 0;
            const pct = Math.round((actual / b.monthlyLimit) * 100);
            const isOver = pct > 100;
            const isWarning = pct >= b.alertThreshold && !isOver;
            const remaining = b.monthlyLimit - actual;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isOver
                    ? 'border-rose-300 bg-rose-50/25 shadow-2xs'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/25 shadow-2xs'
                    : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{b.category}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">{b.department}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      ${actual.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-[11px] block">/ ${b.monthlyLimit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${isOver ? 'text-rose-700 font-bold' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {pct}% Consumed {isOver ? '(! Over)' : ''}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">
                      {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `-$${Math.abs(remaining).toLocaleString()}`}
                    </span>
                    <button
                      onClick={() => {
                        setEditingBudgetId(b.id);
                        setEditLimitValue(b.monthlyLimit.toString());
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline text-[11px]"
                    >
                      Edit Target
                    </button>
                  </div>
                </div>

                {b.notes && (
                  <p className="text-[10px] text-slate-400 mt-1 italic truncate">
                    {b.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editingBudgetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Update Monthly Budget Limit</h4>
            <p className="text-xs text-slate-500 mt-1">Adjust target spend limit for this fiscal period.</p>
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Monthly Limit ($)</label>
              <input
                type="number"
                value={editLimitValue}
                onChange={(e) => setEditLimitValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setEditingBudgetId(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = parseFloat(editLimitValue);
                  if (val > 0) {
                    onUpdateBudgetLimit(editingBudgetId, val);
                  }
                  setEditingBudgetId(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-2xs"
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">12-Month Cash Flow & Runway Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust growth, hiring, and cost levers to test financial resilience and ending cash reserves.
            </p>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => applyPreset('Conservative')}
              className={`px-3 py-1 rounded-md transition-all ${
                scenarioName === 'Conservative' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Conservative
            </button>
            <button
              onClick={() => applyPreset('Baseline')}
              className={`px-3 py-1 rounded-md transition-all ${
                scenarioName === 'Baseline' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Baseline Target
            </button>
            <button
              onClick={() => applyPreset('Aggressive')}
              className={`px-3 py-1 rounded-md transition-all ${
                scenarioName === 'Aggressive' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Growth / Hiring
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 text-xs">
          
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
              <label>Monthly Revenue Growth</label>
              <span className="font-mono text-emerald-700 font-bold">{revenueGrowthMoM}% MoM</span>
            </div>
            <input
              type="range"
              min="-5"
              max="20"
              step="0.5"
              value={revenueGrowthMoM}
              onChange={(e) => setRevenueGrowthMoM(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>-5% (Downturn)</span>
              <span>+5% (Baseline)</span>
              <span>+20% (Scale)</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
              <label>OpEx Efficiency / Creep</label>
              <span className={`font-mono font-bold ${expenseOptimizationPct <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {expenseOptimizationPct > 0 ? `+${expenseOptimizationPct}% cost` : `${expenseOptimizationPct}% savings`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={expenseOptimizationPct}
              onChange={(e) => setExpenseOptimizationPct(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>-20% (Cut)</span>
              <span>0% (Status quo)</span>
              <span>+20% (Inflation)</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
              <label>Net Headcount Additions</label>
              <span className="font-mono text-blue-700 font-bold">+{headcountDelta} Staff</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={headcountDelta}
              onChange={(e) => setHeadcountDelta(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 FTE</span>
              <span>+$5.5k/mo per staff</span>
              <span>+6 FTE</span>
            </div>
          </div>

        </div>

        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-800">12-Month Forward Cash Trajectory & Net Margins</span>
            <div className="flex items-center space-x-3 text-slate-500">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-[11px] font-medium">Ending Cash ($)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-400"></span>
                <span className="text-[11px] font-medium">Net Profit</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  yAxisId="cash" 
                  orientation="left" 
                  stroke="#059669" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`} 
                />
                <YAxis 
                  yAxisId="net" 
                  orientation="right" 
                  stroke="#3b82f6" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`} 
                />
                <Tooltip 
                  formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name]}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '16px', 
                    color: '#fff', 
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                  }}
                />
                <Bar yAxisId="net" dataKey="projectedNet" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Net Monthly Profit" />
                <Line 
                  yAxisId="cash" 
                  type="monotone" 
                  dataKey="projectedCashEnding" 
                  stroke="#059669" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#059669' }} 
                  name="Ending Cash" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">12-Mo Projected Cash</span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  ${projections[projections.length - 1]?.projectedCashEnding.toLocaleString()}
                </span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Month 12 MRR Target</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  ${projections[projections.length - 1]?.projectedRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Runway Status</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 inline-block">
                  Self-Sustaining Cash Flow
                </span>
              </div>

              <button
                onClick={handleGenerateAiForecast}
                disabled={loadingAiAnalysis}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition-all text-xs"
              >
                {loadingAiAnalysis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Advisory</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {aiAnalysis && (
          <div className="border border-emerald-200/90 rounded-2xl p-5 sm:p-6 bg-emerald-50/25 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Controller Strategic Forecast Briefing
                </h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {aiAnalysis.sustainabilityStatus} • {aiAnalysis.riskLevel}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {aiAnalysis.cfoSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-emerald-200/60 text-xs">
              <div className="space-y-1.5 bg-white/70 p-3.5 rounded-xl border border-emerald-100">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block text-emerald-800">
                  Strategic Margin Levers
                </span>
                <ul className="space-y-1 text-slate-600">
                  {aiAnalysis.strategicLevers?.map((lever, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{lever}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 bg-white/70 p-3.5 rounded-xl border border-amber-100">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block text-amber-800">
                  Risk Factors & Sensitivities
                </span>
                <ul className="space-y-1 text-slate-600">
                  {aiAnalysis.riskFactors?.map((rf, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
