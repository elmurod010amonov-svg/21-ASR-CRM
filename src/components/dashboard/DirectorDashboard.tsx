import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Database, 
  Receipt, 
  CreditCard, 
  Mail, 
  FileSearch, 
  AlertOctagon, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Clock,
  Sparkles,
  Bot,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const DirectorDashboard: React.FC = () => {
  const { 
    clients, 
    taxReports, 
    accounting1C, 
    payments, 
    letters, 
    kameral, 
    issues, 
    tasks, 
    employees, 
    openClientCard, 
    setActiveTab 
  } = useCRM();

  // Metrics calculations
  const totalClients = clients.length;
  const yattClients = clients.filter(c => c.type === 'YATT').length;
  const yuridikClients = clients.filter(c => c.type === 'YURIDIK').length;

  const totalReports = taxReports.filter(r => r.status !== 'TALAB_QILINMAYDI').length;
  const submittedReports = taxReports.filter(r => r.status === 'TOPSHIRILDI').length;
  const pendingReports = taxReports.filter(r => r.status === 'TOPSHIRILMAGAN').length;
  const inProgressReports = taxReports.filter(r => r.status === 'JARAYONDA').length;
  const reportProgressPct = totalReports > 0 ? Math.round((submittedReports / totalReports) * 100) : 0;

  const total1C = accounting1C.length;
  const entered1C = accounting1C.filter(a => a.oborotkaStatus === 'KIRITILGAN').length;
  const missing1C = accounting1C.filter(a => a.oborotkaStatus === 'KIRITILMAGAN').length;

  const totalDebt = payments.reduce((acc, p) => acc + p.debtAmount, 0);
  const debtorCount = payments.filter(p => p.status === 'TOLANMAGAN' || p.status === 'QISMAN').length;

  const newLettersCount = letters.filter(l => l.status === 'YANGI').length;
  const pendingReplyLettersCount = letters.filter(l => l.status === 'JAVOB_KUTILMOQDA').length;

  const activeKameralCount = kameral.filter(k => k.status === 'KAMCHILIK_ANIQLANDI' || k.status === 'OCHIQ').length;
  const openIssuesCount = issues.filter(i => i.status === 'OCHIQ').length;
  const overdueTasksCount = tasks.filter(t => t.status === 'KECHIKDI').length;

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Top Banner with AI Intelligence Quick Insights */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Direktor Boshqaruv Paneli (High Density)</span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-white">Tashkilotning Umumiy Holati & Tahlili</h1>
          <p className="text-[11px] text-slate-300">
            Jami <strong className="text-white">{totalClients} ta mijoz</strong> bo'yicha hisobotlar <strong className="text-emerald-400 font-mono">{reportProgressPct}%</strong> topshirildi. <strong className="text-white">15-avgust</strong> deadlinega qadar <strong className="text-rose-400 font-mono">{pendingReports} ta hisobot</strong> qoldi.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('AI Maslahatchi')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Bot className="w-3.5 h-3.5" /> AI Tahlilchisiga Savol Berish
        </button>
      </div>

      {/* 8 Macro Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Mijozlar */}
        <div 
          onClick={() => setActiveTab('Mijozlar')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mijozlar</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{totalClients}</span>
            <span className="text-[10px] text-slate-400 font-medium">tashkilot</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 font-mono">
            <span>YaTT: <strong className="text-amber-700">{yattClients}</strong></span>
            <span>&bull;</span>
            <span>Yuridik: <strong className="text-blue-700">{yuridikClients}</strong></span>
          </div>
        </div>

        {/* Hisobotlar */}
        <div 
          onClick={() => setActiveTab('Hisobotlar')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hisobotlar</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{submittedReports} / {totalReports}</span>
            <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">{reportProgressPct}%</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] pt-1.5 border-t border-slate-100 font-mono">
            <span className="text-emerald-700 font-bold">🟢 {submittedReports}</span>
            <span className="text-amber-700 font-bold">🟡 {inProgressReports}</span>
            <span className="text-rose-700 font-bold">🔴 {pendingReports}</span>
          </div>
        </div>

        {/* 1C Oborotka */}
        <div 
          onClick={() => setActiveTab('1C')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1C Oborotka</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Database className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{entered1C} / {total1C}</span>
            <span className="text-[10px] text-slate-400 font-medium">kiritildi</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 font-mono">
            <span className="text-emerald-700 font-semibold">🟢 {entered1C}</span>
            <span>&bull;</span>
            <span className="text-rose-700 font-semibold">🔴 Qolgan: {missing1C}</span>
          </div>
        </div>

        {/* To‘lovlar & Qarz */}
        <div 
          onClick={() => setActiveTab('To‘lovlar')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">To‘lov & Qarz</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-rose-600 font-mono">{totalDebt.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">so'm</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            <span>Qarzdorlar:</span>
            <span className="font-bold font-mono text-rose-700">{debtorCount} ta</span>
          </div>
        </div>

        {/* Soliq Xatlari */}
        <div 
          onClick={() => setActiveTab('Xatlar')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Soliq Xatlari</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Mail className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{letters.length}</span>
            <span className="text-[10px] text-purple-700 font-bold">({newLettersCount} yangi)</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            Javob kutilmoqda: <strong className="text-amber-700 font-mono">{pendingReplyLettersCount} ta</strong>
          </div>
        </div>

        {/* Kameral Tekshiruvlar */}
        <div 
          onClick={() => setActiveTab('Kameral')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kameral Nazorat</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <FileSearch className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-rose-700 font-mono">{kameral.length}</span>
            <span className="text-[10px] text-slate-400">tekshiruv</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            Muammoli: <strong className="text-rose-700 font-mono">{activeKameralCount} ta</strong>
          </div>
        </div>

        {/* Kamchiliklar */}
        <div 
          onClick={() => setActiveTab('Kamchiliklar')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-orange-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kamchiliklar</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600 group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{issues.length}</span>
            <span className="text-[10px] text-orange-700 font-bold font-mono">({openIssuesCount} ochiq)</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            Tuzatilgan: <strong className="text-emerald-700 font-mono">{issues.filter(i => i.status === 'TUZATILDI').length} ta</strong>
          </div>
        </div>

        {/* Topshiriqlar & Kechikishlar */}
        <div 
          onClick={() => setActiveTab('Topshiriqlar')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Topshiriqlar</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{tasks.length}</span>
            <span className="text-[10px] text-emerald-700 font-bold font-mono">({tasks.filter(t => t.status === 'BAJARILDI').length} bajarildi)</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            Kechikkan: <strong className="text-rose-700 font-mono">{overdueTasksCount} ta</strong>
          </div>
        </div>
      </div>

      {/* Staff Performance & Workload Matrix Section (Prompt Section 35) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Xodimlar Nazorati va Yuklamasi</h3>
            <p className="text-[10px] text-slate-500">Har bir buxgalterning mijozlar soni, hisobot topshirish foizi va kechikkan ishlari</p>
          </div>
          <button 
            onClick={() => setActiveTab('Xodimlar')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {employees.map((emp) => {
            const empClients = clients.filter(c => c.accountantId === emp.id);
            const empReports = taxReports.filter(r => r.accountantId === emp.id && r.status !== 'TALAB_QILINMAYDI');
            const empSubmittedReports = empReports.filter(r => r.status === 'TOPSHIRILDI').length;
            const empRate = empReports.length > 0 ? Math.round((empSubmittedReports / empReports.length) * 100) : emp.reportCompletionRate;
            const empPendingTasks = tasks.filter(t => t.assigneeIds.includes(emp.id) && t.status !== 'BAJARILDI').length;

            return (
              <div key={emp.id} className="px-4 py-2.5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{emp.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {emp.position}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>Biriktirilgan mijozlar: <strong className="text-slate-800 font-mono">{empClients.length || emp.assignedClientCount}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono">{emp.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Completion Rate Progress bar */}
                  <div className="w-32 space-y-1">
                    <div className="flex justify-between font-bold text-[10px]">
                      <span className="text-slate-600">Hisobot:</span>
                      <span className={`font-mono ${empRate >= 95 ? 'text-emerald-700' : empRate >= 80 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {empRate}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          empRate >= 95 ? 'bg-emerald-500' : empRate >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${empRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tasks count */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 leading-none">Vazifalar:</div>
                    <div className="font-bold font-mono text-slate-900 text-xs">{empPendingTasks} ta</div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('AI Maslahatchi');
                    }}
                    className="px-2.5 py-1 rounded-md border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 text-[11px] font-semibold cursor-pointer"
                  >
                    Topshiriq
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
