import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/ai/scan-receipt", async (req, res) => {
  try {
    const { receiptText, imageBase64, mimeType } = req.body;

    if (!receiptText && !imageBase64) {
      return res.status(400).json({ error: "Missing receipt text or image data." });
    }

    if (!apiKey) {
      const mockParsed = parseReceiptFallback(receiptText || "Sample receipt text");
      return res.json({ result: mockParsed, simulated: true });
    }

    const systemPrompt = `You are a certified AI Financial Controller and auditor for small businesses.
Your task is to analyze receipts or invoices with extreme precision.
Extract:
- merchant (string)
- amount (number)
- date (YYYY-MM-DD format, or best guess if year is missing)
- category (MUST BE ONE OF: "Cloud & Software", "Payroll & Contractors", "Office & Hardware", "Marketing & Growth", "Travel & Meals", "Legal & Professional", "Utilities & Facilities", "Inventory & Supplies", "Financial & Banking")
- department (MUST BE ONE OF: "Engineering", "Sales & Marketing", "Operations", "Executive & G&A", "Customer Support")
- taxDeductible (boolean: meals are 50% or non-deductible if entertainment; software/hardware/cloud/legal are fully deductible business expenses)
- taxAmount (number, if broken down)
- description (concise description of goods/services purchased)
- paymentMethod (one of: "Corporate Card", "ACH Wire", "Direct Debit", "Reimbursement")
- policyAnomaly (string if detected, e.g. meal exceeds $100/person, suspicious price surge, missing itemization, weekend personal expense; or null if compliant)
- aiConfidence (integer 0-100)`;

    let contents: any;
    if (imageBase64) {
      contents = {
        parts: [
          {
            inlineData: {
              data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
              mimeType: mimeType || "image/jpeg",
            },
          },
          { text: "Analyze this receipt image for accounting ledger ingestion." },
        ],
      };
    } else {
      contents = `Analyze this receipt text snippet: \n\n${receiptText}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            department: { type: Type.STRING },
            taxDeductible: { type: Type.BOOLEAN },
            taxAmount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            policyAnomaly: { type: Type.STRING, nullable: true },
            aiConfidence: { type: Type.INTEGER },
          },
          required: [
            "merchant",
            "amount",
            "date",
            "category",
            "department",
            "taxDeductible",
            "description",
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({ result: parsedJson, simulated: false });
  } catch (error: any) {
    console.error("Error scanning receipt with Gemini:", error);
    const mockParsed = parseReceiptFallback(req.body.receiptText || "Vendor Receipt");
    return res.json({ result: mockParsed, simulated: true, note: error.message });
  }
});

app.post("/api/ai/audit-ledger", async (req, res) => {
  try {
    const { expenses, budgets, cashBalance, monthlyRevenue } = req.body;

    if (!apiKey) {
      const fallbackAudit = generateFallbackAudit(expenses, budgets, cashBalance, monthlyRevenue);
      return res.json({ audit: fallbackAudit, simulated: true });
    }

    const prompt = `You are a strategic AI Chief Financial Officer (CFO) and Financial Controller.
Analyze this small business financial ledger:
- Current Cash Balance: $${cashBalance}
- Monthly Revenue: $${monthlyRevenue}
- Active Budgets: ${JSON.stringify(budgets)}
- Recent Expenses (${expenses?.length || 0} records): ${JSON.stringify(expenses?.slice(0, 25))}

Perform a comprehensive controller audit:
1. Health Score (0-100) assessing runway, variance discipline, and cash efficiency.
2. Executive Summary (2-3 concise, high-impact paragraphs).
3. Monthly Run Rate estimate and runway months.
4. Top Spend Drivers breakdown.
5. Potential Tax Deductions estimate based on business expenses.
6. Key Recommendations with estimated monthly dollar savings.
7. Flagged compliance or anomaly items.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER },
            executiveSummary: { type: Type.STRING },
            monthlyRunRate: { type: Type.NUMBER },
            estimatedRunwayMonths: { type: Type.NUMBER },
            topSpendDrivers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER },
                },
                required: ["category", "amount", "percentage"],
              },
            },
            potentialTaxDeductions: { type: Type.NUMBER },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.STRING },
                  title: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  action: { type: Type.STRING },
                  estimatedSavings: { type: Type.NUMBER },
                },
                required: ["priority", "title", "impact", "action", "estimatedSavings"],
              },
            },
            complianceFlagsCount: { type: Type.INTEGER },
          },
          required: [
            "healthScore",
            "executiveSummary",
            "monthlyRunRate",
            "estimatedRunwayMonths",
            "topSpendDrivers",
            "potentialTaxDeductions",
            "recommendations",
          ],
        },
      },
    });

    const auditData = JSON.parse(response.text || "{}");
    return res.json({ audit: auditData, simulated: false });
  } catch (error: any) {
    console.error("Error in audit-ledger:", error);
    const fallbackAudit = generateFallbackAudit(
      req.body.expenses,
      req.body.budgets,
      req.body.cashBalance,
      req.body.monthlyRevenue
    );
    return res.json({ audit: fallbackAudit, simulated: true, note: error.message });
  }
});

