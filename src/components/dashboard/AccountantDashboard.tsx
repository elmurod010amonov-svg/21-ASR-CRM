import React from 'react';
import {
  Building2,
  FileSpreadsheet,
  Database,
  Mail,
  CheckSquare,
  Eye,
  Calendar,
  Sparkles,
  Trophy,
  Gift as GiftIcon
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { isOborotkaActive, getTodayISO, isSubjectTo1C } from '../../utils/oborotka';
import { RingStat, MiniBars } from './MiniCharts';

export const AccountantDashboard: React.FC = () => {
  const {
    currentUser,
    clients,
    taxReports,
    accounting1C,
    letters,
    tasks,
    employees,
    openClientCard,
    updateTaxReportStatus,
    toggle1COborotka,
    markLetterAsRead,
    setActiveTab
  } = useCRM();

  // Filter only items assigned to current logged-in accountant
  const myClients = clients.filter(c => c.accountantId === currentUser.id);
  const myClientIds = myClients.map(c => c.id);
  const myYattClients = myClients.filter(c => c.type === 'YATT').length;
  const myYuridikClients = myClients.filter(c => c.type === 'YURIDIK').length;
  const myYuridikSharePct = myClients.length > 0 ? Math.round((myYuridikClients / myClients.length) * 100) : 0;

  const myReports = taxReports.filter(r => myClientIds.includes(r.clientId) || r.accountantId === currentUser.id);
  const myPendingReports = myReports.filter(r => r.status === 'TOPSHIRILMAGAN');
  const myInProgressReports = myReports.filter(r => r.status === 'JARAYONDA');
  const mySubmittedReports = myReports.filter(r => r.status === 'TOPSHIRILDI');
  const myReportsPct = myReports.length > 0 ? Math.round((mySubmittedReports.length / myReports.length) * 100) : 100;

  const my1C = accounting1C.filter(a => {
    const matchesMine = myClientIds.includes(a.clientId) || a.accountantId === currentUser.id;
    if (!matchesMine) return false;
    const client = clients.find(c => c.id === a.clientId);
    return client ? isSubjectTo1C(client.monthlyFee) : false;
  });
  const myPending1C = my1C.filter(a => !isOborotkaActive(a));
  const myEntered1C = my1C.filter(a => isOborotkaActive(a));
  const my1CPct = my1C.length > 0 ? Math.round((myEntered1C.length / my1C.length) * 100) : 100;

  const myLetters = letters.filter(l => myClientIds.includes(l.clientId) || l.accountantId === currentUser.id);
  const myNewLetters = myLetters.filter(l => l.status === 'YANGI');

  const myTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id) && t.status !== 'BAJARILDI');
  const myOverdueTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id) && t.status === 'KECHIKDI');

  const ratingRanked = [...employees].sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name));
  const myRank = ratingRanked.findIndex(e => e.id === currentUser.id);
  const myEmployee = ratingRanked[myRank];

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Top Banner (mirrors Direktor Boshqaruv Paneli high-density style) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white text-slate-900 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Buxgalter Ish Joyi (High Density)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Xush kelibsiz, {currentUser.name}!</h1>
          <p className="text-xs font-extrabold text-slate-800">
            Sizga biriktirilgan <strong className="text-slate-900">{myClients.length} ta mijoz</strong> bo'yicha hisobotlar <strong className="text-emerald-600 font-mono">{myReportsPct}%</strong> topshirildi. <strong className="text-slate-900">15-avgust</strong> deadlinega qadar <strong className="text-rose-600 font-mono">{myPendingReports.length} ta hisobot</strong> qoldi.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('Xodimlar')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Trophy className="w-3.5 h-3.5" /> Reytingdagi o'rnim: {myRank >= 0 ? myRank + 1 : '—'}
        </button>
      </div>

      {/* 6 Macro Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {/* Mijozlarim */}
        <div
          onClick={() => setActiveTab('Mijozlar')}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Mijozlarim</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{myClients.length}</span>
              <span className="text-[11px] text-slate-800 font-extrabold">tashkilot</span>
            </div>
            <div className="text-emerald-600">
              <RingStat percent={myYuridikSharePct} color="currentColor" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200 font-mono">
            <span>YaTT: <strong className="text-amber-600">{myYattClients}</strong></span>
            <span>&bull;</span>
            <span>Yuridik: <strong className="text-blue-600">{myYuridikClients}</strong></span>
          </div>
        </div>

        {/* Hisobotlar */}
        <div
          onClick={() => setActiveTab('Hisobotlar')}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Hisobotlar</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="block text-xl font-extrabold text-slate-900 font-mono">{mySubmittedReports.length} / {myReports.length}</span>
              <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-700 px-1.5 py-0.2 rounded">{myReportsPct}%</span>
            </div>
            <MiniBars
              segments={[
                { value: mySubmittedReports.length, color: '#059669' },
                { value: myInProgressReports.length, color: '#d97706' },
                { value: myPendingReports.length, color: '#e11d48' },
              ]}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] pt-1.5 border-t border-slate-200 font-mono">
            <span className="text-emerald-600 font-bold">🟢 {mySubmittedReports.length}</span>
            <span className="text-amber-600 font-bold">🟡 {myInProgressReports.length}</span>
            <span className="text-rose-600 font-bold">🔴 {myPendingReports.length}</span>
          </div>
        </div>

        {/* 1C Oborotka */}
        <div
          onClick={() => setActiveTab('1C')}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">1C Oborotka</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Database className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{myEntered1C.length} / {my1C.length}</span>
              <span className="text-[10px] text-slate-600 font-medium">kiritildi</span>
            </div>
            <div className="text-emerald-600">
              <RingStat percent={my1CPct} color="currentColor" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200 font-mono">
            <span className="text-emerald-600 font-semibold">🟢 {myEntered1C.length}</span>
            <span>&bull;</span>
            <span className="text-rose-600 font-semibold">🔴 Qolgan: {myPending1C.length}</span>
          </div>
        </div>

        {/* Soliq Xatlari */}
        <div
          onClick={() => setActiveTab('Xatlar')}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Soliq Xatlari</span>
            <span className="p-1.5 rounded-lg bg-purple-900/50 text-purple-600 group-hover:scale-105 transition-transform">
              <Mail className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{myLetters.length}</span>
            <span className="text-[10px] text-purple-600 font-bold">({myNewLetters.length} yangi)</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
            O'qish kerak: <strong className="text-amber-600 font-mono">{myNewLetters.length} ta</strong>
          </div>
        </div>

        {/* Shaxsiy Vazifalar */}
        <div
          onClick={() => setActiveTab('Topshiriqlar')}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Vazifalarim</span>
            <span className="p-1.5 rounded-lg bg-teal-900/50 text-teal-600 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{myTasks.length}</span>
            <span className="text-[10px] text-slate-600">ta bajarilmagan</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
            Kechikkan: <strong className="text-rose-600 font-mono">{myOverdueTasks.length} ta</strong>
          </div>
        </div>

        {/* Mening Reytingim */}
        <div
          onClick={() => setActiveTab('Xodimlar')}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Reytingim</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Trophy className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-purple-700 font-mono">{myEmployee?.rating || 0}</span>
            <span className="text-[10px] text-slate-600">ball</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200 font-mono">
            <span>O'rin: <strong className="text-purple-700">{myRank >= 0 ? myRank + 1 : '—'}</strong></span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1"><GiftIcon className="w-3 h-3 text-purple-500" /> {myEmployee?.giftsReceived || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Focus: Action List "Bugun nima qilishim kerak?" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Urgent Reports to Submit */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-xs">Topshirilishi Kerak Bo'lgan Hisobotlar ({myPendingReports.length})</h3>
            </div>
            <button
              onClick={() => setActiveTab('Hisobotlar')}
              className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
            >
              Barcha hisobotlar
            </button>
          </div>

          <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
            {myPendingReports.length === 0 ? (
              <div className="p-4 text-center text-xs text-emerald-600 font-bold">
                🎉 Ajoyib! Barcha hisobotlar muvaffaqiyatli topshirilgan.
              </div>
            ) : (
              myPendingReports.map((report) => (
                <div key={report.id} className="px-3.5 py-2 hover:bg-slate-100/50 transition-colors flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div
                      onClick={() => openClientCard(report.clientId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5 text-xs"
                    >
                      {report.clientName}
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 border border-slate-300 rounded text-slate-700">STIR: {report.stir}</span>
                    </div>
                    <div className="text-slate-600 text-[10px] mt-0.5">
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-xs">Yangi Soliq Xatlari ({myNewLetters.length})</h3>
              </div>
              <button
                onClick={() => setActiveTab('Xatlar')}
                className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Xatlar bo'limi
              </button>
            </div>

            <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto">
              {myNewLetters.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-600">Yangi xatlar yo'q</div>
              ) : (
                myNewLetters.map((letter) => (
                  <div key={letter.id} className="px-3.5 py-2 hover:bg-slate-100/50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">{letter.clientName} &bull; <span className="font-mono text-[10px]">{letter.letterNumber}</span></div>
                      <div className="text-slate-600 text-[10px] truncate max-w-xs">{letter.summary}</div>
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-xs">1C Oborotkasi Kiritilmaganlar ({myPending1C.length})</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto">
              {myPending1C.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-emerald-600 font-bold">Barcha 1C oborotkalar kiritilgan!</div>
              ) : (
                myPending1C.map((oneC) => (
                  <div key={oneC.id} className="px-3.5 py-2 hover:bg-slate-100/50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-[11px]">{oneC.clientName}</div>
                      <div className="text-slate-600 text-[10px] font-mono">STIR: {oneC.stir}</div>
                    </div>
                    <button
                      onClick={() => toggle1COborotka(oneC.id, getTodayISO())}
                      className="px-2 py-1 rounded-md bg-black text-white font-bold text-[10px] hover:bg-neutral-800 cursor-pointer shrink-0"
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-2.5">
        <h3 className="font-bold text-slate-900 text-xs">Mening Mijozlarim Ro'yxati ({myClients.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {myClients.map((c) => (
            <div
              key={c.id}
              onClick={() => openClientCard(c.id)}
              className="p-2.5 rounded-lg border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all space-y-1 group"
            >
              <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-xs truncate">{c.name}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
                <span>STIR: <strong className="text-slate-800">{c.stir}</strong></span>
                <span className="px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-800 border border-slate-300">{c.taxType}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate font-mono">Tel: {c.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
