import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Receipt,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Expense, ExpenseCategory, Department } from '../types';
import { SAMPLE_RECEIPT_SNIPPETS } from '../data/initialData';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'upload' | 'samples'>('samples');
  const [receiptText, setReceiptText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extracted, setExtracted] = useState<{
    merchant: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
    department: Department;
    taxDeductible: boolean;
    taxAmount?: number;
    description: string;
    paymentMethod: 'Corporate Card' | 'ACH Wire' | 'Direct Debit' | 'Reimbursement';
    policyAnomaly?: string | null;
    aiConfidence?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreview(result);
      setReceiptText(`[Uploaded Image: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (snippetText: string) => {
    setReceiptText(snippetText);
    setImageBase64(null);
    setImagePreview(null);
    setActiveTab('text');
  };

  const runAiExtraction = async () => {
    if (!receiptText.trim() && !imageBase64) {
      setError('Please provide receipt text, select a sample, or upload an image.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptText,
          imageBase64,
          mimeType: 'image/jpeg',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process receipt.');
      }

      const data = await res.json();
      const r = data.result;

      setExtracted({
        merchant: r.merchant || 'Unknown Vendor',
        amount: Number(r.amount) || 0,
        date: r.date || new Date().toISOString().split('T')[0],
        category: (r.category as ExpenseCategory) || 'Office & Hardware',
        department: (r.department as Department) || 'Operations',
        taxDeductible: Boolean(r.taxDeductible),
        taxAmount: r.taxAmount ? Number(r.taxAmount) : undefined,
        description: r.description || `Scanned receipt from ${r.merchant}`,
        paymentMethod: (r.paymentMethod as any) || 'Corporate Card',
        policyAnomaly: r.policyAnomaly || null,
        aiConfidence: r.aiConfidence || 92,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndSave = () => {
    if (!extracted) return;

    onAddExpense({
      merchant: extracted.merchant,
      amount: extracted.amount,
      date: extracted.date,
      category: extracted.category,
      department: extracted.department,
      taxDeductible: extracted.taxDeductible,
      taxAmount: extracted.taxAmount,
      description: extracted.description,
      paymentMethod: extracted.paymentMethod,
      status: extracted.policyAnomaly ? 'flagged' : 'approved',
      anomalyDetected: extracted.policyAnomaly,
      aiConfidence: extracted.aiConfidence,
      receiptUrlOrSnippet: receiptText ? receiptText.slice(0, 150) + '...' : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Receipt & Invoice Ingestor</h2>
              <p className="text-xs text-slate-500">Automates vendor extraction, tax categorization & policy compliance.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          
          <div className="flex rounded-xl bg-slate-100/90 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('samples')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'samples' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Sample Small Business Invoices
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Paste Receipt Text
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Upload Receipt Image
            </button>
          </div>

          {activeTab === 'samples' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 font-medium">Select a realistic small business invoice to test the AI Controller:</p>
              <div className="grid gap-2">
                {SAMPLE_RECEIPT_SNIPPETS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.snippet)}
                    className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                        {sample.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-mono">
                      {sample.snippet.replace(/\n/g, ' • ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Receipt Raw Text, Invoice Details or Email Confirmation:
              </label>
              <textarea
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                rows={5}
                placeholder="Paste vendor receipt details (e.g. AWS Invoice #8812, Total $420.00, Date 2026-09-02...)"
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 text-slate-800"
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload Receipt Image (PNG, JPG):
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-file-input"
                />
                <label htmlFor="receipt-file-input" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Click to upload or drag & drop</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Scans paper receipts, invoices, or mobile photos</span>
                </label>
              </div>

              {imagePreview && (
                <div className="mt-3 p-2 bg-slate-100 rounded-lg flex items-center space-x-3">
                  <img src={imagePreview} alt="Receipt preview" className="w-12 h-12 object-cover rounded-md" />
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold block">Receipt image attached</span>
                    <span className="text-slate-500">Ready for multimodal optical analysis</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              onClick={runAiExtraction}
              disabled={loading || (!receiptText.trim() && !imageBase64)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Financial Controller is auditing receipt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract & Audit with AI Controller</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {extracted && (
            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Extraction & Compliance Check Succeeded</span>
                </div>
                {extracted.aiConfidence && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {extracted.aiConfidence}% AI Confidence
                  </span>
                )}
              </div>

              {extracted.policyAnomaly && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-xs text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Controller Policy Flag:</span>
                    <span>{extracted.policyAnomaly}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block">Merchant / Vendor</label>
                  <input
                    type="text"
                    value={extracted.merchant}
                    onChange={(e) => setExtracted({ ...extracted, merchant: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={extracted.amount}
                    onChange={(e) => setExtracted({ ...extracted, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block">Date</label>
                  <input
                    type="date"
                    value={extracted.date}
                    onChange={(e) => setExtracted({ ...extracted, date: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block">Expense Category</label>
                  <select
                    value={extracted.category}
                    onChange={(e) => setExtracted({ ...extracted, category: e.target.value as ExpenseCategory })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
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
                  <label className="text-[11px] text-slate-500 block">Department</label>
                  <select
                    value={extracted.department}
                    onChange={(e) => setExtracted({ ...extracted, department: e.target.value as Department })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive & G&A">Executive & G&A</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block">Tax Deductibility</label>
                  <div className="mt-1 flex items-center space-x-2 h-8">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extracted.taxDeductible}
                        onChange={(e) => setExtracted({ ...extracted, taxDeductible: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-700 font-medium">Qualifies as Tax Deductible</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block">Itemization & Description</label>
                <input
                  type="text"
                  value={extracted.description}
                  onChange={(e) => setExtracted({ ...extracted, description: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setExtracted(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApproveAndSave}
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ingest into General Ledger</span>
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center">
            <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
            AI Finance Controller enforces IRS business expense substantiation standards.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
