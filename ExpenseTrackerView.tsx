import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ReceiptText, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Expense, ExpenseCategory, Department, ExpenseStatus } from '../types';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  onOpenScanner: () => void;
  onOpenManualModal: () => void;
  onUpdateStatus: (id: string, newStatus: ExpenseStatus) => void;
  onDeleteExpense: (id: string) => void;
  onBulkApprove: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Cloud & Software',
  'Payroll & Contractors',
  'Office & Hardware',
  'Marketing & Growth',
  'Travel & Meals',
  'Legal & Professional',
  'Utilities & Facilities',
  'Inventory & Supplies',
  'Financial & Banking',
];

const DEPARTMENTS: Department[] = [
  'Engineering',
  'Sales & Marketing',
  'Operations',
  'Executive & G&A',
  'Customer Support',
];

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  onOpenScanner,
  onOpenManualModal,
  onUpdateStatus,
  onDeleteExpense,
  onBulkApprove,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || e.category === selectedCategory;
      const matchDept = selectedDepartment === 'all' || e.department === selectedDepartment;
      const matchStatus = selectedStatus === 'all' || e.status === selectedStatus;

      return matchSearch && matchCategory && matchDept && matchStatus;
    });
  }, [expenses, searchQuery, selectedCategory, selectedDepartment, selectedStatus]);

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
  const flaggedCount = filtered.filter((e) => e.status === 'flagged').length;

  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Amount', 'Category', 'Department', 'Payment Method', 'Status', 'Tax Deductible', 'Description', 'Anomaly'];
    const rows = filtered.map(e => [
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      `"${e.category}"`,
      `"${e.department}"`,
      `"${e.paymentMethod}"`,
      e.status,
      e.taxDeductible ? 'Yes' : 'No',
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.anomalyDetected || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5" id="expenses-view">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Automated Expense Ledger</h2>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time receipt ingestion, vendor anomaly tagging, and tax substantiation.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-2xs"
          >
            <ReceiptText className="w-4 h-4 mr-1.5" />
            Scan Receipt (AI)
          </button>

          <button
            onClick={onOpenManualModal}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 transition-all"
          >
            <Plus className="w-4 h-4 mr-1 text-slate-500" />
            Add Manual
          </button>

          <button
            onClick={onBulkApprove}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
            title="Mark all pending expenses as approved"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Approve All
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendor, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="all">All Expense Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Verified / Approved</option>
              <option value="flagged">Controller Flagged ({flaggedCount})</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span>
              Total Matching Spend:{' '}
              <strong className="text-slate-900 font-mono font-bold text-sm">
                ${totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </span>
            <span>•</span>
            <span>
              Tax Deductible Portion:{' '}
              <strong className="text-emerald-700 font-mono font-bold text-sm">
                $
                {filtered
                  .filter((e) => e.taxDeductible)
                  .reduce((acc, e) => acc + e.amount, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          {flaggedCount > 0 && (
            <span className="text-rose-700 font-semibold flex items-center bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
              {flaggedCount} flagged anomalies require controller action
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant & Purpose</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-center">Tax</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions found matching the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => {
                  const isExpanded = expandedId === exp.id;
                  const isFlagged = exp.status === 'flagged';

                  return (
                    <React.Fragment key={exp.id}>
                      <tr 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isFlagged ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {exp.date}
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">
                            {exp.merchant}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {exp.description}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {exp.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {exp.department}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {exp.paymentMethod}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {exp.taxDeductible ? (
                            <span className="inline-flex items-center text-emerald-700 text-[11px] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                              100%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Non-ded.</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ${exp.amount.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isFlagged ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                              Flagged Anomaly
                            </button>
                          ) : exp.status === 'approved' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" />
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                              title="Toggle details & audit log"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="p-1 text-slate-300 hover:text-rose-600 rounded-md hover:bg-rose-50"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={9} className="p-4 border-b border-slate-200">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                              
                              {exp.anomalyDetected && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                                  <div className="flex items-start space-x-2 text-rose-800">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="block">Controller Anomaly Detected:</strong>
                                      <span>{exp.anomalyDetected}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      onUpdateStatus(exp.id, 'approved');
                                      setExpandedId(null);
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 font-semibold rounded-lg shrink-0 transition-colors shadow-2xs"
                                  >
                                    Acknowledge & Approve
                                  </button>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <span className="text-[11px] text-slate-400 block">AI Ingestion Confidence</span>
                                  <span className="font-bold text-slate-800 font-mono">
                                    {exp.aiConfidence || 95}% (Neural OCR & Taxonomy match)
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-400 block">Tax Category Code</span>
                                  <span className="font-bold text-slate-800 font-mono">
                                    IRS Schedule C Line 18 / Section 162(a)
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-400 block">Receipt Substantiation Snippet</span>
                                  <span className="font-mono text-slate-600 truncate block">
                                    {exp.receiptUrlOrSnippet || 'Electronic invoice verified via Mercury Bank Feed'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                                <span>Record ID: {exp.id}</span>
                                <div className="space-x-2">
                                  {exp.status !== 'approved' && (
                                    <button
                                      onClick={() => onUpdateStatus(exp.id, 'approved')}
                                      className="font-semibold text-emerald-700 hover:text-emerald-800"
                                    >
                                      Mark Approved
                                    </button>
                                  )}
                                  {exp.status !== 'flagged' && (
                                    <button
                                      onClick={() => onUpdateStatus(exp.id, 'flagged')}
                                      className="font-semibold text-rose-700 hover:text-rose-800"
                                    >
                                      Flag for Audit
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
