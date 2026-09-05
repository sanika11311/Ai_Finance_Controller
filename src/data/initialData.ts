import { BusinessProfile, BudgetTarget, Expense, HistoricalMonthData } from '../types';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Beacon Cloud Solutions',
  industry: 'B2B Software & Managed IT',
  currentCashBalance: 285400,
  monthlyRevenue: 74500,
  revenueGrowthMoM: 5.2,
  taxRate: 21,
  fiscalYear: 'FY 2026',
};

export const INITIAL_BUDGETS: BudgetTarget[] = [
  {
    id: 'b-1',
    category: 'Payroll & Contractors',
    monthlyLimit: 32000,
    spent: 31200,
    alertThreshold: 90,
    department: 'Engineering',
    notes: 'Core dev squad + 2 contracted cloud DevOps specialists',
  },
  {
    id: 'b-2',
    category: 'Cloud & Software',
    monthlyLimit: 12500,
    spent: 14120,
    alertThreshold: 85,
    department: 'Engineering',
    notes: 'AWS cluster, Snowflake, Datadog & developer SaaS stack',
  },
  {
    id: 'b-3',
    category: 'Marketing & Growth',
    monthlyLimit: 8000,
    spent: 6450,
    alertThreshold: 85,
    department: 'Sales & Marketing',
    notes: 'Google Search Ads, LinkedIn B2B campaign, Content SEO',
  },
  {
    id: 'b-4',
    category: 'Office & Hardware',
    monthlyLimit: 3500,
    spent: 2180,
    alertThreshold: 80,
    department: 'Operations',
    notes: 'Coworking flex passes, developer monitors and peripherals',
  },
  {
    id: 'b-5',
    category: 'Travel & Meals',
    monthlyLimit: 3000,
    spent: 2890,
    alertThreshold: 75,
    department: 'Sales & Marketing',
    notes: 'Quarterly client on-site workshops and team sprint meals',
  },
  {
    id: 'b-6',
    category: 'Legal & Professional',
    monthlyLimit: 2500,
    spent: 1800,
    alertThreshold: 80,
    department: 'Executive & G&A',
    notes: 'CPA retainer and SOC2 compliance legal advisory',
  },
  {
    id: 'b-7',
    category: 'Financial & Banking',
    monthlyLimit: 1800,
    spent: 1420,
    alertThreshold: 85,
    department: 'Executive & G&A',
    notes: 'Stripe merchant processing fees and Mercury wire fees',
  },
  {
    id: 'b-8',
    category: 'Utilities & Facilities',
    monthlyLimit: 1200,
    spent: 980,
    alertThreshold: 80,
    department: 'Operations',
    notes: 'High-speed fiber uplinks, remote VoIP phone systems',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    date: '2026-09-02',
    merchant: 'Amazon Web Services (AWS)',
    amount: 6420.50,
    category: 'Cloud & Software',
    department: 'Engineering',
    paymentMethod: 'Corporate Card',
    status: 'flagged',
    taxDeductible: true,
    taxAmount: 0,
    description: 'EC2 & RDS Multi-region Aurora compute cluster - Sep invoice',
    receiptUrlOrSnippet: 'INV-US-EAST-99201: AWS Cloud Services $6,420.50 ($1,840.00 above 3-month trailing avg)',
    isRecurring: true,
    anomalyDetected: 'Cost surge: 40.2% increase over trailing 3-month baseline ($4,580/mo). Unattached idle snapshot volume suspected.',
    aiConfidence: 94,
  },
  {
    id: 'exp-102',
    date: '2026-09-01',
    merchant: 'Gusto Payroll Systems',
    amount: 28400.00,
    category: 'Payroll & Contractors',
    department: 'Operations',
    paymentMethod: 'ACH Wire',
    status: 'approved',
    taxDeductible: true,
    description: 'Bi-monthly salary run for 8 FTE engineers & designers',
    receiptUrlOrSnippet: 'Gusto Payroll Summary Run ID #88129',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 99,
  },
  {
    id: 'exp-103',
    date: '2026-09-03',
    merchant: 'Figma Enterprise',
    amount: 480.00,
    category: 'Cloud & Software',
    department: 'Engineering',
    paymentMethod: 'Corporate Card',
    status: 'flagged',
    taxDeductible: true,
    description: 'Figma Organization seats annual renewal',
    receiptUrlOrSnippet: 'FIGMA-88412: 8 Design editor seats',
    isRecurring: true,
    anomalyDetected: 'Potential Duplicate: Same amount ($480.00) charged on both Card ending #4182 and Card #9021 within 48 hours.',
    aiConfidence: 91,
  },
  {
    id: 'exp-104',
    date: '2026-09-02',
    merchant: 'Google Ads (Alphabet)',
    amount: 3250.00,
    category: 'Marketing & Growth',
    department: 'Sales & Marketing',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'High-intent B2B keyword campaign - SaaS migration search',
    receiptUrlOrSnippet: 'GADS-9912040-US',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 98,
  },
  {
    id: 'exp-105',
    date: '2026-08-30',
    merchant: 'LinkedIn Campaign Manager',
    amount: 1850.00,
    category: 'Marketing & Growth',
    department: 'Sales & Marketing',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'Sponsored updates targeting CTOs and VPs of Infrastructure',
    receiptUrlOrSnippet: 'LN-INVOICE-77312',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 96,
  },
  {
    id: 'exp-106',
    date: '2026-08-29',
    merchant: 'WeWork Global Access',
    amount: 1450.00,
    category: 'Office & Hardware',
    department: 'Operations',
    paymentMethod: 'Direct Debit',
    status: 'approved',
    taxDeductible: true,
    description: 'Monthly unlimited co-working pass for distributed team',
    receiptUrlOrSnippet: 'WW-0921-MEMBERSHIP',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 99,
  },
  {
    id: 'exp-107',
    date: '2026-08-28',
    merchant: 'Datadog APM & Logs',
    amount: 2190.00,
    category: 'Cloud & Software',
    department: 'Engineering',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'Infrastructure telemetry, synthetic monitoring & tracing',
    receiptUrlOrSnippet: 'DD-AUG-26-88',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 97,
  },
  {
    id: 'exp-108',
    date: '2026-08-27',
    merchant: 'Steakhouse Bistro & Lounge',
    amount: 685.40,
    category: 'Travel & Meals',
    department: 'Sales & Marketing',
    paymentMethod: 'Corporate Card',
    status: 'flagged',
    taxDeductible: false,
    description: 'Enterprise prospect dinner with 4 attendees',
    receiptUrlOrSnippet: 'Check #442: $685.40 (Alcohol portion not itemized)',
    isRecurring: false,
    anomalyDetected: 'Policy Compliance Alert: Exceeds company $125/person meal limit and receipt lacks breakdown of non-deductible entertainment.',
    aiConfidence: 89,
  },
  {
    id: 'exp-109',
    date: '2026-08-25',
    merchant: 'Silicon Valley Legal LLP',
    amount: 1800.00,
    category: 'Legal & Professional',
    department: 'Executive & G&A',
    paymentMethod: 'ACH Wire',
    status: 'approved',
    taxDeductible: true,
    description: 'SaaS Master Service Agreement (MSA) template reviews',
    receiptUrlOrSnippet: 'SVL-INV-2026-44',
    isRecurring: false,
    anomalyDetected: null,
    aiConfidence: 99,
  },
  {
    id: 'exp-110',
    date: '2026-08-22',
    merchant: 'Apple Store Online',
    amount: 2499.00,
    category: 'Office & Hardware',
    department: 'Engineering',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'MacBook Pro M4 36GB RAM for new Senior Backend Lead',
    receiptUrlOrSnippet: 'APL-R9924-W77',
    isRecurring: false,
    anomalyDetected: null,
    aiConfidence: 98,
  },
  {
    id: 'exp-111',
    date: '2026-08-20',
    merchant: 'Stripe Merchant Processing',
    amount: 1420.00,
    category: 'Financial & Banking',
    department: 'Executive & G&A',
    paymentMethod: 'Direct Debit',
    status: 'approved',
    taxDeductible: true,
    description: 'Credit card interchange & platform processing charges',
    receiptUrlOrSnippet: 'STRIPE-FEES-AUG26',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 100,
  },
  {
    id: 'exp-112',
    date: '2026-08-18',
    merchant: 'Delta Air Lines',
    amount: 840.20,
    category: 'Travel & Meals',
    department: 'Sales & Marketing',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'Round-trip flight SFO -> ORD for Cloud Summit Expo',
    receiptUrlOrSnippet: 'DL-0062-88194',
    isRecurring: false,
    anomalyDetected: null,
    aiConfidence: 96,
  },
  {
    id: 'exp-113',
    date: '2026-08-15',
    merchant: 'Notion Labs Inc',
    amount: 240.00,
    category: 'Cloud & Software',
    department: 'Operations',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'Team workspace and AI knowledge base seats',
    receiptUrlOrSnippet: 'NTN-INV-44102',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 99,
  },
  {
    id: 'exp-114',
    date: '2026-08-12',
    merchant: 'Zoom Video Communications',
    amount: 199.90,
    category: 'Cloud & Software',
    department: 'Operations',
    paymentMethod: 'Corporate Card',
    status: 'approved',
    taxDeductible: true,
    description: 'Business 10-host package with cloud recording',
    receiptUrlOrSnippet: 'ZM-88310-A',
    isRecurring: true,
    anomalyDetected: null,
    aiConfidence: 98,
  }
];

