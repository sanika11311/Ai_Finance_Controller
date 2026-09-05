import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  TrendingUp, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Bot
} from 'lucide-react';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { BudgetForecastView } from './components/BudgetForecastView';
import { FinancialReportingView } from './components/FinancialReportingView';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ControllerAuditModal } from './components/ControllerAuditModal';
import { ControllerCopilotDrawer } from './components/ControllerCopilotDrawer';

import { 
  INITIAL_BUSINESS_PROFILE, 
  INITIAL_BUDGETS, 
  INITIAL_EXPENSES, 
  HISTORICAL_DATA 
} from './data/initialData';
import { Expense, BudgetTarget, ExpenseStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'forecasting' | 'reporting'>('overview');
  const [businessProfile, setBusinessProfile] = useState(INITIAL_BUSINESS_PROFILE);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState<BudgetTarget[]>(INITIAL_BUDGETS);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expenseWithId: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [expenseWithId, ...prev]);

    setBudgets((prevBudgets) =>
      prevBudgets.map((b) =>
        b.category === newExpense.category
          ? { ...b, spent: b.spent + newExpense.amount }
          : b
      )
    );
  };

  const handleUpdateStatus = (id: string, newStatus: ExpenseStatus) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: newStatus,
              anomalyDetected: newStatus === 'approved' ? null : e.anomalyDetected,
            }
          : e
      )
    );
  };

  const handleDeleteExpense = (id: string) => {
    const toDelete = expenses.find((e) => e.id === id);
    if (!toDelete) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    setBudgets((prev) =>
      prev.map((b) =>
        b.category === toDelete.category
          ? { ...b, spent: Math.max(0, b.spent - toDelete.amount) }
          : b
      )
    );
  };

  const handleBulkApprove = () => {
    setExpenses((prev) =>
      prev.map((e) => ({
        ...e,
        status: 'approved',
        anomalyDetected: null,
      }))
    );
  };

  const handleUpdateBudgetLimit = (id: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, monthlyLimit: newLimit } : b))
    );
  };

  const handleResetData = () => {
    setExpenses(INITIAL_EXPENSES);
    setBudgets(INITIAL_BUDGETS);
    setBusinessProfile(INITIAL_BUSINESS_PROFILE);
  };

  const flaggedCount = expenses.filter((e) => e.status === 'flagged').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      
      <Header
        business={businessProfile}
        expenses={expenses}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenAuditModal={() => setAuditModalOpen(true)}
        onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        copilotOpen={copilotOpen}
        onResetData={handleResetData}
      />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 shadow-2xs">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto text-xs sm:text-sm font-semibold scrollbar-none">
            <button
              id="nav-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Executive Overview
            </button>

            <button
              id="nav-tab-expenses"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ReceiptText className="w-4 h-4 mr-1.5" />
              Expense Ledger & Receipts
              {flaggedCount > 0 && (
                <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {flaggedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-forecasting"
              onClick={() => setActiveTab('forecasting')}
              className={`flex items-center px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'forecasting'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Budget & 12-Mo Runway Forecast
            </button>

            <button
              id="nav-tab-reporting"
              onClick={() => setActiveTab('reporting')}
              className={`flex items-center px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'reporting'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Financial P&L & Board Reports
            </button>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {activeTab === 'overview' && (
          <OverviewView
            business={businessProfile}
            expenses={expenses}
            budgets={budgets}
            historical={HISTORICAL_DATA}
            onOpenScanner={() => setScannerOpen(true)}
            onOpenAudit={() => setAuditModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onResolveAnomaly={(id) => handleUpdateStatus(id, 'approved')}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTrackerView
            expenses={expenses}
            onOpenScanner={() => setScannerOpen(true)}
            onOpenManualModal={() => setAddExpenseOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteExpense={handleDeleteExpense}
            onBulkApprove={handleBulkApprove}
          />
        )}

        {activeTab === 'forecasting' && (
          <BudgetForecastView
            budgets={budgets}
            expenses={expenses}
            business={businessProfile}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
          />
        )}

        {activeTab === 'reporting' && (
          <FinancialReportingView
            business={businessProfile}
            expenses={expenses}
            budgets={budgets}
            historical={HISTORICAL_DATA}
          />
        )}
      </main>

      <ReceiptScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <ControllerAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        expenses={expenses}
        budgets={budgets}
        cashBalance={businessProfile.currentCashBalance}
        monthlyRevenue={businessProfile.monthlyRevenue}
        onResolveAnomaly={(id) => handleUpdateStatus(id, 'approved')}
      />

      <ControllerCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        business={businessProfile}
        expenses={expenses}
        budgets={budgets}
      />

    </div>
  );
}