app.post("/api/ai/forecast-analysis", async (req, res) => {
  try {
    const { scenarioName, revenueGrowthPct, expenseInflationPct, headcountChange, projections, cashBalance } = req.body;

    if (!apiKey) {
      return res.json({
        analysis: generateFallbackForecastAnalysis(scenarioName, revenueGrowthPct, expenseInflationPct, projections),
        simulated: true,
      });
    }

    const prompt = `As the AI Financial Controller, evaluate this forward 12-month budget & runway scenario:
- Scenario Name: ${scenarioName}
- Target Revenue Growth: ${revenueGrowthPct}% MoM
- OpEx Inflation/Optimization: ${expenseInflationPct}%
- Net Headcount Change: ${headcountChange} staff
- Starting Cash: $${cashBalance}
- 12-Month Projections Sample:
  - Month 1: Revenue $${projections?.[0]?.projectedRevenue}, OpEx $${projections?.[0]?.projectedOpex}, Ending Cash $${projections?.[0]?.projectedCashEnding}
  - Month 6: Revenue $${projections?.[5]?.projectedRevenue}, OpEx $${projections?.[5]?.projectedOpex}, Ending Cash $${projections?.[5]?.projectedCashEnding}
  - Month 12: Revenue $${projections?.[11]?.projectedRevenue}, OpEx $${projections?.[11]?.projectedOpex}, Ending Cash $${projections?.[11]?.projectedCashEnding}

Provide:
1. Runway Verdict (Is cash self-sustaining, or what month is the cash inflection point?)
2. 3 Strategic Levers to optimize margin.
3. Controller Risk Factors.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            runwayVerdict: { type: Type.STRING },
            sustainabilityStatus: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            strategicLevers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            cfoSummary: { type: Type.STRING },
          },
          required: ["runwayVerdict", "sustainabilityStatus", "riskLevel", "strategicLevers", "cfoSummary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json({ analysis: result, simulated: false });
  } catch (error: any) {
    console.error("Error in forecast-analysis:", error);
    return res.json({
      analysis: generateFallbackForecastAnalysis(
        req.body.scenarioName,
        req.body.revenueGrowthPct,
        req.body.expenseInflationPct,
        req.body.projections
      ),
      simulated: true,
    });
  }
});

app.post("/api/ai/executive-report", async (req, res) => {
  try {
    const { businessProfile, expenses, budgets, historical } = req.body;

    if (!apiKey) {
      return res.json({
        report: generateFallbackExecutiveReport(businessProfile, expenses, budgets),
        simulated: true,
      });
    }

    const prompt = `You are the Fractional Chief Financial Officer / AI Finance Controller for "${businessProfile.name}".
Generate an official Executive Financial Briefing & Controller Memo for the executive leadership and board.

Data snapshot:
- Business: ${businessProfile.name} (${businessProfile.industry})
- Current Cash Balance: $${businessProfile.currentCashBalance}
- Monthly Recurring Revenue: $${businessProfile.monthlyRevenue} (MoM Growth: ${businessProfile.revenueGrowthMoM}%)
- Total Expenses Tracked: $${expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0).toFixed(2)}
- Budgets: ${JSON.stringify(budgets)}

Create:
1. Executive Memo Title
2. Fiscal Period Overview
3. Revenue vs OpEx commentary
4. Key Variance Highlights (which departments exceeded budget and why)
5. Cash Flow & Runway Health Assessment
6. Controller Action Plan for next month
7. Audit & Tax Optimization Checklist`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportTitle: { type: Type.STRING },
            period: { type: Type.STRING },
            executiveOverview: { type: Type.STRING },
            revenueAnalysis: { type: Type.STRING },
            opexVarianceNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  variance: { type: Type.STRING },
                  controllerNote: { type: Type.STRING },
                },
                required: ["category", "variance", "controllerNote"],
              },
            },
            cashFlowHealth: { type: Type.STRING },
            controllerActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            taxOptimizationNotes: { type: Type.STRING },
          },
          required: [
            "reportTitle",
            "period",
            "executiveOverview",
            "revenueAnalysis",
            "opexVarianceNotes",
            "cashFlowHealth",
            "controllerActionPlan",
            "taxOptimizationNotes",
          ],
        },
      },
    });

    const report = JSON.parse(response.text || "{}");
    return res.json({ report, simulated: false });
  } catch (error: any) {
    console.error("Error generating executive report:", error);
    return res.json({
      report: generateFallbackExecutiveReport(req.body.businessProfile, req.body.expenses, req.body.budgets),
      simulated: true,
    });
  }
});

app.post("/api/ai/chat-copilot", async (req, res) => {
  try {
    const { query, conversationHistory, context } = req.body;

    if (!apiKey) {
      return res.json({
        reply: generateFallbackChatResponse(query, context),
        simulated: true,
      });
    }

    const systemInstruction = `You are the AI Finance Controller for "${context?.businessName || "the small business"}".
You have direct, real-time access to the company's ledger, budgets, cash balance, and expense records.
Live Financial Context:
- Cash on hand: $${context?.cashBalance || 285400}
- Monthly Revenue: $${context?.monthlyRevenue || 74500}
- Total MTD OpEx: $${context?.totalExpenses || 61040}
- Runway: ~${context?.runwayMonths || 14.5} months
- Overbudget Categories: ${context?.overbudgetCategories?.join(", ") || "Cloud & Software ($1,620 over)"}
- Flagged Ledger Items: ${context?.flaggedCount || 3} items (AWS cost surge, Duplicate Figma charge, High steakhouse dinner)

Tone: Highly professional, quantitative, direct, actionable, like an elite enterprise CFO / Financial Controller.
Cite specific dollar figures and recommendations in every response. Avoid generic fluff.`;

    const chat = ai.chats.create({
      model: "gemini-3.8-flash",
      config: {
        systemInstruction,
      },
    });

    const promptMessage = `User question: "${query}"\n\nPlease answer accurately using the real-time financial figures above.`;
    const response = await chat.sendMessage({ message: promptMessage });

    return res.json({ reply: response.text || "No response generated.", simulated: false });
  } catch (error: any) {
    console.error("Error in chat-copilot:", error);
    return res.json({
      reply: generateFallbackChatResponse(req.body.query, req.body.context),
      simulated: true,
    });
  }
});

function parseReceiptFallback(text: string) {
  const lower = text.toLowerCase();
  let merchant = "Vendor Payment";
  let amount = 149.99;
  let category = "Office & Hardware";
  let department = "Operations";
  let taxDeductible = true;
  let taxAmount = 12.5;
  let anomaly: string | null = null;

  if (lower.includes("aws") || lower.includes("amazon web services")) {
    merchant = "Amazon Web Services (AWS)";
    amount = 6420.5;
    category = "Cloud & Software";
    department = "Engineering";
    anomaly = "Cost surge: 40% higher than trailing 3-month average.";
  } else if (lower.includes("cloudflare")) {
    merchant = "Cloudflare, Inc.";
    amount = 596.75;
    category = "Cloud & Software";
    department = "Engineering";
    taxAmount = 46.75;
  } else if (lower.includes("dell")) {
    merchant = "Dell Technologies";
    amount = 1801.1;
    category = "Office & Hardware";
    department = "Engineering";
    taxAmount = 141.1;
  } else if (lower.includes("steak") || lower.includes("restaurant") || lower.includes("morton")) {
    merchant = "Morton's Steakhouse";
    amount = 1057.55;
    category = "Travel & Meals";
    department = "Sales & Marketing";
    taxDeductible = false;
    anomaly = "Meal exceeds $100/person threshold ($211.51/guest). Requires executive approval.";
  }

  return {
    merchant,
    amount,
    date: new Date().toISOString().split("T")[0],
    category,
    department,
    taxDeductible,
    taxAmount,
    description: `Auto-extracted from receipt text: ${merchant}`,
    paymentMethod: "Corporate Card",
    policyAnomaly: anomaly,
    aiConfidence: 93,
  };
}

function generateFallbackAudit(expenses: any[], budgets: any[], cash: number, rev: number) {
  const totalSpend = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const net = (rev || 74500) - totalSpend;
  const burn = net < 0 ? Math.abs(net) : 0;
  const runway = burn > 0 ? Number(((cash || 285000) / burn).toFixed(1)) : 999;

  return {
    healthScore: 86,
    executiveSummary: `Beacon Cloud Solutions displays solid operational stability with an operating profit margin of ~18% and $${(cash || 285400).toLocaleString()} in liquid cash reserves. However, cloud infrastructure spending in the Engineering department is currently 13% over target, driven by an unoptimized AWS RDS compute spike. Reviewing idle snapshot storage and consolidating software licenses represents the immediate highest-ROI cash lever.`,
    monthlyRunRate: totalSpend,
    estimatedRunwayMonths: runway > 50 ? 24 : runway,
    topSpendDrivers: [
      { category: "Payroll & Contractors", amount: 31200, percentage: 51.1 },
      { category: "Cloud & Software", amount: 14120, percentage: 23.1 },
      { category: "Marketing & Growth", amount: 6450, percentage: 10.6 },
      { category: "Travel & Meals", amount: 2890, percentage: 4.7 },
      { category: "Office & Hardware", amount: 2180, percentage: 3.6 },
    ],
    potentialTaxDeductions: Math.round(totalSpend * 0.94),
    recommendations: [
      {
        priority: "critical",
        title: "Audit AWS Idle RDS & Unattached EBS Volumes",
        impact: "Reduces monthly Cloud OpEx by an estimated $1,250",
        action: "Apply AWS Compute Optimizer recommendations and commit to 1-year Savings Plans.",
        estimatedSavings: 1250,
      },
      {
        priority: "high",
        title: "Consolidate Duplicate SaaS Licenses",
        impact: "Stops recurring duplicate subscriptions across Figma & Notion seats",
        action: "Consolidate under centralized SSO and eliminate 4 inactive developer licenses.",
        estimatedSavings: 420,
      },
      {
        priority: "medium",
        title: "Enforce $100/Guest Client Dinner Policy",
        impact: "Improves tax deduction eligibility and curbs entertainment creep",
        action: "Require itemized meal receipts separating alcohol from business meal subtotal.",
        estimatedSavings: 380,
      },
    ],
    complianceFlagsCount: 3,
  };
}

function generateFallbackForecastAnalysis(
  name: string,
  revGrowth: number,
  expenseGrowth: number,
  projections: any[]
) {
  const endingCash = projections?.[projections.length - 1]?.projectedCashEnding || 340000;
  return {
    runwayVerdict:
      endingCash > 250000
        ? "Cash flow positive trajectory with expanding reserves over 12 months."
        : "Burn rate manageable; maintain disciplined hiring to prevent cash compression.",
    sustainabilityStatus: "Self-Sustaining",
    riskLevel: revGrowth >= 5 ? "Low Risk" : "Moderate Risk",
    strategicLevers: [
      "Maintain gross margin above 72% by bundling cloud maintenance into client retainer tiers.",
      "Cap discretionary marketing acquisition cost (CAC) at $420 per qualified demo.",
      "Pre-fund quarterly AWS compute with reserved instances to secure 28% discount.",
    ],
    riskFactors: [
      "MoM client churn exceeding 2.8% would lower forecasted cash buffer by $34,000 by Q4.",
      "Inflationary pressure on senior engineering contractor hourly rates.",
    ],
    cfoSummary: `Under the ${name || "Current"} model with ${revGrowth}% monthly revenue expansion and ${expenseGrowth}% expense control, Beacon Cloud Solutions projects net cash reserves expanding to $${Math.round(endingCash).toLocaleString()} by month 12.`,
  };
}

function generateFallbackExecutiveReport(profile: any, expenses: any[], budgets: any[]) {
  return {
    reportTitle: `Monthly Financial Controller Briefing - ${profile?.fiscalYear || "FY 2026"}`,
    period: "September 2026",
    executiveOverview: `${profile?.name || "Beacon Cloud Solutions"} generated $${(profile?.monthlyRevenue || 74500).toLocaleString()} in revenue with total operating expenses of $${expenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}. Net cash flow remains favorable, supporting continued headcount investment while preserving a strong balance sheet.`,
    revenueAnalysis: `Revenue expanded at ${profile?.revenueGrowthMoM || 5.2}% MoM driven by new enterprise contract onboardings. Accounts receivable collection cycle averages 18.4 days (well within the standard 30-day term).`,
    opexVarianceNotes: [
      {
        category: "Cloud & Software",
        variance: "+$1,620 (+13.0%)",
        controllerNote: "Over budget due to Aurora RDS cluster failover test and Datadog custom metrics ingestion.",
      },
      {
        category: "Payroll & Contractors",
        variance: "-$800 (-2.5%)",
        controllerNote: "Favorable variance resulting from delayed contractor start date.",
      },
      {
        category: "Marketing & Growth",
        variance: "-$1,550 (-19.4%)",
        controllerNote: "Favorable variance; paid ad campaigns optimized for higher conversion efficiency.",
      },
    ],
    cashFlowHealth: `Cash balance stands at $${(profile?.currentCashBalance || 285400).toLocaleString()}. Operational cash burn is negative (profitable), generating positive free cash flow.`,
    controllerActionPlan: [
      "Schedule AWS Well-Architected review with Engineering lead by Friday.",
      "Dispute duplicate Figma charge with Amex merchant support.",
      "Update employee expense policy handbook to mandate itemized meal receipts.",
      "Review CPA quarter-end estimated tax safe-harbor payment.",
    ],
    taxOptimizationNotes:
      "Section 179 expensing applicable for recent MacBook Pro hardware acquisition. Estimated 94% of OpEx is ordinary business deductible.",
  };
}

function generateFallbackChatResponse(query: string, context: any) {
  const q = (query || "").toLowerCase();
  if (q.includes("hire") || q.includes("afford") || q.includes("employee") || q.includes("engineer")) {
    return `Based on our current monthly revenue ($${(context?.monthlyRevenue || 74500).toLocaleString()}) and current cash balance ($${(context?.cashBalance || 285400).toLocaleString()}), hiring 2 mid-level software engineers at ~$11,000/month combined would increase monthly payroll from $31,200 to $42,200. This would compress our net monthly profit margin from +$13,460 to +$2,460. The business can safely afford this without burning cash, provided monthly revenue continues to grow at >3.5% MoM.`;
  }
  if (q.includes("burn") || q.includes("runway")) {
    return `Our current operational runway is self-sustaining (positive net cash flow of ~$13,460/month). Total cash in bank is $${(context?.cashBalance || 285400).toLocaleString()}. In a zero-revenue worst-case stress test, our existing liquid cash covers ~4.7 months of full payroll and infrastructure expenses.`;
  }
  if (q.includes("over budget") || q.includes("cloud") || q.includes("spike") || q.includes("aws")) {
    return `The only department currently over budget is Cloud & Software ($14,120 spent vs $12,500 target, a 13.0% overrun). The primary driver is the September AWS invoice ($6,420.50), which surged 40.2% above baseline due to unattached RDS snapshots and cross-region data transfer fees.`;
  }
  if (q.includes("save") || q.includes("reduce") || q.includes("cut")) {
    return `Top 3 immediate cash-saving recommendations from the Controller:
1. Optimize AWS infrastructure (delete idle test environments & apply 1-yr compute savings plan): Save ~$1,250/mo.
2. Resolve duplicate & unused SaaS seats (Figma duplicate charge + 4 inactive licenses): Save ~$420/mo.
3. Enforce business travel and client dinner meal caps ($100/person): Save ~$380/mo.
Total monthly savings potential: $2,050/mo ($24,600 annualized).`;
  }
  return `As your AI Finance Controller, I reviewed our active ledger ($${(context?.totalExpenses || 61040).toLocaleString()} MTD expenses across 14 transactions). Cash balance is healthy at $${(context?.cashBalance || 285400).toLocaleString()}. Our key priority is remediating the 3 flagged ledger items (AWS spike, duplicate Figma renewal, and unitemized dinner) to ensure tax compliance and keep OpEx within quarterly targets.`;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Finance Controller Server running on port ${PORT}`);
  });
}

startServer();
