import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Database, 
  Mail, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Eye,
  Calendar
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const AccountantDashboard: React.FC = () => {
  const { 
    currentUser, 
    clients, 
    taxReports, 
    accounting1C, 
    letters, 
    tasks, 
    openClientCard, 
    updateTaxReportStatus, 
    toggle1COborotka, 
    markLetterAsRead, 
    updateTaskStatus,
    setActiveTab 
  } = useCRM();

  // Filter only items assigned to current logged-in accountant
  const myClients = clients.filter(c => c.accountantId === currentUser.id);
  const myClientIds = myClients.map(c => c.id);

  const myReports = taxReports.filter(r => myClientIds.includes(r.clientId) || r.accountantId === currentUser.id);
  const myPendingReports = myReports.filter(r => r.status === 'TOPSHIRILMAGAN');
  const mySubmittedReports = myReports.filter(r => r.status === 'TOPSHIRILDI');

  const my1C = accounting1C.filter(a => myClientIds.includes(a.clientId) || a.accountantId === currentUser.id);
  const myPending1C = my1C.filter(a => a.oborotkaStatus === 'KIRITILMAGAN');

  const myLetters = letters.filter(l => myClientIds.includes(l.clientId) || l.accountantId === currentUser.id);
  const myNewLetters = myLetters.filter(l => l.status === 'YANGI');

  const myTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id) && t.status !== 'BAJARILDI');

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Top Personalized Greeting & Daily Action Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Buxgalter Ish Joyi (High Density)</span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-white">Xush kelibsiz, {currentUser.name}!</h1>
          <p className="text-[11px] text-slate-300">
            Sizga biriktirilgan <strong className="text-white">{myClients.length} ta mijoz</strong> mavjud. Bugungi kun uchun eng muhim vazifalar va hisobotlar:
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Avgust topshirish foizi:</div>
            <div className="text-lg font-extrabold font-mono text-emerald-400">
              {myReports.length > 0 ? Math.round((mySubmittedReports.length / (myReports.length || 1)) * 100) : 100}%
            </div>
          </div>
        </div>
      </div>

      {/* 4 Focus Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Topshirilmagan Hisobotlar */}
        <div className="p-3 bg-white rounded-xl border border-rose-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Qolgan Hisobotlar</span>
            <span className="p-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-[10px]">15-avgustgacha</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-rose-700">{myPendingReports.length} ta</div>
          <p className="text-[10px] text-slate-500">Mijozlaringiz bo'yicha topshirilishi kerak bo'lgan shakllar</p>
        </div>

        {/* 1C Oborotka */}
        <div className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">1C Oborotka Qoldi</span>
            <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold text-[10px]">Bazaga kiritish</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-amber-700">{myPending1C.length} ta</div>
          <p className="text-[10px] text-slate-500">1C ga kiritilmagan korxonalar oborotkasi</p>
        </div>

        {/* Yangi Soliq Xatlari */}
        <div className="p-3 bg-white rounded-xl border border-purple-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Yangi Soliq Xatlari</span>
            <span className="p-1 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold text-[10px]">O'qilmagan</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-purple-700">{myNewLetters.length} ta</div>
          <p className="text-[10px] text-slate-500">O'rganib chiqish va javob tayyorlash talab etiladi</p>
        </div>

        {/* Topshiriqlar */}
        <div className="p-3 bg-white rounded-xl border border-teal-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-700 uppercase">Shaxsiy Vazifalar</span>
            <span className="p-1 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono font-bold text-[10px]">Bajarilmagan</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-teal-700">{myTasks.length} ta</div>
          <p className="text-[10px] text-slate-500">Direktor yoki nazoratchi tomonidan yuklatilgan</p>
        </div>
      </div>

      {/* Main Focus: Action List "Bugun nima qilishim kerak?" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Urgent Reports to Submit */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-xs">Topshirilishi Kerak Bo'lgan Hisobotlar ({myPendingReports.length})</h3>
            </div>
            <button 
              onClick={() => setActiveTab('Hisobotlar')}
              className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Barcha hisobotlar
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {myPendingReports.length === 0 ? (
              <div className="p-4 text-center text-xs text-emerald-700 font-bold">
                🎉 Ajoyib! Barcha hisobotlar muvaffaqiyatli topshirilgan.
              </div>
            ) : (
              myPendingReports.map((report) => (
                <div key={report.id} className="px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div 
                      onClick={() => openClientCard(report.clientId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5 text-xs"
                    >
                      {report.clientName}
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 border border-slate-200 rounded text-slate-600">STIR: {report.stir}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      Shakl: <strong className="text-slate-800">{report.reportType}</strong> hisoboti
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                      className="px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer"
                    >
                      Jarayonda
                    </button>
                    <button
                      onClick={() => updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
                      className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Topshirildi ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Urgent Letters & 1C Entries */}
        <div className="space-y-3.5">
          {/* Unread Letters */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-xs">Yangi Soliq Xatlari ({myNewLetters.length})</h3>
              </div>
              <button 
                onClick={() => setActiveTab('Xatlar')}
                className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Xatlar bo'limi
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {myNewLetters.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-400">Yangi xatlar yo'q</div>
              ) : (
                myNewLetters.map((letter) => (
                  <div key={letter.id} className="px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">{letter.clientName} &bull; <span className="font-mono text-[10px]">{letter.letterNumber}</span></div>
                      <div className="text-slate-500 text-[10px] truncate max-w-xs">{letter.summary}</div>
                    </div>
                    <button
                      onClick={() => markLetterAsRead(letter.id)}
                      className="px-2 py-1 rounded-md bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-700 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Eye className="w-3 h-3" /> O'qidim
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending 1C entries */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-xs">1C Oborotkasi Kiritilmaganlar ({myPending1C.length})</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {myPending1C.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-emerald-700 font-bold">Barcha 1C oborotkalar kiritilgan!</div>
              ) : (
                myPending1C.map((oneC) => (
                  <div key={oneC.id} className="px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">{oneC.clientName}</div>
                      <div className="text-slate-500 text-[10px] font-mono">STIR: {oneC.stir}</div>
                    </div>
                    <button
                      onClick={() => toggle1COborotka(oneC.id)}
                      className="px-2 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer shrink-0"
                    >
                      1C Kiritildi ✓
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Assigned Clients List Strip */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5">
        <h3 className="font-bold text-slate-900 text-xs">Mening Mijozlarim Ro'yxati ({myClients.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {myClients.map((c) => (
            <div
              key={c.id}
              onClick={() => openClientCard(c.id)}
              className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all space-y-1 group"
            >
              <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-xs truncate">{c.name}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>STIR: <strong>{c.stir}</strong></span>
                <span className="px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">{c.taxType}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">Tel: {c.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