export const HISTORICAL_DATA: HistoricalMonthData[] = [
  {
    month: 'Apr 2026',
    revenue: 62000,
    expenses: 53100,
    netProfit: 8900,
    endingCash: 248000,
  },
  {
    month: 'May 2026',
    revenue: 65400,
    expenses: 55200,
    netProfit: 10200,
    endingCash: 258200,
  },
  {
    month: 'Jun 2026',
    revenue: 68100,
    expenses: 56900,
    netProfit: 11200,
    endingCash: 269400,
  },
  {
    month: 'Jul 2026',
    revenue: 71200,
    expenses: 60400,
    netProfit: 10800,
    endingCash: 280200,
  },
  {
    month: 'Aug 2026',
    revenue: 73000,
    expenses: 62100,
    netProfit: 10900,
    endingCash: 291100,
  },
  {
    month: 'Sep 2026 (MTD)',
    revenue: 74500,
    expenses: 61040,
    netProfit: 13460,
    endingCash: 285400,
  },
];

export const SAMPLE_RECEIPT_SNIPPETS = [
  {
    title: 'Cloudflare Enterprise CDN & Workers',
    snippet: `CLOUDFLARE, INC.
101 Townsend St, San Francisco, CA 94107
Invoice #: CF-2026-98104
Date: September 03, 2026
Customer: Beacon Cloud Solutions

Description:
1. Cloudflare Enterprise Workers Pro Bundle: $350.00
2. Advanced DDoS Shield & Rate Limiting: $150.00
3. SSL/TLS Certificate Wildcard Managed: $50.00

Subtotal: $550.00
State Tax (8.5%): $46.75
Total Paid: $596.75
Payment: Visa ending 4182
Status: Paid in full`,
  },
  {
    title: 'Dell Technologies UltraSharp Monitors',
    snippet: `DELL DIRECT BUSINESS
Order #US-99120419
Date: September 02, 2026
Sold To: Beacon Cloud Solutions Inc.

Items:
- 2x Dell UltraSharp 32" 4K USB-C Hub Monitor (U3223QE) @ $720.00 = $1,440.00
- 2x Dual Monitor Arm Mounts @ $110.00 = $220.00
Shipping: FREE Expedited

Subtotal: $1,660.00
Sales Tax: $141.10
Total Charged: $1,801.10
Payment Method: Corporate Amex - 9021`,
  },
  {
    title: 'Executive Client Dinner at Morton Steakhouse',
    snippet: `MORTON'S THE STEAKHOUSE
Table 14 - Guests: 5
Date: Sep 01, 2026 8:45 PM
Server: David M.

4x Prime Bone-In Ribeye: $340.00
1x Chilean Sea Bass: $68.00
2x Bottles Caymus Cabernet: $320.00
Sides & Dessert Sampler: $95.00
Tax: $69.95
Gratuity (20%): $164.60
TOTAL: $1,057.55
Card: Corporate Visa ending 4182`,
  },
];
