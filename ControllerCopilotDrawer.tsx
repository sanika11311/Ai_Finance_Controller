import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { BusinessProfile, Expense, BudgetTarget } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ControllerCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile;
  expenses: Expense[];
  budgets: BudgetTarget[];
}

const PRESET_PROMPTS = [
  'Can we afford to hire 2 mid-level engineers next month?',
  'Where did our expenses spike this month?',
  'How can we reduce monthly burn by $3,000?',
  'Which categories are currently over budget?',
  'What is our tax deduction strategy for hardware purchases?',
];

export const ControllerCopilotDrawer: React.FC<ControllerCopilotDrawerProps> = ({
  isOpen,
  onClose,
  business,
  expenses,
  budgets,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Finance Controller. I have real-time access to Beacon Cloud Solutions' ledger ($${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()} MTD spend across ${expenses.length} entries), current cash balance ($${business.currentCashBalance.toLocaleString()}), and active budgets. How can I assist your financial decisions today?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
      const flagged = expenses.filter((e) => e.status === 'flagged');

      const res = await fetch('/api/ai/chat-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          context: {
            businessName: business.name,
            cashBalance: business.currentCashBalance,
            monthlyRevenue: business.monthlyRevenue,
            totalExpenses: Math.round(totalSpent),
            runwayMonths: 24,
            overbudgetCategories: ['Cloud & Software ($1,620 over budget)'],
            flaggedCount: flagged.length,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Apologies, I encountered a temporary connection error. Please try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center space-x-1.5">
              <span>AI Controller Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Fractional CFO advisory powered by live ledger data
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto whitespace-nowrap space-x-1.5 flex text-xs">
        {PRESET_PROMPTS.slice(0, 3).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full transition-colors text-[11px] shrink-0 font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${
              m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              <span
                className={`text-[10px] block mt-1.5 ${
                  m.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 rounded-tl-xs border border-slate-200/60 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Controller is querying live ledger & computing variance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 bg-white"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask your AI Controller (e.g. Can we afford to hire?)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shrink-0 shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
};
