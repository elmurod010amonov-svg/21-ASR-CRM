import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  HelpCircle,
  RefreshCw,
  Zap,
  Building2
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { AIAgentRole } from '../../types';

interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  agentRole?: AIAgentRole;
  actionProposal?: {
    type: string;
    description: string;
    payload: any;
  };
}

export const AIAssistantView: React.FC = () => {
  const { 
    clients, 
    taxReports, 
    payments, 
    letters, 
    kameral, 
    tasks, 
    employees, 
    createTask, 
    currentUser 
  } = useCRM();

  const [selectedAgent, setSelectedAgent] = useState<AIAgentRole>('SOLIQ_MASLAHATCHISI');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Assalomu alaykum! Men 21-ASR CRM sun'iy intellekt maslahatchisiman. Soliq hisobotlari, O'zbekiston Soliq Kodeksi, kameral tushuntirish xatlari, 1C oborotka va jamoa nazorati bo'yicha yordam berishga tayyorman. Qanday vazifa bajaramiz?",
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      agentRole: 'SOLIQ_MASLAHATCHISI'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents: { id: AIAgentRole; title: string; desc: string; icon: string }[] = [
    { id: 'SOLIQ_MASLAHATCHISI', title: 'Soliq Maslahatchisi', desc: 'Soliq kodeksi, stavkalar, imtiyozlar', icon: '⚖️' },
    { id: 'KAMERAL_TAHLILCHI', title: 'Kameral Tahlilchi', desc: 'Xatlarni tahlil qilish, tushuntirish xati', icon: '🔍' },
    { id: 'BUXGALTERIYA_AUDITANTI', title: 'Buxgalteriya Auditanti', desc: '1C provodkalar, oborotka nazorati', icon: '📊' },
    { id: 'HISOBOT_TEKSHIRUVCHI', title: 'Hisobot Nazoratchisi', desc: 'QQS, Foyda, Aylanma soliq hisobotlari', icon: '📑' },
    { id: 'XODIMLAR_NAZORATCHISI', title: 'Xodimlar Nazorati', desc: 'Buxgalterlar yuklamasi va intizomi', icon: '👥' },
    { id: 'MIJOZ_TAHLILCHISI', title: 'Mijoz 360° Tahlili', desc: 'Qarzdorlik, shartnomalar va risklar', icon: '🏢' },
    { id: 'TOPSHIRIQ_MENEJERI', title: 'Topshiriq Menejeri', desc: 'Vazifalar taqsimlash va avtomatlashtirish', icon: '✅' },
    { id: 'EXCEL_HISOBOT_TAHLILCHI', title: 'Excel / Baza Tahlilchi', desc: 'Ma\'lumotlar strukturasi tekshiruvi', icon: '📈' },
  ];

  const quickPrompts = [
    "Avgust oyining qolgan soliq hisobotlarini tahlil qil va kimlar kechikayotganini aniqlab ber.",
    "Kameral tekshiruvlar bo'yicha tushuntirish xati shablonini tayyorla.",
    "Eng ko'p qarzdor mijozlar ro'yxati va ularga ogohlantirish xabari matni.",
    "1C oborotkasi kiritilmagan korxonalarga shoshilinch topshiriq shakllantir.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  const handleSend = async (customText?: string) => {
    const query = (customText || inputText).trim();
    if (!query || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setLoading(true);

    try {
      // Build CRM Context payload to feed to Gemini
      const crmContext = {
        totalClients: clients.length,
        totalTaxReports: taxReports.length,
        submittedReports: taxReports.filter(r => r.status === 'TOPSHIRILDI').length,
        pendingReports: taxReports.filter(r => r.status === 'TOPSHIRILMAGAN').length,
        totalDebt: payments.reduce((acc, p) => acc + p.debtAmount, 0),
        debtorClients: payments.filter(p => p.debtAmount > 0).map(p => ({ name: p.clientName, debt: p.debtAmount })),
        unreadLettersCount: letters.filter(l => l.status === 'YANGI').length,
        activeKameralCount: kameral.filter(k => k.status === 'OCHIQ' || k.status === 'KAMCHILIK_ANIQLANDI').length,
        currentEmployees: employees.map(e => ({ name: e.name, position: e.position })),
        activePeriod: 'Avgust 2026',
        currentUser: { name: currentUser.name, role: currentUser.role }
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          agentRole: selectedAgent,
          crmContext,
        })
      });

      const data = await response.json();

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "Javob olishda texnik xatolik yuz berdi.",
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        agentRole: selectedAgent,
      };

      // Check if AI suggested creating a task
      if (query.toLowerCase().includes('topshiriq') || query.toLowerCase().includes('vazifa')) {
        aiMsg.actionProposal = {
          type: 'CREATE_TASK',
          description: "Topshirilmagan hisobotlar bo'yicha barcha buxgalterlarga shoshilinch vazifa yaratish",
          payload: {
            title: "Avgust oyi soliq hisobotlarini 15-avgustgacha to'liq yakunlash",
            deadlineDate: "2026-08-15",
            assigneeIds: employees.map(e => e.id)
          }
        };
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "Kechirasiz, sun'iy intellekt serveriga ulanishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          agentRole: selectedAgent,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = (proposal: any) => {
    if (proposal.type === 'CREATE_TASK') {
      createTask({
        title: proposal.payload.title,
        description: "AI Maslahatchi taklifiga binoan yaratilgan vazifa",
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        assigneeIds: proposal.payload.assigneeIds,
        assigneeNames: employees.map(e => e.name),
        deadlineDate: proposal.payload.deadlineDate,
        priority: 'SHOSHILINCH',
        status: 'YANGI',
      });

      setMessages(prev => [
        ...prev,
        {
          id: `ai-conf-${Date.now()}`,
          sender: 'ai',
          text: "✅ Topshiriq muvaffaqiyatli yaratildi va mas'ul buxgalterlar 'Topshiriqlar' bo'limiga yuborildi!",
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          agentRole: selectedAgent,
        }
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-200">
      {/* Left Sidebar: 8 AI Agent Roles */}
      <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400">21-ASR AI Markazi</h2>
              <div className="text-[11px] text-slate-300 font-medium">8 ta Ixtisoslashgan Agent</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {agents.map((agent) => {
            const isSelected = selectedAgent === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{agent.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{agent.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Area: Conversation history & input */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Active Agent Header */}
        <div className="p-3.5 px-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">
                {agents.find(a => a.id === selectedAgent)?.title}
              </div>
              <div className="text-[10px] text-slate-500">
                {agents.find(a => a.id === selectedAgent)?.desc}
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Gemini 3.7 Pro Faol
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Tezkor:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                }`}>
                  {isUser ? currentUser.name[0] : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-slate-900 text-white rounded-tr-xs' 
                      : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs whitespace-pre-wrap'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Tool Action Confirmation Dialog (Prompt section 52) */}
                  {msg.actionProposal && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs text-emerald-950 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        AI Harakatini Tasdiqlash
                      </div>
                      <p className="text-[11px] text-emerald-800">{msg.actionProposal.description}</p>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmAction(msg.actionProposal)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Tasdiqlayman va Yarataman ✓
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-white rounded-2xl rounded-tl-xs border border-slate-200 shadow-2xs flex items-center gap-2 text-xs text-slate-500 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                21-ASR AI tahlil qilmoqda va hisob-kitob bajarmoqda...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Soliq, hisobotlar, xatlar yoki 1C bo'yicha savol bering..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
