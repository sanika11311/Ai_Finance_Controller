import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Wallet, 
  ReceiptText, 
  Bot,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { BusinessProfile, Expense } from '../types';

interface HeaderProps {
  business: BusinessProfile;
  expenses: Expense[];
  onOpenScanner: () => void;
  onOpenAuditModal: () => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  expenses,
  onOpenScanner,
  onOpenAuditModal,
  onToggleCopilot,
  copilotOpen,
  onResetData,
}) => {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const flaggedCount = expenses.filter(e => e.status === 'flagged').length;
  const netCashFlow = business.monthlyRevenue - totalSpent;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">AI Finance Controller</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Active Controller
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
                <span className="font-medium text-slate-700 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {business.name}
                </span>
                <span>•</span>
                <span>{business.industry}</span>
                <span>•</span>
                <span className="text-slate-600 font-mono">{business.fiscalYear}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              id="header-btn-scan-receipt"
              onClick={onOpenScanner}
              className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all shadow-2xs"
            >
              <ReceiptText className="w-4 h-4 mr-1.5 text-emerald-600" />
              Scan Receipt (AI)
            </button>

            <button
              id="header-btn-run-audit"
              onClick={onOpenAuditModal}
              className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
              Controller Audit
              {flaggedCount > 0 && (
                <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs bg-rose-500 text-white font-bold">
                  {flaggedCount}
                </span>
              )}
            </button>

            <button
              id="header-btn-copilot-toggle"
              onClick={onToggleCopilot}
              className={`inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                copilotOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-4 h-4 mr-1.5 text-blue-500 group-hover:text-blue-600" />
              AI Controller Chat
            </button>

            <button
              id="header-btn-reset"
              onClick={onResetData}
              title="Reset to default ledger demo data"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-2.5 bg-slate-50/70 p-2 px-3 rounded-xl border border-slate-200/60">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-600 shadow-2xs">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider leading-tight">Cash on Hand</span>
              <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm leading-tight">
                ${business.currentCashBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-50/70 p-2 px-3 rounded-xl border border-slate-200/60">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider leading-tight">Monthly Revenue</span>
              <span className="font-bold text-emerald-700 font-mono text-xs sm:text-sm leading-tight">
                ${business.monthlyRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-50/70 p-2 px-3 rounded-xl border border-slate-200/60">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100/80 shadow-2xs">
              <ReceiptText className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider leading-tight">MTD OpEx</span>
              <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm leading-tight">
                ${Math.round(totalSpent).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-slate-50/70 p-2 px-3 rounded-xl border border-slate-200/60">
            <div className={`p-1.5 rounded-lg shadow-2xs ${netCashFlow >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/80' : 'bg-rose-50 text-rose-600 border border-rose-100/80'}`}>
              {netCashFlow >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider leading-tight">Net Monthly Flow</span>
              <span className={`font-bold font-mono text-xs sm:text-sm leading-tight ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {netCashFlow >= 0 ? `+$${Math.round(netCashFlow).toLocaleString()}` : `-$${Math.round(Math.abs(netCashFlow)).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
