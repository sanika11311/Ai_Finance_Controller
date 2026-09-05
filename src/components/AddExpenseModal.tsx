import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Expense, ExpenseCategory, Department } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Office & Hardware');
  const [department, setDepartment] = useState<Department>('Operations');
  const [paymentMethod, setPaymentMethod] = useState<'Corporate Card' | 'ACH Wire' | 'Direct Debit' | 'Reimbursement'>('Corporate Card');
  const [description, setDescription] = useState('');
  const [taxDeductible, setTaxDeductible] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount || Number(amount) <= 0) return;

    onAddExpense({
      merchant: merchant.trim(),
      amount: parseFloat(amount),
      date,
      category,
      department,
      paymentMethod,
      description: description.trim() || `${merchant} expense`,
      taxDeductible,
      isRecurring,
      status: 'approved',
      aiConfidence: 100,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Record Manual Expense</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Merchant / Vendor Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. GitHub Enterprise, Slack, Staples"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Cloud & Software">Cloud & Software</option>
                <option value="Payroll & Contractors">Payroll & Contractors</option>
                <option value="Office & Hardware">Office & Hardware</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Travel & Meals">Travel & Meals</option>
                <option value="Legal & Professional">Legal & Professional</option>
                <option value="Utilities & Facilities">Utilities & Facilities</option>
                <option value="Inventory & Supplies">Inventory & Supplies</option>
                <option value="Financial & Banking">Financial & Banking</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Executive & G&A">Executive & G&A</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Corporate Card">Corporate Card</option>
                <option value="ACH Wire">ACH Wire</option>
                <option value="Direct Debit">Direct Debit</option>
                <option value="Reimbursement">Reimbursement</option>
              </select>
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxDeductible}
                  onChange={(e) => setTaxDeductible(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">Tax Deductible</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">Monthly Recurring (SaaS/Sub)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Business Purpose</label>
            <input
              type="text"
              placeholder="e.g. Annual cloud backup subscription for client cluster"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
            >
              Save to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
